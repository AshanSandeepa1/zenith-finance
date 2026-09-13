import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getExchangeRate, getUsdToLkrRate } from "@/lib/fx";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { TopBar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // A JWT session can outlive the User row it points to (e.g. the account
  // was deleted, or — during development — the database was reset). Without
  // this check, every write that trusts session.user.id blindly (like the
  // health-score snapshot) throws a foreign-key violation and 500s the page
  // instead of just asking the stale session to sign in again.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, baseCurrency: true },
  });
  if (!user) redirect("/login");

  const usdToLkr = await getUsdToLkrRate();
  const lkrToDisplay =
    user.baseCurrency === "LKR"
      ? { rate: 1, fetchedAt: usdToLkr.fetchedAt }
      : await getExchangeRate("LKR", user.baseCurrency);

  return (
    <CurrencyProvider
      initialDisplayCurrency={user.baseCurrency}
      usdToLkrRate={usdToLkr.rate}
      usdToLkrFetchedAt={usdToLkr.fetchedAt.toISOString()}
      lkrToDisplayRate={lkrToDisplay.rate}
    >
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
        </div>
        <MobileNav />
      </div>
    </CurrencyProvider>
  );
}
