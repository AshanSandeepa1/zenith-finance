import { auth } from "@/auth";
import { getDashboardData } from "@/lib/finance";
import { WhatIfForecast } from "@/components/dashboard/what-if-forecast";

export default async function AnalyticsPage() {
  const session = await auth();
  const data = await getDashboardData(session!.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Analytics & Forecasting</h1>
        <p className="text-sm text-muted-foreground">
          Project your net worth and stress-test it against real-world scenarios
        </p>
      </div>

      <WhatIfForecast
        currentNetWorthLKR={data.netWorthLKR}
        netCashflowSurplusLKR={data.netCashflowSurplusLKR}
      />
    </div>
  );
}
