"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SelectNative } from "@/components/ui/select-native";
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
import { relativeTimeFromNow } from "@/lib/relative-time";
import { CURRENCIES } from "@/lib/currencies";

export function TopBar() {
  const { data: session } = useSession();
  const { displayCurrency, setDisplayCurrency, isChangingCurrency, usdToDisplayRate, usdToLkrFetchedAt } =
    useCurrency();

  const initials = session?.user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-6">
      <div className="hidden sm:block">
        {displayCurrency !== "USD" && (
          <p className="text-sm text-muted-foreground">
            USD/{displayCurrency} spot{" "}
            <span className="text-foreground font-medium tabular-nums">
              {usdToDisplayRate.toFixed(2)}
            </span>
            {usdToLkrFetchedAt && (
              <span className="ml-1.5 text-xs text-muted-foreground/70">
                · updated {relativeTimeFromNow(usdToLkrFetchedAt)}
              </span>
            )}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <SelectNative
          aria-label="Display currency"
          className="w-[4.75rem]"
          value={displayCurrency}
          disabled={isChangingCurrency}
          onChange={(e) => setDisplayCurrency(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </SelectNative>

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
