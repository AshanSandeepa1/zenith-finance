import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TransactionHistory } from "@/components/dashboard/transaction-history";

export default async function TransactionHistoryPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [transactions, categories, accounts] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 1000,
    }),
    prisma.category.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    prisma.financialAccount.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/expenses"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Expenses
        </Link>
        <h1 className="text-xl font-semibold">Transaction History</h1>
        <p className="text-sm text-muted-foreground">
          Every transaction you&apos;ve logged or imported, filterable by month and category
        </p>
      </div>

      <TransactionHistory transactions={transactions} categories={categories} accounts={accounts} />
    </div>
  );
}
