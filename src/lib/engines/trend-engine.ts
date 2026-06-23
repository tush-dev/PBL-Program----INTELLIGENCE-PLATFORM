import { calculateDashboardMetrics } from "./kpi-engine";
import type { TrendData, FilterParams } from "@/types";

const MONTH_ORDER = ["July_2025", "August_2025", "September_2025"];

export function getMonthPair(month: string): { current: string; previous: string } | null {
  const idx = MONTH_ORDER.indexOf(month);
  if (idx <= 0) return null;
  return { current: month, previous: MONTH_ORDER[idx - 1] };
}

const MONTH_LABELS: Record<string, string> = {
  "July_2025": "July 2025",
  "August_2025": "August 2025",
  "September_2025": "September 2025",
};

export function getMonthLabel(month: string): string {
  return MONTH_LABELS[month] || month;
}

export function formatMonthLabel(month: string): string {
  return MONTH_LABELS[month] || month;
}

export async function calculateTrend(
  metricName: "participationRate" | "attendanceRate" | "evidenceSubmissionRate",
  currentMonth: string,
  baseFilters: FilterParams
): Promise<TrendData> {
  const pair = getMonthPair(currentMonth);
  if (!pair) {
    const current = await calculateDashboardMetrics({ ...baseFilters, month: currentMonth });
    return {
      current: current[metricName],
      previous: 0,
      absoluteChange: 0,
      percentageChange: 0,
      direction: "stable",
      label: "No previous data",
    };
  }

  const currentMetrics = await calculateDashboardMetrics({
    ...baseFilters,
    month: pair.current,
  });
  const previousMetrics = await calculateDashboardMetrics({
    ...baseFilters,
    month: pair.previous,
  });

  const current = currentMetrics[metricName];
  const previous = previousMetrics[metricName];
  const absoluteChange = Math.round((current - previous) * 100) / 100;
  const percentageChange =
    previous > 0
      ? Math.round((absoluteChange / previous) * 10000) / 100
      : 0;

  let direction: "up" | "down" | "stable";
  if (absoluteChange > 0.5) direction = "up";
  else if (absoluteChange < -0.5) direction = "down";
  else direction = "stable";

  const prevLabel = getMonthLabel(pair.previous);
  const label =
    direction === "up"
      ? `Improved from ${prevLabel}`
      : direction === "down"
      ? `Declined from ${prevLabel}`
      : `Stable from ${prevLabel}`;

  return {
    current,
    previous,
    absoluteChange,
    percentageChange,
    direction,
    label,
  };
}

export async function getMonthOverMonthMetrics(
  baseFilters: FilterParams
): Promise<{
  participationTrend: TrendData[];
  attendanceTrend: TrendData[];
  evidenceTrend: TrendData[];
}> {
  const participationTrend: TrendData[] = [];
  const attendanceTrend: TrendData[] = [];
  const evidenceTrend: TrendData[] = [];

  for (const month of MONTH_ORDER) {
    const [p, a, e] = await Promise.all([
      calculateTrend("participationRate", month, baseFilters),
      calculateTrend("attendanceRate", month, baseFilters),
      calculateTrend("evidenceSubmissionRate", month, baseFilters),
    ]);
    participationTrend.push({
      ...p,
      label: p.label === "No previous data" ? `${getMonthLabel(month)} (baseline)` : `${getMonthLabel(month)}: ${p.label}`,
    });
    attendanceTrend.push({
      ...a,
      label: a.label === "No previous data" ? `${getMonthLabel(month)} (baseline)` : `${getMonthLabel(month)}: ${a.label}`,
    });
    evidenceTrend.push({
      ...e,
      label: e.label === "No previous data" ? `${getMonthLabel(month)} (baseline)` : `${getMonthLabel(month)}: ${e.label}`,
    });
  }

  return { participationTrend, attendanceTrend, evidenceTrend };
}
