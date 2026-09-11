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
import { IconPicker } from "@/components/dashboard/icon-picker";
import { ColorPicker } from "@/components/dashboard/color-picker";
import { createCategory, updateCategory } from "@/app/actions/categories";
import type { CategoryFormInput } from "@/app/actions/categories";
import type { Category } from "@prisma/client";

export function CategoryDialog({ category }: { category?: Category }) {
  const isEdit = !!category;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "CircleDollarSign");
  const [color, setColor] = useState(category?.color ?? "slate");
  const [type, setType] = useState<"INCOME" | "EXPENSE">(category?.type ?? "EXPENSE");
  const [budgetMonthly, setBudgetMonthly] = useState(
    category?.budgetMonthly ? String(category.budgetMonthly) : ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CategoryFormInput = {
      name,
      icon: icon as CategoryFormInput["icon"],
      color: color as CategoryFormInput["color"],
      type,
      budgetMonthly: budgetMonthly ? Number(budgetMonthly) : null,
    };

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateCategory(category.id, payload);
          toast.success("Category updated");
        } else {
          await createCategory(payload);
          toast.success("Category created");
          setName("");
          setBudgetMonthly("");
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
            <Plus className="h-4 w-4" /> Add category
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "New category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-type">Type</Label>
            <SelectNative
              id="cat-type"
              value={type}
              onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")}
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </SelectNative>
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker value={icon} onChange={setIcon} color={color} />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>
          {type === "EXPENSE" && (
            <div className="space-y-2">
              <Label htmlFor="cat-budget">Monthly budget (LKR, optional)</Label>
              <Input
                id="cat-budget"
                type="number"
                min={0}
                step="any"
                placeholder="No budget set"
                value={budgetMonthly}
                onChange={(e) => setBudgetMonthly(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
