"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GoalType } from "@prisma/client";

function nextTargetDate(remaining: number, monthlyContribution: number): Date | null {
  if (monthlyContribution <= 0) return null;
  const monthsNeeded = Math.ceil(Math.max(remaining, 0) / monthlyContribution);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + monthsNeeded, 1);
}

const goalSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  category: z.string().min(1).max(50),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).default(0),
  monthlyContribution: z.number().min(0).default(0),
});

export async function createGoal(input: z.infer<typeof goalSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = goalSchema.parse(input);
  const targetDate = nextTargetDate(
    parsed.targetAmount - parsed.currentAmount,
    parsed.monthlyContribution
  );

  await prisma.goal.create({
    data: {
      userId: session.user.id,
      type: GoalType.GENERAL,
      targetDate,
      ...parsed,
    },
  });

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
}

export async function updateGoal(id: string, input: z.infer<typeof goalSchema>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.user.id) throw new Error("Not found");
  if (goal.type === GoalType.EMERGENCY_FUND) {
    throw new Error("Use the Emergency Fund card to edit its target");
  }

  const parsed = goalSchema.parse(input);
  const targetDate = nextTargetDate(
    parsed.targetAmount - parsed.currentAmount,
    parsed.monthlyContribution
  );

  await prisma.goal.update({
    where: { id },
    data: { ...parsed, targetDate },
  });

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
}

export async function deleteGoal(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.user.id) throw new Error("Not found");
  if (goal.type === GoalType.EMERGENCY_FUND) {
    throw new Error("The Emergency Fund goal can't be deleted");
  }

  await prisma.goal.delete({ where: { id } });

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
}

export async function updateGoalContribution(id: string, monthlyContribution: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.user.id) throw new Error("Not found");
  if (goal.type === GoalType.EMERGENCY_FUND) {
    throw new Error("Use the Emergency Fund card to edit its contribution");
  }

  const targetDate = nextTargetDate(goal.targetAmount - goal.currentAmount, monthlyContribution);

  await prisma.goal.update({
    where: { id },
    data: { monthlyContribution, targetDate },
  });

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
}

export async function updateEmergencyFundTarget(targetAmount: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const goal = await prisma.goal.findFirst({
    where: { userId: session.user.id, type: GoalType.EMERGENCY_FUND },
  });
  if (!goal) throw new Error("Emergency fund goal not found");

  await prisma.goal.update({
    where: { id: goal.id },
    data: { targetAmount: Math.max(targetAmount, 0) },
  });

  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard");
}
