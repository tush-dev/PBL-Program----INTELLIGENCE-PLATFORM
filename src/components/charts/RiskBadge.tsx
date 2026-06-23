import { cn } from "@/lib/utils";
import { AlertTriangle, AlertCircle, CheckCircle2, MinusCircle } from "lucide-react";

interface RiskBadgeProps {
  level: string;
  size?: "sm" | "default" | "lg";
  showIcon?: boolean;
}

const riskConfig: Record<string, { icon: React.ElementType; className: string }> = {
  Critical: {
    icon: AlertCircle,
    className: "risk-critical bg-[var(--risk-bg)] text-[var(--risk-text)] border-[var(--risk-border)]",
  },
  "At Risk": {
    icon: AlertTriangle,
    className: "risk-at-risk bg-[var(--risk-bg)] text-[var(--risk-text)] border-[var(--risk-border)]",
  },
  Behind: {
    icon: MinusCircle,
    className: "risk-behind bg-[var(--risk-bg)] text-[var(--risk-text)] border-[var(--risk-border)]",
  },
  "On Track": {
    icon: CheckCircle2,
    className: "risk-on-track bg-[var(--risk-bg)] text-[var(--risk-text)] border-[var(--risk-border)]",
  },
};

export function RiskBadge({ level, size = "default", showIcon = true }: RiskBadgeProps) {
  const config = riskConfig[level];
  const Icon = config?.icon || MinusCircle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        config?.className || "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700",
        size === "sm" && "text-[10px] px-1.5 py-0.5",
        size === "default" && "text-xs px-2 py-0.5",
        size === "lg" && "text-sm px-3 py-1"
      )}
    >
      {showIcon && <Icon className={cn("shrink-0", size === "sm" ? "h-2.5 w-2.5" : size === "default" ? "h-3 w-3" : "h-3.5 w-3.5")} />}
      {level}
    </span>
  );
}
