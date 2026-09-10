import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SinkingFundCard } from "@/components/dashboard/sinking-fund-card";

export default async function SinkingFundsPage() {
  const session = await auth();
  const sinkingFunds = await prisma.sinkingFund.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Sinking Funds & Wishlist</h1>
        <p className="text-sm text-muted-foreground">
          Dedicated savings buckets for your day-one purchases
        </p>
      </div>

      {sinkingFunds.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sinkingFunds.map((fund) => (
            <SinkingFundCard key={fund.id} fund={fund} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No sinking funds yet.</p>
      )}
    </div>
  );
}
