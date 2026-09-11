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
import { createGoal, updateGoal } from "@/app/actions/goals";
import type { Goal } from "@prisma/client";

export function GoalDialog({ goal }: { goal?: Goal }) {
  const isEdit = !!goal;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(goal?.name ?? "");
  const [category, setCategory] = useState(goal?.category ?? "");
  const [targetAmount, setTargetAmount] = useState(goal ? String(goal.targetAmount) : "");
  const [currentAmount, setCurrentAmount] = useState(goal ? String(goal.currentAmount) : "0");
  const [monthlyContribution, setMonthlyContribution] = useState(
    goal ? String(goal.monthlyContribution) : ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name,
      category,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      monthlyContribution: Number(monthlyContribution || 0),
    };

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateGoal(goal.id, payload);
          toast.success("Goal updated");
        } else {
          await createGoal(payload);
          toast.success("Goal created");
          setName("");
          setCategory("");
          setTargetAmount("");
          setCurrentAmount("0");
          setMonthlyContribution("");
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
            <Plus className="h-4 w-4" /> Add goal
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goal" : "New goal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Name</Label>
            <Input
              id="goal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GTA 6, Japan Trip, New Laptop"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-category">Category tag</Label>
            <Input
              id="goal-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Gaming/Tech, Travel"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="goal-target">Target amount (LKR)</Label>
              <Input
                id="goal-target"
                type="number"
                min={0}
                step="any"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-current">Saved so far (LKR)</Label>
              <Input
                id="goal-current"
                type="number"
                min={0}
                step="any"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal-contribution">Monthly contribution (LKR)</Label>
            <Input
              id="goal-contribution"
              type="number"
              min={0}
              step="any"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
