import { prisma } from "@/lib/prisma";
import { convertCurrency } from "@/lib/currency";
import { GoalType } from "@prisma/client";

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function getDashboardData(userId: string) {
  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();

  const [financialAccounts, monthlyTransactions, categories, goals, debtTrackers] =
    await Promise.all([
      prisma.financialAccount.findMany({ where: { userId } }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        include: { category: true },
        orderBy: { date: "desc" },
      }),
      prisma.category.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
      prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
      prisma.debtTracker.findMany({ where: { userId }, orderBy: { expiryDate: "asc" } }),
    ]);

  const toLKR = (amount: number, currency: string) =>
    convertCurrency(amount, currency as "USD" | "LKR", "LKR");

  const liquidSavingsLKR = financialAccounts.reduce(
    (sum, acc) => sum + toLKR(acc.balance, acc.currency),
    0
  );

  const outstandingDebtLKR = debtTrackers.reduce(
    (sum, debt) => sum + debt.monthlyInstallment * debt.remainingMonths,
    0
  );

  const netWorthLKR = liquidSavingsLKR - outstandingDebtLKR;

  const incomeTransactions = monthlyTransactions.filter((t) => t.category?.type === "INCOME");
  const expenseTransactions = monthlyTransactions.filter((t) => t.category?.type !== "INCOME");

  const monthlyGrossIncomeLKR = incomeTransactions.reduce(
    (sum, t) => sum + toLKR(t.amount, t.currency),
    0
  );

  const totalExpensesLKR = expenseTransactions.reduce(
    (sum, t) => sum + toLKR(t.amount, t.currency),
    0
  );

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const expensesByCategory = expenseCategories.map((category) => {
    const amountLKR = monthlyTransactions
      .filter((t) => t.categoryId === category.id)
      .reduce((sum, t) => sum + toLKR(t.amount, t.currency), 0);
    return { category, amountLKR };
  });

  const netCashflowSurplusLKR = monthlyGrossIncomeLKR - totalExpensesLKR;

  const emergencyFundGoal = goals.find((g) => g.type === GoalType.EMERGENCY_FUND) ?? null;
  const generalGoals = goals.filter((g) => g.type === GoalType.GENERAL);

  const emergencyFundTargetLKR = emergencyFundGoal?.targetAmount ?? 0;
  const emergencyFundProgress =
    emergencyFundTargetLKR > 0 ? Math.min(1, liquidSavingsLKR / emergencyFundTargetLKR) : 0;

  return {
    netWorthLKR,
    monthlyGrossIncomeLKR,
    totalFixedExpensesLKR: totalExpensesLKR,
    netCashflowSurplusLKR,
    liquidSavingsLKR,
    emergencyFundGoal,
    emergencyFundTargetLKR,
    emergencyFundProgress,
    categories,
    expensesByCategory,
    monthlyTransactions,
    generalGoals,
    debtTrackers,
    financialAccounts,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
