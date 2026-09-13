// Generic currency code — validated against the curated list in
// src/lib/currencies.ts wherever user input sets one, not a fixed union
// here, so supporting a new currency never needs a type change.
export type CurrencyCode = string;

// Ultimate fallback when live/cached FX data is unavailable at all (see
// src/lib/fx.ts) — everything else uses a real fetched rate.
export const USD_LKR_RATE = Number(process.env.NEXT_PUBLIC_USD_LKR_RATE ?? 298.5);

const ZERO_DECIMAL_CURRENCIES = new Set(["LKR", "JPY"]);

// `rate` must already be oriented `from` -> `to` (i.e. amount * rate yields
// the `to`-currency value) — callers are responsible for fetching the
// correctly-directed rate (see src/lib/fx.ts's getExchangeRate).
export function convertCurrency(amount: number, from: string, to: string, rate: number): number {
  if (from === to) return amount;
  return amount * rate;
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      maximumFractionDigits: ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  }
}
