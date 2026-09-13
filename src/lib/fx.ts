import { prisma } from "@/lib/prisma";
import { USD_LKR_RATE } from "@/lib/currency";

const STALE_AFTER_MS = 6 * 60 * 60 * 1000; // 6 hours
const FETCH_TIMEOUT_MS = 5000;

export type RateResult = {
  rate: number;
  fetchedAt: Date;
  source: "live" | "cache" | "fallback";
};

async function fetchLiveRate(base: string, target: string): Promise<number | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      signal: controller.signal,
      // Rates move slowly enough that Next's data cache can hold this briefly
      // too, but the DB cache below is what actually protects the free API.
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
    if (data.result !== "success" || !data.rates?.[target]) return null;

    return data.rates[target];
  } catch {
    return null;
  }
}

// Live-fetches base->target with a DB-backed cache: fresh cache (<6h) is
// served without a network call; a stale or missing cache triggers a live
// fetch, which on failure falls back to whatever cache exists (however old)
// and finally to a hardcoded constant if there's no cache at all.
export async function getExchangeRate(base: string, target: string): Promise<RateResult> {
  if (base === target) return { rate: 1, fetchedAt: new Date(), source: "live" };

  const cached = await prisma.exchangeRate.findUnique({
    where: { base_target: { base, target } },
  });

  if (cached && Date.now() - cached.fetchedAt.getTime() < STALE_AFTER_MS) {
    return { rate: cached.rate, fetchedAt: cached.fetchedAt, source: "cache" };
  }

  const liveRate = await fetchLiveRate(base, target);
  if (liveRate != null) {
    const updated = await prisma.exchangeRate.upsert({
      where: { base_target: { base, target } },
      create: { base, target, rate: liveRate },
      update: { rate: liveRate, fetchedAt: new Date() },
    });
    return { rate: updated.rate, fetchedAt: updated.fetchedAt, source: "live" };
  }

  if (cached) {
    return { rate: cached.rate, fetchedAt: cached.fetchedAt, source: "cache" };
  }

  return { rate: USD_LKR_RATE, fetchedAt: new Date(), source: "fallback" };
}

export async function getUsdToLkrRate(): Promise<RateResult> {
  return getExchangeRate("USD", "LKR");
}
