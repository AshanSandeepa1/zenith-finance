"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { CurrencyCode } from "@/lib/currency";
import { convertCurrency, formatCurrency, USD_LKR_RATE } from "@/lib/currency";

type CurrencyContextValue = {
  displayCurrency: CurrencyCode;
  toggleCurrency: () => void;
  setDisplayCurrency: (currency: CurrencyCode) => void;
  rate: number;
  convert: (amount: number, from: CurrencyCode) => number;
  format: (amount: number, from: CurrencyCode) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>("LKR");

  const toggleCurrency = useCallback(() => {
    setDisplayCurrency((prev) => (prev === "USD" ? "LKR" : "USD"));
  }, []);

  const convert = useCallback(
    (amount: number, from: CurrencyCode) => convertCurrency(amount, from, displayCurrency),
    [displayCurrency]
  );

  const format = useCallback(
    (amount: number, from: CurrencyCode) =>
      formatCurrency(convertCurrency(amount, from, displayCurrency), displayCurrency),
    [displayCurrency]
  );

  const value = useMemo(
    () => ({
      displayCurrency,
      toggleCurrency,
      setDisplayCurrency,
      rate: USD_LKR_RATE,
      convert,
      format,
    }),
    [displayCurrency, toggleCurrency, convert, format]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
