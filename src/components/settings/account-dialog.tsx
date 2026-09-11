"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { createFinancialAccount, updateFinancialAccount } from "@/app/actions/accounts";
import type { FinancialAccount } from "@prisma/client";

const ACCOUNT_TYPES = ["SAVINGS", "CHECKING", "CASH", "WALLET", "INVESTMENT", "OTHER"] as const;

export function AccountDialog({ account }: { account?: FinancialAccount }) {
  const isEdit = !!account;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<(typeof ACCOUNT_TYPES)[number]>(
    (account?.type as (typeof ACCOUNT_TYPES)[number]) ?? "SAVINGS"
  );
  const [balance, setBalance] = useState(account ? String(account.balance) : "");
  const [currency, setCurrency] = useState<"USD" | "LKR">(
    (account?.currency as "USD" | "LKR") ?? "LKR"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { name, type, balance: Number(balance || 0), currency };

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateFinancialAccount(account.id, payload);
          toast.success("Account updated");
        } else {
          await createFinancialAccount(payload);
          toast.success("Account added");
          setName("");
          setBalance("");
        }
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? <Button variant="ghost" size="sm" /> : <Button size="sm" className="gap-1.5" />
        }
      >
        {isEdit ? "Edit" : (
          <>
            <Plus className="h-4 w-4" /> Add account
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit account" : "New account"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="acc-name">Name</Label>
            <Input
              id="acc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Liquid Savings"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="acc-type">Type</Label>
              <SelectNative
                id="acc-type"
                value={type}
                onChange={(e) => setType(e.target.value as (typeof ACCOUNT_TYPES)[number])}
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0) + t.slice(1).toLowerCase()}
                  </option>
                ))}
              </SelectNative>
            </div>
            <div className="space-y-2">
              <Label htmlFor="acc-currency">Currency</Label>
              <SelectNative
                id="acc-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "USD" | "LKR")}
              >
                <option value="LKR">LKR</option>
                <option value="USD">USD</option>
              </SelectNative>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="acc-balance">Balance</Label>
            <Input
              id="acc-balance"
              type="number"
              step="any"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
