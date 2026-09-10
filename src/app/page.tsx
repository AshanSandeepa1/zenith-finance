import Link from "next/link";
import { redirect } from "next/navigation";
import { Zap, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400 mb-6">
        <Zap className="h-7 w-7" />
      </div>
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Zenith Finance</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Track your net worth, cash flow, sinking funds, and installment plans across USD and LKR
        in one obsidian-dark dashboard.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Button render={<Link href="/register" />} nativeButton={false} size="lg">
          Get started <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        <Button render={<Link href="/login" />} nativeButton={false} variant="outline" size="lg">
          Sign in
        </Button>
      </div>
    </div>
  );
}
