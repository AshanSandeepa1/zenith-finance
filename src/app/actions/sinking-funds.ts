"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateContributionSchema = z.object({
  id: z.string(),
  monthlyContribution: z.number().min(0),
});

export async function updateSinkingFundContribution(input: z.infer<typeof updateContributionSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { id, monthlyContribution } = updateContributionSchema.parse(input);

  const fund = await prisma.sinkingFund.findUnique({ where: { id } });
  if (!fund || fund.userId !== session.user.id) throw new Error("Not found");

  const remaining = Math.max(fund.targetAmount - fund.currentAmount, 0);
  const monthsNeeded = monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : null;
  const targetDate = monthsNeeded
    ? new Date(new Date().getFullYear(), new Date().getMonth() + monthsNeeded, 1)
    : null;

  await prisma.sinkingFund.update({
    where: { id },
    data: { monthlyContribution, targetDate },
  });

  revalidatePath("/dashboard/sinking-funds");
  revalidatePath("/dashboard");
}
