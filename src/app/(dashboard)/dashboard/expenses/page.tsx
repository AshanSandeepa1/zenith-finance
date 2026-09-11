import { auth } from "@/auth";
import { getDashboardData } from "@/lib/finance";
import { DebtTrackerCard } from "@/components/dashboard/debt-tracker-card";
import { ExpenseCategoryList } from "@/components/dashboard/expense-category-list";
import { TransactionDialog } from "@/components/dashboard/transaction-dialog";
import { DebtDialog } from "@/components/dashboard/debt-dialog";

export default async function ExpensesPage() {
  const session = await auth();
  const data = await getDashboardData(session!.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Expenses & BNPL Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Active outflows this month and upcoming installment plan roll-offs
          </p>
        </div>
        <TransactionDialog categories={data.categories} accounts={data.financialAccounts} />
      </div>

      <ExpenseCategoryList expensesByCategory={data.expensesByCategory} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Installment plans</h2>
          <DebtDialog />
        </div>
        {data.debtTrackers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.debtTrackers.map((debt) => (
              <DebtTrackerCard key={debt.id} debt={debt} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active installment plans.</p>
        )}
      </div>
    </div>
  );
}
