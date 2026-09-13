import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BillsCalendar } from "@/components/dashboard/bills-calendar";

export default async function BillsCalendarPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [debts, recurringTransactions] = await Promise.all([
    prisma.debtTracker.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId, isRecurring: true },
      include: { category: true },
    }),
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
        <h1 className="text-xl font-semibold">Bills & Installments Calendar</h1>
        <p className="text-sm text-muted-foreground">
          See upcoming recurring bills and installment payments before they hit
        </p>
      </div>

      <BillsCalendar debts={debts} recurringTransactions={recurringTransactions} />
    </div>
  );
}
