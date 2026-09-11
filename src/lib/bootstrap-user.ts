import { prisma } from "@/lib/prisma";
import { GoalType } from "@prisma/client";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

// Runs once per new user — via the credentials registration action, and via
// Auth.js's `events.createUser` for OAuth sign-ups (src/auth.ts) — so every
// account starts with usable data instead of relying on prisma/seed.ts.
export async function bootstrapNewUser(userId: string) {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({
      userId,
      name: c.name,
      icon: c.icon,
      color: c.color,
      type: c.type,
      isDefault: true,
    })),
  });

  await prisma.goal.create({
    data: {
      userId,
      name: "Emergency Fund",
      category: "Safety Net",
      type: GoalType.EMERGENCY_FUND,
      targetAmount: 0,
      currentAmount: 0,
      monthlyContribution: 0,
    },
  });
}
