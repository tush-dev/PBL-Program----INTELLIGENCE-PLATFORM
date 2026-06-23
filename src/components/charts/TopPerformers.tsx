"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "./RiskBadge";
import { Trophy, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformerData {
  name: string;
  participationRate: number;
  attendanceRate: number;
  evidenceSubmissionRate: number;
  riskLevel: string;
}

interface TopPerformersProps {
  title?: string;
  data: PerformerData[];
  loading?: boolean;
}

export function TopPerformers({ title = "Top Performers", data, loading }: TopPerformersProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {data.map((item, i) => (
          <div
            key={item.name}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
              i === 0 ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" : "bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700"
            )}
          >
            <span className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
              i === 0 ? "bg-amber-400 dark:bg-amber-500 text-white" :
              i === 1 ? "bg-slate-300 dark:bg-slate-600 text-white" :
              i === 2 ? "bg-amber-700 dark:bg-amber-600 text-white" :
              "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
            )}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>P: {item.participationRate}%</span>
                <span>A: {item.attendanceRate}%</span>
                <span>E: {item.evidenceSubmissionRate}%</span>
              </div>
            </div>
            <RiskBadge level={item.riskLevel} size="sm" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function BottomPerformers({ title = "Needs Attention", data, loading }: TopPerformersProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
          <Award className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {data.map((item, i) => (
          <div
            key={item.name}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <span className="w-6 h-6 rounded-full bg-red-200 dark:bg-red-900/50 text-red-700 dark:text-red-400 flex items-center justify-center text-xs font-bold shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{item.name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>P: {item.participationRate}%</span>
                <span>A: {item.attendanceRate}%</span>
                <span>E: {item.evidenceSubmissionRate}%</span>
              </div>
            </div>
            <RiskBadge level={item.riskLevel} size="sm" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
