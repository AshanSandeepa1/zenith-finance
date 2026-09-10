"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Currency, TransactionCategory } from "@prisma/client";

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  currency: z.nativeEnum(Currency),
  category: z.nativeEnum(TransactionCategory),
  description: z.string().max(200).optional(),
  isRecurring: z.boolean().default(false),
  date: z.coerce.date().optional(),
});

export async function createTransaction(input: z.infer<typeof createTransactionSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = createTransactionSchema.parse(input);

  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      amount: parsed.amount,
      currency: parsed.currency,
      category: parsed.category,
      description: parsed.description,
      isRecurring: parsed.isRecurring,
      date: parsed.date ?? new Date(),
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
