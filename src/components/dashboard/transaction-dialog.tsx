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
import { Switch } from "@/components/ui/switch";
import { SelectNative } from "@/components/ui/select-native";
import { createTransaction, updateTransaction } from "@/app/actions/transactions";
import type { Category, FinancialAccount, Transaction } from "@prisma/client";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function TransactionDialog({
  categories,
  accounts,
  transaction,
}: {
  categories: Category[];
  accounts: FinancialAccount[];
  transaction?: Transaction;
}) {
  const isEdit = !!transaction;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [currency, setCurrency] = useState<"USD" | "LKR">(
    (transaction?.currency as "USD" | "LKR") ?? "LKR"
  );
  const [categoryId, setCategoryId] = useState(
    transaction?.categoryId ?? categories[0]?.id ?? ""
  );
  const [financialAccountId, setFinancialAccountId] = useState(
    transaction?.financialAccountId ?? ""
  );
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring ?? false);
  const [date, setDate] = useState(toDateInputValue(transaction?.date ?? new Date()));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      amount: Number(amount),
      currency,
      categoryId,
      financialAccountId: financialAccountId || undefined,
      description: description || undefined,
      isRecurring,
      date: new Date(date),
    };

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateTransaction(transaction.id, payload);
          toast.success("Transaction updated");
        } else {
          await createTransaction(payload);
          toast.success("Transaction added");
          setAmount("");
          setDescription("");
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
          isEdit ? (
            <Button variant="ghost" size="sm" />
          ) : (
            <Button size="sm" className="gap-1.5" />
          )
        }
      >
        {isEdit ? "Edit" : (
          <>
            <Plus className="h-4 w-4" /> Add transaction
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit transaction" : "New transaction"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="txn-amount">Amount</Label>
              <Input
                id="txn-amount"
                type="number"
                step="any"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="txn-currency">Currency</Label>
              <SelectNative
                id="txn-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "USD" | "LKR")}
              >
                <option value="LKR">LKR</option>
                <option value="USD">USD</option>
              </SelectNative>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="txn-category">Category</Label>
            <SelectNative
              id="txn-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectNative>
          </div>
          {accounts.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="txn-account">Account (optional)</Label>
              <SelectNative
                id="txn-account"
                value={financialAccountId}
                onChange={(e) => setFinancialAccountId(e.target.value)}
              >
                <option value="">None</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </SelectNative>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="txn-date">Date</Label>
            <Input
              id="txn-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="txn-desc">Description (optional)</Label>
            <Input
              id="txn-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="txn-recurring">Recurring monthly</Label>
            <Switch id="txn-recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
