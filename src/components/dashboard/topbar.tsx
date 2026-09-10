"use client";

import { useSession } from "next-auth/react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrency } from "@/components/providers/currency-provider";

export function TopBar() {
  const { data: session } = useSession();
  const { displayCurrency, toggleCurrency, rate } = useCurrency();

  const initials = session?.user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-6">
      <div>
        <p className="text-sm text-muted-foreground">
          USD/LKR spot <span className="text-foreground font-medium tabular-nums">{rate.toFixed(2)}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCurrency}
          className="gap-2 border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-400"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          <span className="tabular-nums">{displayCurrency}</span>
        </Button>

        <Avatar className="h-9 w-9 border border-border">
          <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
            {initials || "ZF"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
