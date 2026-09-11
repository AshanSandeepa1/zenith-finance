"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CategoryType } from "@prisma/client";
import { ICON_OPTIONS } from "@/lib/category-icons";
import { CATEGORY_COLORS } from "@/lib/category-colors";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  icon: z.enum(ICON_OPTIONS),
  color: z.enum(CATEGORY_COLORS),
  type: z.nativeEnum(CategoryType),
  budgetMonthly: z.number().positive().nullable().optional(),
});

export type CategoryFormInput = z.infer<typeof categorySchema>;

export async function createCategory(input: z.infer<typeof categorySchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = categorySchema.parse(input);

  await prisma.category.create({
    data: { userId: session.user.id, ...parsed },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
}

export async function updateCategory(id: string, input: z.infer<typeof categorySchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || category.userId !== session.user.id) throw new Error("Not found");

  const parsed = categorySchema.parse(input);

  await prisma.category.update({
    where: { id },
    data: parsed,
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category || category.userId !== session.user.id) throw new Error("Not found");

  const inUse = await prisma.transaction.count({ where: { categoryId: id } });
  if (inUse > 0) {
    throw new Error(
      `Can't delete "${category.name}" — ${inUse} transaction${inUse === 1 ? "" : "s"} still use it. Reassign or delete them first.`
    );
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
}
