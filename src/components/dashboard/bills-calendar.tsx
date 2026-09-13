"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category, DebtTracker, Transaction } from "@prisma/client";

type RecurringTransaction = Transaction & { category: Category | null };

type CalendarChip = { label: string; tone: "rose" | "amber" | "emerald" | "indigo" };

const TONE_CLASSES: Record<CalendarChip["tone"], string> = {
  rose: "bg-rose-500/15 text-rose-400",
  amber: "bg-amber-500/15 text-amber-400",
  emerald: "bg-emerald-500/15 text-emerald-400",
  indigo: "bg-indigo-500/15 text-indigo-400",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function BillsCalendar({
  debts,
  recurringTransactions,
}: {
  debts: DebtTracker[];
  recurringTransactions: RecurringTransaction[];
}) {
  const [viewDate, setViewDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarChip[]>();
    const push = (day: number, chip: CalendarChip) => {
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(chip);
    };
    const clampDay = (day: number) => Math.min(day, daysInMonth(year, month));

    for (const debt of debts) {
      if (debt.remainingMonths <= 0) continue;
      const expiry = new Date(debt.expiryDate);
      const monthsUntilExpiry = (expiry.getFullYear() - year) * 12 + (expiry.getMonth() - month);
      if (monthsUntilExpiry < 0) continue;
      push(clampDay(expiry.getDate()), {
        label: debt.itemName,
        tone: debt.status === "EXPIRING_THIS_MONTH" ? "rose" : "amber",
      });
    }

    for (const t of recurringTransactions) {
      const start = new Date(t.date);
      if (year < start.getFullYear() || (year === start.getFullYear() && month < start.getMonth())) {
        continue;
      }
      push(clampDay(start.getDate()), {
        label: t.description || t.category?.name || "Recurring",
        tone: t.category?.type === "INCOME" ? "emerald" : "indigo",
      });
    }

    return map;
  }, [debts, recurringTransactions, year, month]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = daysInMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium">
          {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous month"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next month"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} className="aspect-square" />;
          const chips = eventsByDay.get(day) ?? [];
          const isToday = isCurrentMonth && today.getDate() === day;
          return (
            <div
              key={day}
              className={cn(
                "aspect-square rounded-lg border border-transparent p-1 flex flex-col gap-0.5 overflow-hidden",
                isToday && "border-indigo-500/50 bg-indigo-500/5"
              )}
            >
              <span className={cn("text-[11px]", isToday ? "text-indigo-400 font-semibold" : "text-muted-foreground")}>
                {day}
              </span>
              <div className="flex flex-col gap-0.5 min-h-0">
                {chips.slice(0, 2).map((chip, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      "truncate rounded px-1 py-0.5 text-[9px] leading-tight",
                      TONE_CLASSES[chip.tone]
                    )}
                    title={chip.label}
                  >
                    {chip.label}
                  </span>
                ))}
                {chips.length > 2 && (
                  <span className="text-[9px] text-muted-foreground px-1">+{chips.length - 2} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-400" /> Expiring this month
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Ongoing installment
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-400" /> Recurring expense
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Recurring income
        </span>
      </div>
    </div>
  );
}
