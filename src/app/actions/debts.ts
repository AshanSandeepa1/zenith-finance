"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DebtStatus } from "@prisma/client";

const createDebtSchema = z.object({
  vendor: z.string().min(1).max(100),
  itemName: z.string().min(1).max(150),
  totalAmount: z.number().positive(),
  monthlyInstallment: z.number().positive(),
  remainingMonths: z.number().int().min(0),
  expiryDate: z.coerce.date(),
});

function statusFromRemainingMonths(remainingMonths: number): DebtStatus {
  if (remainingMonths <= 0) return DebtStatus.CLEARED;
  if (remainingMonths === 1) return DebtStatus.EXPIRING_THIS_MONTH;
  return DebtStatus.ACTIVE;
}

export async function createDebtTracker(input: z.infer<typeof createDebtSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = createDebtSchema.parse(input);

  await prisma.debtTracker.create({
    data: {
      userId: session.user.id,
      ...parsed,
      status: statusFromRemainingMonths(parsed.remainingMonths),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
}

export async function updateDebtRemainingMonths(id: string, remainingMonths: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const debt = await prisma.debtTracker.findUnique({ where: { id } });
  if (!debt || debt.userId !== session.user.id) throw new Error("Not found");

  await prisma.debtTracker.update({
    where: { id },
    data: {
      remainingMonths,
      status: statusFromRemainingMonths(remainingMonths),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
}
