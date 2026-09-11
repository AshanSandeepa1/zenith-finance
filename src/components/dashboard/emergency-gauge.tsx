"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ShieldCheck, Pencil, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCurrency } from "@/components/providers/currency-provider";
import { updateEmergencyFundTarget } from "@/app/actions/goals";

export function EmergencyFundGauge({
  currentLKR,
  targetLKR,
  progress,
}: {
  currentLKR: number;
  targetLKR: number;
  progress: number;
}) {
  const { format } = useCurrency();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(String(targetLKR));
  const [isPending, startTransition] = useTransition();
  const percent = Math.round(progress * 1000) / 10;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateEmergencyFundTarget(Number(target));
        toast.success("Emergency fund target updated");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Emergency Fund</p>
            <p className="text-xs text-muted-foreground">
              {format(currentLKR, "LKR")} of {targetLKR > 0 ? format(targetLKR, "LKR") : "no target set"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-emerald-400 tabular-nums">{percent}%</span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Edit emergency fund target" />}
            >
              <Pencil className="h-3.5 w-3.5" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit emergency fund target</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ef-target">Target amount (LKR)</Label>
                  <Input
                    id="ef-target"
                    type="number"
                    min={0}
                    step="any"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    A common rule of thumb is 3–6 months of essential expenses.
                  </p>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save target
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Progress
        value={percent}
        className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:bg-emerald-500"
      />
    </div>
  );
}
