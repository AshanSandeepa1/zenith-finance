"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Gamepad2, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/components/providers/currency-provider";
import { GoalDialog } from "@/components/dashboard/goal-dialog";
import { updateGoalContribution, deleteGoal } from "@/app/actions/goals";
import type { Goal } from "@prisma/client";

function toNumber(value: number | readonly number[]): number {
  return Array.isArray(value) ? value[0] : (value as number);
}

export function GoalCard({ goal }: { goal: Goal }) {
  const { format } = useCurrency();
  const [contribution, setContribution] = useState(goal.monthlyContribution);
  const [isPending, startTransition] = useTransition();

  const progress = Math.min(
    100,
    Math.round((goal.currentAmount / goal.targetAmount) * 1000) / 10
  );
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const monthsNeeded = contribution > 0 ? Math.ceil(remaining / contribution) : null;
  const targetDate = monthsNeeded
    ? new Date(new Date().getFullYear(), new Date().getMonth() + monthsNeeded, 1)
    : null;

  function handleCommit(value: number | readonly number[]) {
    const numeric = toNumber(value);
    startTransition(async () => {
      try {
        await updateGoalContribution(goal.id, numeric);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteGoal(goal.id);
        toast.success("Goal deleted");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
            <Gamepad2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{goal.name}</p>
            <p className="text-xs text-muted-foreground truncate">{goal.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <GoalDialog goal={goal} />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${goal.name}`}
            disabled={isPending}
            onClick={handleDelete}
            className="text-muted-foreground hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {format(goal.currentAmount, "LKR")} of {format(goal.targetAmount, "LKR")}
          </span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <Progress className="[&_[data-slot=progress-track]]:h-2" value={progress} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Monthly contribution</span>
          <span className="font-medium tabular-nums">{format(contribution, "LKR")}</span>
        </div>
        <Slider
          value={[contribution]}
          min={0}
          max={Math.max(30000, contribution)}
          step={500}
          onValueChange={(value) => setContribution(toNumber(value))}
          onValueCommitted={handleCommit}
          disabled={isPending}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {targetDate
          ? `Day-one ready by ${targetDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
          : "Set a contribution to project a target date"}
      </p>
    </div>
  );
}
