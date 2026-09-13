"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { CurrencyCode } from "@/lib/currency";
import { convertCurrency, formatCurrency, USD_LKR_RATE } from "@/lib/currency";

type CurrencyContextValue = {
  displayCurrency: CurrencyCode;
  toggleCurrency: () => void;
  setDisplayCurrency: (currency: CurrencyCode) => void;
  rate: number;
  rateFetchedAt: Date | null;
  convert: (amount: number, from: CurrencyCode) => number;
  format: (amount: number, from: CurrencyCode) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  children,
  initialRate,
  initialRateFetchedAt,
}: {
  children: React.ReactNode;
  // Passed from the root layout (a Server Component), which resolves the
  // live/cached USD->LKR rate via src/lib/fx.ts before first paint — falls
  // back to the static constant only if that prop is never supplied (e.g. in
  // isolated component usage).
  initialRate?: number;
  initialRateFetchedAt?: string | null;
}) {
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>("LKR");
  const rate = initialRate ?? USD_LKR_RATE;
  const rateFetchedAt = useMemo(
    () => (initialRateFetchedAt ? new Date(initialRateFetchedAt) : null),
    [initialRateFetchedAt]
  );

  const toggleCurrency = useCallback(() => {
    setDisplayCurrency((prev) => (prev === "USD" ? "LKR" : "USD"));
  }, []);

  const convert = useCallback(
    (amount: number, from: CurrencyCode) => convertCurrency(amount, from, displayCurrency, rate),
    [displayCurrency, rate]
  );

  const format = useCallback(
    (amount: number, from: CurrencyCode) =>
      formatCurrency(convertCurrency(amount, from, displayCurrency, rate), displayCurrency),
    [displayCurrency, rate]
  );

  const value = useMemo(
    () => ({
      displayCurrency,
      toggleCurrency,
      setDisplayCurrency,
      rate,
      rateFetchedAt,
      convert,
      format,
    }),
    [displayCurrency, toggleCurrency, rate, rateFetchedAt, convert, format]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
