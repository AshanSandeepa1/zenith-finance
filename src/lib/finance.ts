import { prisma } from "@/lib/prisma";
import { convertCurrency } from "@/lib/currency";
import { TransactionCategory } from "@prisma/client";

export const EMERGENCY_FUND_TARGET_LKR = Number(
  process.env.NEXT_PUBLIC_EMERGENCY_FUND_TARGET_LKR ?? 857_100
);

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export async function getDashboardData(userId: string) {
  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();

  const [financialAccounts, monthlyTransactions, sinkingFunds, debtTrackers] = await Promise.all([
    prisma.financialAccount.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      orderBy: { date: "desc" },
    }),
    prisma.sinkingFund.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.debtTracker.findMany({ where: { userId }, orderBy: { expiryDate: "asc" } }),
  ]);

  const toLKR = (amount: number, currency: "USD" | "LKR") =>
    convertCurrency(amount, currency, "LKR");

  const liquidSavingsLKR = financialAccounts.reduce(
    (sum, acc) => sum + toLKR(acc.balance, acc.currency),
    0
  );

  const outstandingDebtLKR = debtTrackers.reduce(
    (sum, debt) => sum + debt.monthlyInstallment * debt.remainingMonths,
    0
  );

  const netWorthLKR = liquidSavingsLKR - outstandingDebtLKR;

  const monthlyGrossIncomeLKR = monthlyTransactions
    .filter((t) => t.category === TransactionCategory.INCOME)
    .reduce((sum, t) => sum + toLKR(t.amount, t.currency), 0);

  const expenseCategories: TransactionCategory[] = [
    TransactionCategory.GROCERIES_BILLS,
    TransactionCategory.CAMPUS_FEES,
    TransactionCategory.DISCRETIONARY,
    TransactionCategory.SINKING_FUND,
    TransactionCategory.DEBT_PAYMENT,
    TransactionCategory.OTHER,
  ];

  const totalExpensesLKR = monthlyTransactions
    .filter((t) => expenseCategories.includes(t.category))
    .reduce((sum, t) => sum + toLKR(t.amount, t.currency), 0);

  const expensesByCategory = expenseCategories.map((category) => ({
    category,
    amountLKR: monthlyTransactions
      .filter((t) => t.category === category)
      .reduce((sum, t) => sum + toLKR(t.amount, t.currency), 0),
  }));

  const netCashflowSurplusLKR = monthlyGrossIncomeLKR - totalExpensesLKR;

  const emergencyFundProgress = Math.min(
    1,
    liquidSavingsLKR / EMERGENCY_FUND_TARGET_LKR
  );

  return {
    netWorthLKR,
    monthlyGrossIncomeLKR,
    totalFixedExpensesLKR: totalExpensesLKR,
    netCashflowSurplusLKR,
    liquidSavingsLKR,
    emergencyFundTargetLKR: EMERGENCY_FUND_TARGET_LKR,
    emergencyFundProgress,
    expensesByCategory,
    monthlyTransactions,
    sinkingFunds,
    debtTrackers,
    financialAccounts,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
