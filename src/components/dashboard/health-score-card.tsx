"use client";

import { ResponsiveContainer, LineChart, Line } from "recharts";
import type { HealthScoreComponent } from "@/lib/health-score";

function scoreColor(score: number): string {
  if (score >= 75) return "#10b981";
  if (score >= 50) return "#6366f1";
  if (score >= 25) return "#f59e0b";
  return "#f43f5e";
}

export function HealthScoreCard({
  score,
  breakdown,
  history,
}: {
  score: number;
  breakdown: HealthScoreComponent[];
  history: { yearMonth: string; score: number }[];
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = scoreColor(score);

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
      <p className="text-sm font-medium">Financial Health Score</p>

      <div className="flex items-center gap-6">
        <svg width="104" height="104" viewBox="0 0 100 100" className="shrink-0">
          <circle cx="50" cy="50" r={radius} stroke="var(--border)" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
          <text
            x="50"
            y="47"
            textAnchor="middle"
            fontSize="24"
            fontWeight={700}
            fill="var(--foreground)"
          >
            {score}
          </text>
          <text x="50" y="63" textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">
            / 100
          </text>
        </svg>

        <div className="flex-1 space-y-2.5 min-w-0">
          {breakdown.length > 0 ? (
            breakdown.map((c) => (
              <div key={c.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{c.label}</span>
                  <span className="tabular-nums font-medium">{Math.round(c.value)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.value}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">
              Add income, an emergency fund target, or a goal to see your score.
            </p>
          )}
        </div>
      </div>

      {history.length > 1 && (
        <div className="h-10 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <Line
                type="monotone"
                dataKey="score"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
