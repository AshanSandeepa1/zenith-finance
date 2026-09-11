"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/components/providers/currency-provider";
import { AccountDialog } from "@/components/settings/account-dialog";
import { deleteFinancialAccount } from "@/app/actions/accounts";
import type { FinancialAccount } from "@prisma/client";

export function AccountsManager({ accounts }: { accounts: FinancialAccount[] }) {
  const { format } = useCurrency();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteFinancialAccount(id);
        toast.success("Account removed");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Financial accounts</p>
          <p className="text-xs text-muted-foreground">
            Bank, wallet, and cash balances that make up your liquid savings
          </p>
        </div>
        <AccountDialog />
      </div>

      <div className="flex flex-col divide-y divide-border">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center gap-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground shrink-0">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{account.name}</p>
              <p className="text-xs text-muted-foreground">
                {account.type.charAt(0) + account.type.slice(1).toLowerCase()}
              </p>
            </div>
            <p className="text-sm font-medium tabular-nums shrink-0">
              {format(account.balance, account.currency as "USD" | "LKR")}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <AccountDialog account={account} />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${account.name}`}
                disabled={isPending}
                onClick={() => handleDelete(account.id)}
                className="text-muted-foreground hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">No accounts yet.</p>
        )}
      </div>
    </div>
  );
}
