"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/components/providers/currency-provider";
import { CategoryIcon } from "@/components/dashboard/category-icon";
import { categoryColorClasses } from "@/lib/category-colors";
import { TransactionDialog } from "@/components/dashboard/transaction-dialog";
import { deleteTransaction } from "@/app/actions/transactions";
import type { Category, FinancialAccount, Transaction } from "@prisma/client";

type TransactionWithCategory = Transaction & { category: Category | null };

export function TransactionHistoryTable({
  transactions,
  categories,
  accounts,
}: {
  transactions: TransactionWithCategory[];
  categories: Category[];
  accounts: FinancialAccount[];
}) {
  const { format } = useCurrency();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteTransaction(id);
        toast.success("Transaction deleted");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  if (transactions.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 text-sm text-muted-foreground">
        No transactions yet.
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium text-right">Amount</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((t) => {
              const tone = t.category ? categoryColorClasses(t.category.color) : null;
              return (
                <tr key={t.id}>
                  <td className="px-5 py-3 whitespace-nowrap text-muted-foreground">
                    {t.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-md shrink-0 ${tone?.bg ?? "bg-secondary"} ${tone?.text ?? "text-muted-foreground"}`}
                      >
                        <CategoryIcon name={t.category?.icon ?? "CircleDollarSign"} className="h-3.5 w-3.5" />
                      </span>
                      {t.category?.name ?? "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground truncate max-w-60">
                    {t.description || "—"}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-medium">
                    {format(t.amount, t.currency)}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <TransactionDialog categories={categories} accounts={accounts} transaction={t} />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete transaction"
                        disabled={isPending}
                        onClick={() => handleDelete(t.id)}
                        className="text-muted-foreground hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
