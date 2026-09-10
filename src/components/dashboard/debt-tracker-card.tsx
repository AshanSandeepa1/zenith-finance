"use client";

import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/components/providers/currency-provider";
import { cn } from "@/lib/utils";
import type { DebtTracker } from "@prisma/client";
import { CreditCard } from "lucide-react";

const STATUS_CONFIG: Record<
  DebtTracker["status"],
  { label: string; className: string }
> = {
  ACTIVE: { label: "Active", className: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  EXPIRING_THIS_MONTH: {
    label: "Expiring This Month",
    className: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  },
  CLEARED: { label: "Cleared", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
};

export function DebtTrackerCard({ debt }: { debt: DebtTracker }) {
  const { format } = useCurrency();
  const status = STATUS_CONFIG[debt.status];
  const outstanding = debt.monthlyInstallment * debt.remainingMonths;

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground shrink-0">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{debt.itemName}</p>
            <p className="text-xs text-muted-foreground">{debt.vendor}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn("shrink-0", status.className)}>
          {status.label}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Monthly installment</p>
          <p className="font-medium tabular-nums">{format(debt.monthlyInstallment, "LKR")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className="font-medium tabular-nums">{format(outstanding, "LKR")}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {debt.remainingMonths <= 1 ? "Final payment" : `${debt.remainingMonths} months left`} · expires{" "}
        {debt.expiryDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  );
}
