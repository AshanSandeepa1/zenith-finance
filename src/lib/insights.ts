import { prisma } from "@/lib/prisma";
import { convertCurrency } from "@/lib/currency";
import { GoalType, DebtStatus } from "@prisma/client";

export type Insight = {
  id: string;
  tone: "positive" | "warning" | "neutral";
  text: string;
};

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// Rule-based, computed fresh per request — no persistence, no LLM. Compares
// this month's category spend against the trailing 3-month average, flags
// goal milestones and debts about to clear, and calls out the cashflow trend
// vs last month.
export async function generateInsights(userId: string): Promise<Insight[]> {
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const [transactions, goals, debts] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: rangeStart } },
      include: { category: true },
    }),
    prisma.goal.findMany({ where: { userId, type: GoalType.GENERAL } }),
    prisma.debtTracker.findMany({ where: { userId } }),
  ]);

  const toLKR = (amount: number, currency: string) =>
    convertCurrency(amount, currency as "USD" | "LKR", "LKR");

  const thisMonthKey = monthKey(now);
  const lastMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const insights: Insight[] = [];

  // --- Category spend vs trailing 3-month average ---
  const byCategoryMonth = new Map<string, Map<string, number>>();
  for (const t of transactions) {
    if (!t.category || t.category.type !== "EXPENSE") continue;
    const key = t.category.name;
    const mKey = monthKey(t.date);
    if (!byCategoryMonth.has(key)) byCategoryMonth.set(key, new Map());
    const monthMap = byCategoryMonth.get(key)!;
    monthMap.set(mKey, (monthMap.get(mKey) ?? 0) + toLKR(t.amount, t.currency));
  }

  for (const [categoryName, monthMap] of byCategoryMonth) {
    const current = monthMap.get(thisMonthKey) ?? 0;
    const priorKeys = Array.from(monthMap.keys()).filter((k) => k !== thisMonthKey);
    if (priorKeys.length === 0 || current === 0) continue;

    const priorAvg = priorKeys.reduce((sum, k) => sum + (monthMap.get(k) ?? 0), 0) / priorKeys.length;
    if (priorAvg <= 0) continue;

    const diffPct = Math.round(((current - priorAvg) / priorAvg) * 100);
    if (diffPct >= 20) {
      insights.push({
        id: `spend-up-${categoryName}`,
        tone: "warning",
        text: `${categoryName} spending is ${diffPct}% above your recent average this month.`,
      });
    } else if (diffPct <= -20) {
      insights.push({
        id: `spend-down-${categoryName}`,
        tone: "positive",
        text: `${categoryName} spending is ${Math.abs(diffPct)}% below your recent average — nice work.`,
      });
    }
  }

  // --- Cashflow trend vs last month ---
  const monthlyNet = new Map<string, number>();
  for (const t of transactions) {
    const mKey = monthKey(t.date);
    const signed = t.category?.type === "INCOME" ? toLKR(t.amount, t.currency) : -toLKR(t.amount, t.currency);
    monthlyNet.set(mKey, (monthlyNet.get(mKey) ?? 0) + signed);
  }
  const thisNet = monthlyNet.get(thisMonthKey) ?? 0;
  const lastNet = monthlyNet.get(lastMonthKey);
  if (lastNet != null && lastNet !== 0) {
    const change = Math.round(((thisNet - lastNet) / Math.abs(lastNet)) * 100);
    if (Math.abs(change) >= 15) {
      insights.push({
        id: "cashflow-trend",
        tone: change > 0 ? "positive" : "warning",
        text:
          change > 0
            ? `Your net cashflow is up ${change}% compared to last month.`
            : `Your net cashflow is down ${Math.abs(change)}% compared to last month.`,
      });
    }
  }

  // --- Goal progress highlights ---
  for (const goal of goals) {
    if (goal.targetAmount <= 0) continue;
    const progress = goal.currentAmount / goal.targetAmount;
    if (progress >= 0.9) {
      insights.push({
        id: `goal-${goal.id}`,
        tone: "positive",
        text: `${goal.name} is ${Math.round(progress * 100)}% funded — almost there!`,
      });
    } else if (progress >= 0.5) {
      insights.push({
        id: `goal-${goal.id}`,
        tone: "neutral",
        text: `${goal.name} has crossed the halfway mark at ${Math.round(progress * 100)}% funded.`,
      });
    }
  }

  // --- Debt freedom ---
  for (const debt of debts) {
    if (debt.status === DebtStatus.EXPIRING_THIS_MONTH) {
      insights.push({
        id: `debt-${debt.id}`,
        tone: "positive",
        text: `${debt.itemName} clears this month, freeing up ${debt.monthlyInstallment.toLocaleString()} LKR/month.`,
      });
    }
  }

  return insights.slice(0, 6);
}
