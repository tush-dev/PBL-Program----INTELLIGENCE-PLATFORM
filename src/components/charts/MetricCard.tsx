"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { TrendData } from "@/types";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: TrendData;
  icon?: React.ReactNode;
  className?: string;
  variant?: "default" | "critical" | "at-risk" | "behind" | "on-track";
}

const variantStyles: Record<string, { border: string; bg: string; icon: string; value: string }> = {
  critical: {
    border: "border-l-red-500",
    bg: "bg-red-50/50 dark:bg-red-950/30",
    icon: "text-red-500 dark:text-red-400",
    value: "text-red-700 dark:text-red-400",
  },
  "at-risk": {
    border: "border-l-orange-500",
    bg: "bg-orange-50/50 dark:bg-orange-950/30",
    icon: "text-orange-500 dark:text-orange-400",
    value: "text-orange-700 dark:text-orange-400",
  },
  behind: {
    border: "border-l-amber-500",
    bg: "bg-amber-50/50 dark:bg-amber-950/30",
    icon: "text-amber-500 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-400",
  },
  "on-track": {
    border: "border-l-emerald-500",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/30",
    icon: "text-emerald-500 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-400",
  },
  default: {
    border: "border-l-slate-300 dark:border-l-slate-600",
    bg: "dark:bg-slate-800",
    icon: "text-slate-400 dark:text-slate-500",
    value: "text-slate-900 dark:text-slate-100",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
  variant = "default",
}: MetricCardProps) {
  const vs = variantStyles[variant] || variantStyles.default;

  return (
    <Card className={cn("border-l-4 card-hover", vs.border, vs.bg, className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
              variant === "critical" ? "bg-red-100 dark:bg-red-900/50" :
              variant === "at-risk" ? "bg-orange-100 dark:bg-orange-900/50" :
              variant === "behind" ? "bg-amber-100 dark:bg-amber-900/50" :
              variant === "on-track" ? "bg-emerald-100 dark:bg-emerald-900/50" :
              "bg-slate-100 dark:bg-slate-800"
            )}>
              <div className={cn("h-4 w-4", vs.icon)}>{icon}</div>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className={cn(
              "text-2xl font-bold truncate",
              vs.value
            )}>
              {value}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {title}
            </p>
            {subtitle && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
            {trend.direction === "up" && (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
            )}
            {trend.direction === "down" && (
              <TrendingDown className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
            )}
            {trend.direction === "stable" && (
              <Minus className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            )}
            <span
              className={cn(
                "font-medium",
                trend.direction === "up" && "text-emerald-600 dark:text-emerald-400",
                trend.direction === "down" && "text-red-600 dark:text-red-400",
                trend.direction === "stable" && "text-slate-500 dark:text-slate-400"
              )}
            >
              {trend.absoluteChange >= 0 ? "+" : ""}
              {trend.absoluteChange}%
            </span>
            <span className="text-slate-400 dark:text-slate-500">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
