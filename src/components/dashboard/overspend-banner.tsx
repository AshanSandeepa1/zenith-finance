import { AlertTriangle } from "lucide-react";
import type { Category } from "@prisma/client";

export function OverspendBanner({
  overBudgetCategories,
}: {
  overBudgetCategories: { category: Category; amountLKR: number }[];
}) {
  if (overBudgetCategories.length === 0) return null;

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
      <p className="text-sm text-rose-400">
        {overBudgetCategories.length === 1 ? (
          <>
            <span className="font-medium">{overBudgetCategories[0].category.name}</span> is over
            budget this month.
          </>
        ) : (
          <>
            <span className="font-medium">{overBudgetCategories.length} categories</span> are over
            budget this month:{" "}
            {overBudgetCategories.map((e) => e.category.name).join(", ")}.
          </>
        )}
      </p>
    </div>
  );
}
