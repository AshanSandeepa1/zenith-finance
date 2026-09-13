"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const importRowSchema = z.object({
  date: z.coerce.date(),
  amount: z.number().finite(),
  description: z.string().max(200).optional(),
  categoryName: z.string().optional(),
});

const importInputSchema = z.object({
  currency: z.enum(["USD", "LKR"]),
  rows: z.array(importRowSchema).min(1).max(5000),
});

export type ImportRowInput = z.infer<typeof importRowSchema>;

export async function importTransactions(input: z.infer<typeof importInputSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const parsed = importInputSchema.parse(input);

  const categories = await prisma.category.findMany({ where: { userId } });
  const byNameLower = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));
  const otherCategory = categories.find((c) => c.name.toLowerCase() === "other");
  const fallbackCategoryId = otherCategory?.id ?? categories[0]?.id ?? null;

  const data = parsed.rows.map((row) => ({
    userId,
    date: row.date,
    amount: Math.abs(row.amount),
    currency: parsed.currency,
    description: row.description,
    categoryId:
      (row.categoryName && byNameLower.get(row.categoryName.toLowerCase())) ||
      fallbackCategoryId,
  }));

  const result = await prisma.transaction.createMany({ data });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");

  return { imported: result.count };
}
