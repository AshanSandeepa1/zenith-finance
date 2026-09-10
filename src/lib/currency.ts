export type CurrencyCode = "USD" | "LKR";

export const USD_LKR_RATE = Number(process.env.NEXT_PUBLIC_USD_LKR_RATE ?? 298.5);

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rate: number = USD_LKR_RATE
): number {
  if (from === to) return amount;
  if (from === "USD" && to === "LKR") return amount * rate;
  if (from === "LKR" && to === "USD") return amount / rate;
  return amount;
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: currency === "LKR" ? "code" : "symbol",
    maximumFractionDigits: currency === "LKR" ? 0 : 2,
  }).format(amount);
}
