"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { useCurrency } from "@/components/providers/currency-provider";

const MONTHS_AHEAD = 6;

function toNumber(value: number | readonly number[]): number {
  return Array.isArray(value) ? value[0] : (value as number);
}

function buildProjection({
  startNetWorth,
  baseSurplus,
  savingsAdjustmentPct,
  devaluationPct,
  emergencyExpense,
}: {
  startNetWorth: number;
  baseSurplus: number;
  savingsAdjustmentPct: number;
  devaluationPct: number;
  emergencyExpense: number;
}) {
  const baseline: { month: string; baseline: number; scenario: number }[] = [];
  let baselineNetWorth = startNetWorth;
  let scenarioNetWorth = startNetWorth;

  const adjustedSurplus =
    baseSurplus * (1 + savingsAdjustmentPct / 100) * (1 - devaluationPct / 100);

  for (let i = 0; i <= MONTHS_AHEAD; i++) {
    if (i > 0) {
      baselineNetWorth += baseSurplus;
      scenarioNetWorth += adjustedSurplus;
      if (i === 1) scenarioNetWorth -= emergencyExpense;
    }
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    baseline.push({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      baseline: Math.round(baselineNetWorth),
      scenario: Math.round(scenarioNetWorth),
    });
  }

  return baseline;
}

export function WhatIfForecast({
  currentNetWorthLKR,
  netCashflowSurplusLKR,
}: {
  currentNetWorthLKR: number;
  netCashflowSurplusLKR: number;
}) {
  const { format } = useCurrency();
  const [savingsAdjustmentPct, setSavingsAdjustmentPct] = useState(0);
  const [devaluationPct, setDevaluationPct] = useState(0);
  const [emergencyExpense, setEmergencyExpense] = useState(0);

  const data = useMemo(
    () =>
      buildProjection({
        startNetWorth: currentNetWorthLKR,
        baseSurplus: netCashflowSurplusLKR,
        savingsAdjustmentPct,
        devaluationPct,
        emergencyExpense,
      }),
    [currentNetWorthLKR, netCashflowSurplusLKR, savingsAdjustmentPct, devaluationPct, emergencyExpense]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="glass-card rounded-2xl p-5 lg:col-span-2">
        <p className="text-sm font-medium mb-4">6-Month Wealth Projection</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => format(v, "LKR")}
                width={110}
              />
              <Tooltip
                formatter={(value) => format(Number(value), "LKR")}
                contentStyle={{
                  background: "#0d1420",
                  border: "1px solid #1e293b",
                  borderRadius: 8,
                  color: "#e2e8f0",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Line
                type="monotone"
                dataKey="baseline"
                name="Baseline"
                stroke="#6366f1"
                strokeWidth={2}
                strokeOpacity={0.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="scenario"
                name="What-If Scenario"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 flex flex-col gap-6">
        <p className="text-sm font-medium">What-If Scenario Simulator</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Savings rate adjustment</span>
            <span className="font-medium tabular-nums">
              {savingsAdjustmentPct > 0 ? "+" : ""}
              {savingsAdjustmentPct}%
            </span>
          </div>
          <Slider
            value={[savingsAdjustmentPct]}
            min={-100}
            max={50}
            step={5}
            onValueChange={(v) => setSavingsAdjustmentPct(toNumber(v))}
          />
          <p className="text-[11px] text-muted-foreground">
            Simulate a job loss (-100%) or an income boost (+50%)
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Currency devaluation</span>
            <span className="font-medium tabular-nums">{devaluationPct}%</span>
          </div>
          <Slider
            value={[devaluationPct]}
            min={0}
            max={30}
            step={1}
            onValueChange={(v) => setDevaluationPct(toNumber(v))}
          />
          <p className="text-[11px] text-muted-foreground">Erodes real surplus each month</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">One-off emergency expense</span>
            <span className="font-medium tabular-nums">{format(emergencyExpense, "LKR")}</span>
          </div>
          <Slider
            value={[emergencyExpense]}
            min={0}
            max={300_000}
            step={10_000}
            onValueChange={(v) => setEmergencyExpense(toNumber(v))}
          />
          <p className="text-[11px] text-muted-foreground">Applied once, next month</p>
        </div>
      </div>
    </div>
  );
}
