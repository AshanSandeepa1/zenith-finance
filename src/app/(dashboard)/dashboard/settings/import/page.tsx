import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CsvImport } from "@/components/settings/csv-import";

export default async function ImportPage() {
  const session = await auth();
  const categories = await prisma.category.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
        </Link>
        <h1 className="text-xl font-semibold">Import transactions</h1>
        <p className="text-sm text-muted-foreground">
          Bring in historical expenses from a CSV export
        </p>
      </div>

      <CsvImport categories={categories} />
    </div>
  );
}
