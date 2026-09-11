import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/finance";
import { GoalCard } from "@/components/dashboard/goal-card";
import { GoalDialog } from "@/components/dashboard/goal-dialog";
import { EmergencyFundGauge } from "@/components/dashboard/emergency-gauge";
import { GoalType } from "@prisma/client";

export default async function GoalsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [goals, data] = await Promise.all([
    prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    getDashboardData(userId),
  ]);

  const generalGoals = goals.filter((g) => g.type === GoalType.GENERAL);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Goals</h1>
          <p className="text-sm text-muted-foreground">
            Your emergency fund and dedicated savings buckets
          </p>
        </div>
        <GoalDialog />
      </div>

      <EmergencyFundGauge
        currentLKR={data.liquidSavingsLKR}
        targetLKR={data.emergencyFundTargetLKR}
        progress={data.emergencyFundProgress}
      />

      {generalGoals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {generalGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No goals yet — add one for your next big purchase or trip.
        </p>
      )}
    </div>
  );
}
