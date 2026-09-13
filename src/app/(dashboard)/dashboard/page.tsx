import { after } from "next/server";
import { Wallet, TrendingUp, Receipt, PiggyBank, Landmark } from "lucide-react";
import { auth } from "@/auth";
import { getDashboardData } from "@/lib/finance";
import { recordHealthScoreSnapshot, getHealthScoreHistory } from "@/lib/health-score";
import { generateInsights } from "@/lib/insights";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { CashflowSankey } from "@/components/dashboard/cashflow-sankey";
import { EmergencyFundGauge } from "@/components/dashboard/emergency-gauge";
import { DebtTrackerCard } from "@/components/dashboard/debt-tracker-card";
import { TransactionDialog } from "@/components/dashboard/transaction-dialog";
import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { InsightsFeed } from "@/components/dashboard/insights-feed";
import { OverspendBanner } from "@/components/dashboard/overspend-banner";

export default async function DashboardOverviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  // All three independent of each other — run concurrently instead of in
  // sequence, since each is its own round trip to a remote database.
  const [data, healthHistory, insights] = await Promise.all([
    getDashboardData(userId),
    getHealthScoreHistory(userId),
    generateInsights(userId),
  ]);

  // Not needed to render the page — runs after the response is sent instead
  // of blocking it.
  after(() => recordHealthScoreSnapshot(userId, data.healthScore.score));

  const expiringDebts = data.debtTrackers.filter((d) => d.status === "EXPIRING_THIS_MONTH");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Overview</h1>
          <p className="text-sm text-muted-foreground">Your net worth and cash flow at a glance</p>
        </div>
        <TransactionDialog categories={data.categories} accounts={data.financialAccounts} />
      </div>

      <OverspendBanner overBudgetCategories={data.overBudgetCategories} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          label="Net Worth"
          amountLKR={data.netWorthLKR}
          icon={<Landmark className="h-4 w-4" />}
          tone="indigo"
        />
        <KpiCard
          label="Monthly Gross Income"
          amountLKR={data.monthlyGrossIncomeLKR}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="emerald"
        />
        <KpiCard
          label="Total Fixed Expenses"
          amountLKR={data.totalFixedExpensesLKR}
          icon={<Receipt className="h-4 w-4" />}
          tone="coral"
        />
        <KpiCard
          label="Net Cashflow Surplus"
          amountLKR={data.netCashflowSurplusLKR}
          icon={<PiggyBank className="h-4 w-4" />}
          tone={data.netCashflowSurplusLKR >= 0 ? "emerald" : "coral"}
        />
        <KpiCard
          label="Liquid Savings"
          amountLKR={data.liquidSavingsLKR}
          icon={<Wallet className="h-4 w-4" />}
          tone="neutral"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <HealthScoreCard
          score={data.healthScore.score}
          breakdown={data.healthScore.breakdown}
          history={healthHistory}
        />
        <div className="lg:col-span-2">
          <InsightsFeed insights={insights} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CashflowSankey
            expensesByCategory={data.expensesByCategory}
            netCashflowSurplusLKR={data.netCashflowSurplusLKR}
          />
        </div>
        <EmergencyFundGauge
          currentLKR={data.liquidSavingsLKR}
          targetLKR={data.emergencyFundTargetLKR}
          progress={data.emergencyFundProgress}
        />
      </div>

      {expiringDebts.length > 0 && (
        <div>
          <h2 className="text-sm font-medium mb-3">Clearing this month</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expiringDebts.map((debt) => (
              <DebtTrackerCard key={debt.id} debt={debt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
