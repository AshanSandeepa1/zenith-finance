import { prisma } from "@/lib/prisma";

export type HealthScoreComponent = {
  label: string;
  value: number; // 0-100
  weight: number; // normalized, sums to 1 across included components
};

export type HealthScoreResult = {
  score: number; // 0-100, rounded
  breakdown: HealthScoreComponent[];
};

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

// Each component is only included when it's actually computable (e.g. no
// income yet, or no goals yet) — weights are renormalized across whatever
// components apply, so a brand-new account isn't punished for missing data.
export function computeHealthScore({
  monthlyGrossIncomeLKR,
  netCashflowSurplusLKR,
  liquidSavingsLKR,
  emergencyFundTargetLKR,
  totalMonthlyDebtLKR,
  generalGoalProgress,
}: {
  monthlyGrossIncomeLKR: number;
  netCashflowSurplusLKR: number;
  liquidSavingsLKR: number;
  emergencyFundTargetLKR: number;
  totalMonthlyDebtLKR: number;
  generalGoalProgress: number[]; // each 0-1
}): HealthScoreResult {
  const components: HealthScoreComponent[] = [];

  if (monthlyGrossIncomeLKR > 0) {
    const savingsRate = clamp01(netCashflowSurplusLKR / monthlyGrossIncomeLKR);
    components.push({ label: "Savings rate", value: savingsRate * 100, weight: 0.3 });

    const debtScore = clamp01(1 - totalMonthlyDebtLKR / monthlyGrossIncomeLKR);
    components.push({ label: "Debt-to-income", value: debtScore * 100, weight: 0.25 });
  }

  if (emergencyFundTargetLKR > 0) {
    const efScore = clamp01(liquidSavingsLKR / emergencyFundTargetLKR);
    components.push({ label: "Emergency fund coverage", value: efScore * 100, weight: 0.25 });
  }

  if (generalGoalProgress.length > 0) {
    const avg =
      generalGoalProgress.reduce((sum, p) => sum + clamp01(p), 0) / generalGoalProgress.length;
    components.push({ label: "Goal progress", value: avg * 100, weight: 0.2 });
  }

  if (components.length === 0) {
    return { score: 0, breakdown: [] };
  }

  const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const normalized = components.map((c) => ({ ...c, weight: c.weight / totalWeight }));
  const score = Math.round(normalized.reduce((sum, c) => sum + c.value * c.weight, 0));

  return { score, breakdown: normalized };
}

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Called from the Overview page only (not from every getDashboardData
// consumer) so we don't write on every page load across the app.
export async function recordHealthScoreSnapshot(userId: string, score: number) {
  const yearMonth = currentYearMonth();
  await prisma.healthScoreSnapshot.upsert({
    where: { userId_yearMonth: { userId, yearMonth } },
    create: { userId, yearMonth, score },
    update: { score },
  });
}

export async function getHealthScoreHistory(userId: string, months = 6) {
  const snapshots = await prisma.healthScoreSnapshot.findMany({
    where: { userId },
    orderBy: { yearMonth: "desc" },
    take: months,
  });
  return snapshots.reverse();
}
