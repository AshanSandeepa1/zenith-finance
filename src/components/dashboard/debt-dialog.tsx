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
import { createDebtTracker, updateDebtTracker } from "@/app/actions/debts";
import type { DebtTracker } from "@prisma/client";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function DebtDialog({ debt }: { debt?: DebtTracker }) {
  const isEdit = !!debt;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [vendor, setVendor] = useState(debt?.vendor ?? "");
  const [itemName, setItemName] = useState(debt?.itemName ?? "");
  const [totalAmount, setTotalAmount] = useState(debt ? String(debt.totalAmount) : "");
  const [monthlyInstallment, setMonthlyInstallment] = useState(
    debt ? String(debt.monthlyInstallment) : ""
  );
  const [remainingMonths, setRemainingMonths] = useState(
    debt ? String(debt.remainingMonths) : ""
  );
  const [expiryDate, setExpiryDate] = useState(toDateInputValue(debt?.expiryDate ?? new Date()));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      vendor,
      itemName,
      totalAmount: Number(totalAmount),
      monthlyInstallment: Number(monthlyInstallment),
      remainingMonths: Number(remainingMonths),
      expiryDate: new Date(expiryDate),
    };

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateDebtTracker(debt.id, payload);
          toast.success("Installment plan updated");
        } else {
          await createDebtTracker(payload);
          toast.success("Installment plan added");
          setVendor("");
          setItemName("");
          setTotalAmount("");
          setMonthlyInstallment("");
          setRemainingMonths("");
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
            <Plus className="h-4 w-4" /> Add installment plan
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit installment plan" : "New installment plan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="debt-vendor">Vendor</Label>
              <Input
                id="debt-vendor"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Commercial Bank"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-item">Item</Label>
              <Input
                id="debt-item"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. iPhone 16 Pro"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="debt-total">Total amount (LKR)</Label>
              <Input
                id="debt-total"
                type="number"
                min={0}
                step="any"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-installment">Monthly installment (LKR)</Label>
              <Input
                id="debt-installment"
                type="number"
                min={0}
                step="any"
                value={monthlyInstallment}
                onChange={(e) => setMonthlyInstallment(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="debt-remaining">Months remaining</Label>
              <Input
                id="debt-remaining"
                type="number"
                min={0}
                step={1}
                value={remainingMonths}
                onChange={(e) => setRemainingMonths(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debt-expiry">Final payment date</Label>
              <Input
                id="debt-expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
