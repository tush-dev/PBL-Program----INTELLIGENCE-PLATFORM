"use client";

import type { StatItem } from "@/types";

interface QuickStatsStripProps {
  items: StatItem[];
  loading?: boolean;
}

export function QuickStatsStrip({ items, loading }: QuickStatsStripProps) {
  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-3 md:grid-cols-6 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-center card-hover"
        >
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {item.label}
          </p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{item.value}</p>
          {item.trend && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.trend.direction === "up" ? "↑" : item.trend.direction === "down" ? "↓" : "→"} {item.trend.value}</p>
          )}
        </div>
      ))}
    </div>
  );
}
