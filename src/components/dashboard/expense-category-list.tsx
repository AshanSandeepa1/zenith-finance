"use client";

import { ShoppingCart, GraduationCap, Sparkles, PiggyBank, CircleDollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { TransactionCategory } from "@prisma/client";
import { useCurrency } from "@/components/providers/currency-provider";

const CATEGORY_META: Record<TransactionCategory, { label: string; icon: LucideIcon; tone: string }> = {
  GROCERIES_BILLS: { label: "Groceries & Bills", icon: ShoppingCart, tone: "text-rose-400 bg-rose-500/10" },
  CAMPUS_FEES: { label: "Campus Fees", icon: GraduationCap, tone: "text-indigo-400 bg-indigo-500/10" },
  DISCRETIONARY: { label: "Discretionary", icon: Sparkles, tone: "text-amber-400 bg-amber-500/10" },
  SINKING_FUND: { label: "Sinking Funds", icon: PiggyBank, tone: "text-emerald-400 bg-emerald-500/10" },
  DEBT_PAYMENT: { label: "Debt Payment", icon: CircleDollarSign, tone: "text-rose-400 bg-rose-500/10" },
  OTHER: { label: "Other", icon: CircleDollarSign, tone: "text-muted-foreground bg-secondary" },
  INCOME: { label: "Income", icon: CircleDollarSign, tone: "text-emerald-400 bg-emerald-500/10" },
};

const DISPLAY_ORDER: TransactionCategory[] = [
  "GROCERIES_BILLS",
  "CAMPUS_FEES",
  "DISCRETIONARY",
  "SINKING_FUND",
];

export function ExpenseCategoryList({
  expensesByCategory,
}: {
  expensesByCategory: { category: TransactionCategory; amountLKR: number }[];
}) {
  const { format } = useCurrency();
  const total = expensesByCategory.reduce((sum, e) => sum + e.amountLKR, 0) || 1;

  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-sm font-medium mb-4">Monthly outflows</p>
      <div className="flex flex-col divide-y divide-border">
        {DISPLAY_ORDER.map((category) => {
          const entry = expensesByCategory.find((e) => e.category === category);
          const amount = entry?.amountLKR ?? 0;
          const meta = CATEGORY_META[category];
          const Icon = meta.icon;
          const percent = Math.round((amount / total) * 100);

          return (
            <div key={category} className="flex items-center gap-4 py-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${meta.tone}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{meta.label}</span>
                  <span className="tabular-nums">{format(amount, "LKR")}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
