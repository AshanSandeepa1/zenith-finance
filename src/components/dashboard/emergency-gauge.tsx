"use client";

import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/components/providers/currency-provider";
import { ShieldCheck } from "lucide-react";

export function EmergencyFundGauge({
  currentLKR,
  targetLKR,
  progress,
}: {
  currentLKR: number;
  targetLKR: number;
  progress: number;
}) {
  const { format } = useCurrency();
  const percent = Math.round(progress * 1000) / 10;

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">3-Month Emergency Fund</p>
            <p className="text-xs text-muted-foreground">
              {format(currentLKR, "LKR")} of {format(targetLKR, "LKR")}
            </p>
          </div>
        </div>
        <span className="text-lg font-semibold text-emerald-400 tabular-nums">{percent}%</span>
      </div>
      <Progress
        value={percent}
        className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:bg-emerald-500"
      />
    </div>
  );
}
