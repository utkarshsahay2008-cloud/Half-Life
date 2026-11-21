/**
 * Canonical Chronometer Timeline Configuration
 * Ensures 100% mathematical precision and alignment across all diagrams and scrubbers.
 */

export const CHRONOMETER_START_DATE = "2023-06-01";
export const CHRONOMETER_END_DATE = "2026-11-20";

export const CHRONOMETER_MIN_EPOCH = new Date(CHRONOMETER_START_DATE).getTime();
export const CHRONOMETER_MAX_EPOCH = new Date(CHRONOMETER_END_DATE).getTime();

export interface ChronoMilestone {
  date: string;
  label: string;
  sublabel: string;
  epoch: number;
  percent: number; // 0 to 100
  color: string;
}

export const CHRONOMETER_MILESTONES: ChronoMilestone[] = [
  {
    date: "2023-06-01",
    label: "JUN 2023",
    sublabel: "Baseline",
    epoch: new Date("2023-06-01").getTime(),
    percent: 0,
    color: "#64748B",
  },
  {
    date: "2024-01-01",
    label: "JAN 2024",
    sublabel: "Initial Rates",
    epoch: new Date("2024-01-01").getTime(),
    percent: ((new Date("2024-01-01").getTime() - CHRONOMETER_MIN_EPOCH) / (CHRONOMETER_MAX_EPOCH - CHRONOMETER_MIN_EPOCH)) * 100,
    color: "#3B82F6",
  },
  {
    date: "2024-04-17",
    label: "APR 2024",
    sublabel: "v1 Sunset",
    epoch: new Date("2024-04-17").getTime(),
    percent: ((new Date("2024-04-17").getTime() - CHRONOMETER_MIN_EPOCH) / (CHRONOMETER_MAX_EPOCH - CHRONOMETER_MIN_EPOCH)) * 100,
    color: "#F59E0B",
  },
  {
    date: "2024-08-14",
    label: "AUG 2024",
    sublabel: "EU AI Act",
    epoch: new Date("2024-08-14").getTime(),
    percent: ((new Date("2024-08-14").getTime() - CHRONOMETER_MIN_EPOCH) / (CHRONOMETER_MAX_EPOCH - CHRONOMETER_MIN_EPOCH)) * 100,
    color: "#EC4899",
  },
  {
    date: "2024-10-01",
    label: "OCT 2024",
    sublabel: "Exec Shift",
    epoch: new Date("2024-10-01").getTime(),
    percent: ((new Date("2024-10-01").getTime() - CHRONOMETER_MIN_EPOCH) / (CHRONOMETER_MAX_EPOCH - CHRONOMETER_MIN_EPOCH)) * 100,
    color: "#8B5CF6",
  },
  {
    date: "2025-06-01",
    label: "JUN 2025",
    sublabel: "Next-Gen APIs",
    epoch: new Date("2025-06-01").getTime(),
    percent: ((new Date("2025-06-01").getTime() - CHRONOMETER_MIN_EPOCH) / (CHRONOMETER_MAX_EPOCH - CHRONOMETER_MIN_EPOCH)) * 100,
    color: "#06B6D4",
  },
  {
    date: "2026-11-20",
    label: "NOV 2026",
    sublabel: "Today",
    epoch: new Date("2026-11-20").getTime(),
    percent: 100,
    color: "#10B981",
  },
];

/**
 * Calculates the exact mathematical decay freshness score (0 - 100)
 * N(t) = N0 * (1/2)^((t - t_expiry) / t_half)
 */
export function calculateMathematicalFreshness(
  halfLifeDays: number,
  expiredAtDate: string,
  simulatedDate: string
): { score: number; status: "FRESH" | "DECAYING" | "STALE"; isExpired: boolean; daysPastExpiry: number } {
  // Static invariant laws never decay
  if (expiredAtDate === "NEVER" || halfLifeDays <= 0 || halfLifeDays >= 99999) {
    return { score: 100, status: "FRESH", isExpired: false, daysPastExpiry: 0 };
  }

  const expiryEpoch = new Date(expiredAtDate).getTime();
  const simEpoch = new Date(simulatedDate).getTime() || CHRONOMETER_MAX_EPOCH;

  // Before expiration date: 100% fresh
  if (simEpoch <= expiryEpoch) {
    return { score: 100, status: "FRESH", isExpired: false, daysPastExpiry: 0 };
  }

  // After expiration date: exponential half-life decay
  const daysPastExpiry = (simEpoch - expiryEpoch) / (1000 * 60 * 60 * 24);
  const score = Math.max(5, Math.min(100, Math.round(100 * Math.pow(0.5, daysPastExpiry / halfLifeDays))));
  const status: "FRESH" | "DECAYING" | "STALE" = score >= 80 ? "FRESH" : score >= 45 ? "DECAYING" : "STALE";

  return { score, status, isExpired: true, daysPastExpiry: Math.round(daysPastExpiry) };
}
