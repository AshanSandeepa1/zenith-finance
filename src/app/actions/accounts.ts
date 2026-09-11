"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ACCOUNT_TYPES = ["SAVINGS", "CHECKING", "CASH", "WALLET", "INVESTMENT", "OTHER"] as const;

// Scoped to USD/LKR for now — see transactions.ts for why.
const accountSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  type: z.enum(ACCOUNT_TYPES),
  balance: z.number(),
  currency: z.enum(["USD", "LKR"]),
});

export async function createFinancialAccount(input: z.infer<typeof accountSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = accountSchema.parse(input);

  await prisma.financialAccount.create({
    data: { userId: session.user.id, ...parsed },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export async function updateFinancialAccount(id: string, input: z.infer<typeof accountSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const account = await prisma.financialAccount.findUnique({ where: { id } });
  if (!account || account.userId !== session.user.id) throw new Error("Not found");

  const parsed = accountSchema.parse(input);

  await prisma.financialAccount.update({
    where: { id },
    data: parsed,
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export async function deleteFinancialAccount(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const account = await prisma.financialAccount.findUnique({ where: { id } });
  if (!account || account.userId !== session.user.id) throw new Error("Not found");

  await prisma.financialAccount.delete({ where: { id } });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
