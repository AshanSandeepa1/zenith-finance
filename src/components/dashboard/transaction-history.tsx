"use client";

import { useMemo, useState } from "react";
import { SelectNative } from "@/components/ui/select-native";
import { TransactionHistoryTable } from "@/components/dashboard/transaction-history-table";
import type { Category, FinancialAccount, Transaction } from "@prisma/client";

type TransactionWithCategory = Transaction & { category: Category | null };

const ALL = "__all__";

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function TransactionHistory({
  transactions,
  categories,
  accounts,
}: {
  transactions: TransactionWithCategory[];
  categories: Category[];
  accounts: FinancialAccount[];
}) {
  const [month, setMonth] = useState(ALL);
  const [categoryId, setCategoryId] = useState(ALL);

  const monthOptions = useMemo(() => {
    const keys = new Set(transactions.map((t) => monthKey(t.date)));
    return Array.from(keys).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (month !== ALL && monthKey(t.date) !== month) return false;
      if (categoryId !== ALL && t.categoryId !== categoryId) return false;
      return true;
    });
  }, [transactions, month, categoryId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SelectNative value={month} onChange={(e) => setMonth(e.target.value)} className="w-44">
          <option value={ALL}>All time</option>
          {monthOptions.map((key) => (
            <option key={key} value={key}>
              {monthLabel(key)}
            </option>
          ))}
        </SelectNative>
        <SelectNative
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-48"
        >
          <option value={ALL}>All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectNative>
        <span className="text-xs text-muted-foreground">
          {filtered.length} transaction{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <TransactionHistoryTable transactions={filtered} categories={categories} accounts={accounts} />
    </div>
  );
}
