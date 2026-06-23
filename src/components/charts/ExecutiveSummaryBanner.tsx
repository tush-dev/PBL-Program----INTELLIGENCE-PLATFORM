"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { ExecutiveSummary } from "@/types";

interface ExecutiveSummaryBannerProps {
  data: ExecutiveSummary | null;
  loading?: boolean;
}

function StatTile({
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
    <div className="flex flex-col">
      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-xl font-bold text-slate-900">{value}</span>
      <span className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        direction === "up" && "text-emerald-600",
        direction === "down" && "text-red-600",
        direction === "stable" && "text-slate-400"
      )}>
        {direction === "up" && <TrendingUp className="h-3 w-3" />}
        {direction === "down" && <TrendingDown className="h-3 w-3" />}
        {change}
      </span>
    </div>
  );
}

export function ExecutiveSummaryBanner({ data, loading }: ExecutiveSummaryBannerProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-48" />
            <div className="flex gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 rounded w-24" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-r from-emerald-600 to-emerald-700">
      <CardContent className="p-5 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
          <div className="shrink-0">
            <h2 className="text-lg font-bold">{data.month} {data.year} Overview</h2>
            <p className="text-sm text-emerald-200 mt-0.5">Program Performance Summary</p>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatTile
              label="Attendance"
              value={`${data.attendanceRate}%`}
              change={`${data.attendanceChange >= 0 ? "+" : ""}${data.attendanceChange}% from ${data.month === "January" ? "Dec" : "last month"}`}
              direction={data.attendanceChange >= 0 ? "up" : "down"}
            />
            <StatTile
              label="Participation"
              value={`${data.participationRate}%`}
              change={`${data.participationChange >= 0 ? "+" : ""}${data.participationChange}% from ${data.month === "January" ? "Dec" : "last month"}`}
              direction={data.participationChange >= 0 ? "up" : "down"}
            />
            <StatTile
              label="Evidence Submission"
              value={`${data.evidenceRate}%`}
              change={`${data.evidenceChange >= 0 ? "+" : ""}${data.evidenceChange}% from ${data.month === "January" ? "Dec" : "last month"}`}
              direction={data.evidenceChange >= 0 ? "up" : "down"}
            />
            <StatTile
              label="Districts at Risk"
              value={String(data.criticalDistricts)}
              change={data.criticalDistricts > 0 ? "Require immediate attention" : "All on track"}
              direction={data.criticalDistricts > 0 ? "down" : "up"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
