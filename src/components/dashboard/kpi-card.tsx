"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/providers/currency-provider";
import { AnimatedNumber } from "@/components/dashboard/animated-number";

type Tone = "emerald" | "indigo" | "coral" | "neutral";

const toneClasses: Record<Tone, string> = {
  emerald: "text-emerald-400 bg-emerald-500/10",
  indigo: "text-indigo-400 bg-indigo-500/10",
  coral: "text-rose-400 bg-rose-500/10",
  neutral: "text-foreground bg-secondary",
};

export function KpiCard({
  label,
  amountLKR,
  icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  amountLKR: number;
  icon: ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  const { displayCurrency, format } = useCurrency();

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", toneClasses[tone])}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-semibold">
        <AnimatedNumber
          value={amountLKR}
          formatter={(v) => format(v, "LKR")}
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <span className="sr-only">{displayCurrency}</span>
    </div>
  );
}
