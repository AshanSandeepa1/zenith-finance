"use client";

import { useState, useTransition } from "react";
import { Gamepad2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useCurrency } from "@/components/providers/currency-provider";
import { updateSinkingFundContribution } from "@/app/actions/sinking-funds";
import type { SinkingFund } from "@prisma/client";

export function SinkingFundCard({ fund }: { fund: SinkingFund }) {
  const { format } = useCurrency();
  const [contribution, setContribution] = useState(fund.monthlyContribution);
  const [isPending, startTransition] = useTransition();

  const progress = Math.min(100, Math.round((fund.currentAmount / fund.targetAmount) * 1000) / 10);
  const remaining = Math.max(fund.targetAmount - fund.currentAmount, 0);
  const monthsNeeded = contribution > 0 ? Math.ceil(remaining / contribution) : null;
  const targetDate = monthsNeeded
    ? new Date(new Date().getFullYear(), new Date().getMonth() + monthsNeeded, 1)
    : null;

  function handleCommit(value: number | readonly number[]) {
    const numeric = Array.isArray(value) ? value[0] : (value as number);
    startTransition(() => {
      updateSinkingFundContribution({ id: fund.id, monthlyContribution: numeric });
    });
  }

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
          <Gamepad2 className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{fund.name}</p>
          <p className="text-xs text-muted-foreground">{fund.category}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {format(fund.currentAmount, "LKR")} of {format(fund.targetAmount, "LKR")}
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
          min={1000}
          max={30000}
          step={500}
          onValueChange={(value) => setContribution(Array.isArray(value) ? value[0] : value)}
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
