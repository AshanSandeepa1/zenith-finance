"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Scoped to USD/LKR for now — the full curated currency list (src/lib/currencies.ts)
// becomes selectable here once Phase 3 wires live multi-pair FX conversion.
const transactionSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(["USD", "LKR"]),
  categoryId: z.string().min(1, "Category is required"),
  financialAccountId: z.string().optional(),
  description: z.string().max(200).optional(),
  isRecurring: z.boolean().default(false),
  date: z.coerce.date().optional(),
});

async function assertCategoryOwnership(categoryId: string, userId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category || category.userId !== userId) throw new Error("Invalid category");
}

export async function createTransaction(input: z.infer<typeof transactionSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = transactionSchema.parse(input);
  await assertCategoryOwnership(parsed.categoryId, session.user.id);

  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      amount: parsed.amount,
      currency: parsed.currency,
      categoryId: parsed.categoryId,
      financialAccountId: parsed.financialAccountId || null,
      description: parsed.description,
      isRecurring: parsed.isRecurring,
      date: parsed.date ?? new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
}

export async function updateTransaction(id: string, input: z.infer<typeof transactionSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction || transaction.userId !== session.user.id) throw new Error("Not found");

  const parsed = transactionSchema.parse(input);
  await assertCategoryOwnership(parsed.categoryId, session.user.id);

  await prisma.transaction.update({
    where: { id },
    data: {
      amount: parsed.amount,
      currency: parsed.currency,
      categoryId: parsed.categoryId,
      financialAccountId: parsed.financialAccountId || null,
      description: parsed.description,
      isRecurring: parsed.isRecurring,
      date: parsed.date ?? transaction.date,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction || transaction.userId !== session.user.id) throw new Error("Not found");

  await prisma.transaction.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
}
