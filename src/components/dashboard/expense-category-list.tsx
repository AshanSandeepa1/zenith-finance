"use client";

import { useCurrency } from "@/components/providers/currency-provider";
import { CategoryIcon } from "@/components/dashboard/category-icon";
import { categoryColorClasses } from "@/lib/category-colors";
import type { Category } from "@prisma/client";

export function ExpenseCategoryList({
  expensesByCategory,
}: {
  expensesByCategory: { category: Category; amountLKR: number }[];
}) {
  const { format } = useCurrency();
  const total = expensesByCategory.reduce((sum, e) => sum + e.amountLKR, 0) || 1;
  const sorted = [...expensesByCategory].sort((a, b) => b.amountLKR - a.amountLKR);

  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-sm font-medium mb-4">Monthly outflows</p>
      <div className="flex flex-col divide-y divide-border">
        {sorted.map(({ category, amountLKR }) => {
          const tone = categoryColorClasses(category.color);
          const percent = Math.round((amountLKR / total) * 100);
          const overBudget = category.budgetMonthly != null && amountLKR > category.budgetMonthly;
          const budgetPercent =
            category.budgetMonthly && category.budgetMonthly > 0
              ? Math.min(100, Math.round((amountLKR / category.budgetMonthly) * 100))
              : null;

          return (
            <div key={category.id} className="flex items-center gap-4 py-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${tone.bg} ${tone.text}`}>
                <CategoryIcon name={category.icon} className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category.name}</span>
                  <span className="tabular-nums flex items-center gap-1.5">
                    {format(amountLKR, "LKR")}
                    {category.budgetMonthly != null && (
                      <span className="text-xs text-muted-foreground">
                        / {format(category.budgetMonthly, "LKR")}
                      </span>
                    )}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full ${overBudget ? "bg-rose-500" : tone.bar}`}
                    style={{ width: `${budgetPercent ?? percent}%` }}
                  />
                </div>
                {overBudget && (
                  <p className="mt-1 text-xs text-rose-400">Over budget this month</p>
                )}
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">No expense categories yet.</p>
        )}
      </div>
    </div>
  );
}
