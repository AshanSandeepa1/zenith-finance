"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ArrowLeftRight, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/components/providers/currency-provider";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

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

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCurrency}
          className="gap-2 border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-400"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          <span className="tabular-nums">{displayCurrency}</span>
        </Button>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<button aria-label="Account menu" className="rounded-full" />}
          >
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
                {initials || "ZF"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="truncate">
                {session?.user?.name ?? session?.user?.email ?? "Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
