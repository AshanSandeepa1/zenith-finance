"use client";

import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/components/providers/currency-provider";
import type { Insight } from "@/lib/insights";

const TONE_STYLES: Record<Insight["tone"], { icon: typeof TrendingUp; className: string }> = {
  positive: { icon: TrendingUp, className: "text-emerald-400 bg-emerald-500/10" },
  warning: { icon: TrendingDown, className: "text-rose-400 bg-rose-500/10" },
  neutral: { icon: Sparkles, className: "text-indigo-400 bg-indigo-500/10" },
};

export function InsightsFeed({ insights }: { insights: Insight[] }) {
  const { format } = useCurrency();

  if (insights.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <p className="text-sm font-medium mb-1">Insights</p>
        <p className="text-xs text-muted-foreground">
          Nothing notable yet — insights build up as you log more transactions and goals.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-sm font-medium mb-3">Insights</p>
      <div className="flex flex-col gap-3">
        {insights.map((insight) => {
          const tone = TONE_STYLES[insight.tone];
          const Icon = tone.icon;
          const text =
            insight.amountLKR != null
              ? insight.text.replace("{amount}", format(insight.amountLKR, "LKR"))
              : insight.text;
          return (
            <div key={insight.id} className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md shrink-0 mt-0.5",
                  tone.className
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm text-muted-foreground leading-snug">{text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
