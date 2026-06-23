"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ExecutiveSummary } from "@/types";

interface ExecutiveSummaryBannerProps {
  data: ExecutiveSummary | null;
  loading?: boolean;
}

function CompactStat({
  label,
  value,
  change,
  direction,
}: {
  label: string;
  value: string;
  change: string;
  direction: "up" | "down" | "stable";
}) {
  return (
    <div className="flex items-center gap-2 text-white">
      <span className="text-[10px] font-medium text-emerald-200 uppercase tracking-wider min-w-[60px]">{label}</span>
      <span className="text-sm font-bold">{value}</span>
      <span className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-medium",
        direction === "up" && "text-emerald-300",
        direction === "down" && "text-red-300",
        direction === "stable" && "text-emerald-200"
      )}>
        {direction === "up" && <TrendingUp className="h-2.5 w-2.5" />}
        {direction === "down" && <TrendingDown className="h-2.5 w-2.5" />}
        {direction === "stable" && <Minus className="h-2.5 w-2.5" />}
        {change}
      </span>
    </div>
  );
}

export function ExecutiveSummaryBanner({ data, loading }: ExecutiveSummaryBannerProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-3">
          <div className="animate-pulse flex gap-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-800 dark:to-emerald-900">
      <CardContent className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <div className="shrink-0 flex items-center gap-2">
            <h2 className="text-sm font-bold text-white whitespace-nowrap">{data.month} {data.year}</h2>
            <span className="text-[10px] text-emerald-200 hidden sm:inline">|</span>
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1">
            <CompactStat
              label="Attendance"
              value={`${data.attendanceRate}%`}
              change={`${data.attendanceChange >= 0 ? "+" : ""}${data.attendanceChange}%`}
              direction={data.attendanceChange >= 0 ? "up" : "down"}
            />
            <CompactStat
              label="Participation"
              value={`${data.participationRate}%`}
              change={`${data.participationChange >= 0 ? "+" : ""}${data.participationChange}%`}
              direction={data.participationChange >= 0 ? "up" : "down"}
            />
            <CompactStat
              label="Evidence"
              value={`${data.evidenceRate}%`}
              change={`${data.evidenceChange >= 0 ? "+" : ""}${data.evidenceChange}%`}
              direction={data.evidenceChange >= 0 ? "up" : "down"}
            />
            <CompactStat
              label="At Risk"
              value={String(data.criticalDistricts)}
              change={data.criticalDistricts > 0 ? `${data.criticalDistricts} district${data.criticalDistricts > 1 ? "s" : ""}` : "None"}
              direction={data.criticalDistricts > 0 ? "down" : "up"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
