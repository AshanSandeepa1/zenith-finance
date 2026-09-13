"use client";

import { createContext, useContext, useCallback, useMemo, useTransition } from "react";
import { toast } from "sonner";
import type { CurrencyCode } from "@/lib/currency";
import { convertCurrency, formatCurrency } from "@/lib/currency";
import { updateBaseCurrency } from "@/app/actions/settings";

type CurrencyContextValue = {
  displayCurrency: CurrencyCode;
  setDisplayCurrency: (currency: CurrencyCode) => void;
  isChangingCurrency: boolean;
  // USD -> displayCurrency, i.e. the "USD/<displayCurrency> spot" figure —
  // USD is treated as the anchor currency it's always quoted against.
  usdToDisplayRate: number;
  usdToLkrFetchedAt: Date | null;
  convert: (amount: number, from: CurrencyCode) => number;
  format: (amount: number, from: CurrencyCode) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  children,
  initialDisplayCurrency,
  usdToLkrRate,
  usdToLkrFetchedAt,
  lkrToDisplayRate,
}: {
  children: React.ReactNode;
  // All resolved server-side (src/app/(dashboard)/layout.tsx) from the
  // signed-in user's baseCurrency and live/cached FX data — see
  // src/lib/fx.ts.
  initialDisplayCurrency: string;
  usdToLkrRate: number;
  usdToLkrFetchedAt: string | null;
  lkrToDisplayRate: number;
}) {
  const [isChangingCurrency, startTransition] = useTransition();

  const usdToLkrFetchedAtDate = useMemo(
    () => (usdToLkrFetchedAt ? new Date(usdToLkrFetchedAt) : null),
    [usdToLkrFetchedAt]
  );

  // Changing currency needs a fresh LKR->newCurrency rate, which only the
  // server has. router.refresh() + clearing an optimistic value raced with
  // the new props landing (the UI would flash back to the old currency) —
  // a full reload after the write confirms is slower but unambiguous.
  const setDisplayCurrency = useCallback((currency: string) => {
    startTransition(async () => {
      try {
        await updateBaseCurrency(currency);
        window.location.reload();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't change currency");
      }
    });
  }, []);

  const toLKR = useCallback(
    (amount: number, from: string) => {
      if (from === "LKR") return amount;
      if (from === "USD") return convertCurrency(amount, "USD", "LKR", usdToLkrRate);
      return amount;
    },
    [usdToLkrRate]
  );

  const convert = useCallback(
    (amount: number, from: string) => {
      const lkrAmount = toLKR(amount, from);
      return initialDisplayCurrency === "LKR"
        ? lkrAmount
        : convertCurrency(lkrAmount, "LKR", initialDisplayCurrency, lkrToDisplayRate);
    },
    [toLKR, initialDisplayCurrency, lkrToDisplayRate]
  );

  const format = useCallback(
    (amount: number, from: string) => formatCurrency(convert(amount, from), initialDisplayCurrency),
    [convert, initialDisplayCurrency]
  );

  // Derived from the two rates we already fetch — no extra FX call needed:
  // 1 USD = usdToLkrRate LKR = usdToLkrRate * lkrToDisplayRate in the
  // selected display currency.
  const usdToDisplayRate = useMemo(() => {
    if (initialDisplayCurrency === "USD") return 1;
    if (initialDisplayCurrency === "LKR") return usdToLkrRate;
    return usdToLkrRate * lkrToDisplayRate;
  }, [initialDisplayCurrency, usdToLkrRate, lkrToDisplayRate]);

  const value = useMemo(
    () => ({
      displayCurrency: initialDisplayCurrency,
      setDisplayCurrency,
      isChangingCurrency,
      usdToDisplayRate,
      usdToLkrFetchedAt: usdToLkrFetchedAtDate,
      convert,
      format,
    }),
    [
      initialDisplayCurrency,
      setDisplayCurrency,
      isChangingCurrency,
      usdToDisplayRate,
      usdToLkrFetchedAtDate,
      convert,
      format,
    ]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
