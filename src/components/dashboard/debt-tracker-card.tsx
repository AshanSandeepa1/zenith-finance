"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/components/providers/currency-provider";
import { cn } from "@/lib/utils";
import type { DebtTracker } from "@prisma/client";
import { CreditCard, Trash2 } from "lucide-react";
import { DebtDialog } from "@/components/dashboard/debt-dialog";
import { deleteDebtTracker } from "@/app/actions/debts";

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
  const [isPending, startTransition] = useTransition();
  const status = STATUS_CONFIG[debt.status];
  const outstanding = debt.monthlyInstallment * debt.remainingMonths;

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteDebtTracker(debt.id);
        toast.success("Installment plan removed");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground shrink-0">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{debt.itemName}</p>
            <p className="text-xs text-muted-foreground truncate">{debt.vendor}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Badge variant="outline" className={cn(status.className)}>
            {status.label}
          </Badge>
        </div>
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
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {debt.remainingMonths <= 1 ? "Final payment" : `${debt.remainingMonths} months left`} · expires{" "}
          {debt.expiryDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <DebtDialog debt={debt} />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${debt.itemName}`}
            disabled={isPending}
            onClick={handleDelete}
            className="text-muted-foreground hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
