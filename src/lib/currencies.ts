import { z } from "zod";

export type CurrencyInfo = {
  code: string;
  name: string;
  symbol: string;
};

// Curated list — not a DB enum, so adding a currency here never needs a
// migration. Codes are validated against this list wherever user input sets
// a currency (registration, account creation, transaction entry).
export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
];

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as [string, ...string[]];

export const currencyCodeSchema = z.enum(CURRENCY_CODES);

export function getCurrencyInfo(code: string): CurrencyInfo {
  return CURRENCIES.find((c) => c.code === code) ?? { code, name: code, symbol: code };
}
