"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
interface HeatmapItem {
  name: string;
  riskLevel: string;
  riskScore: number;
}

interface HeatmapProps {
  data: HeatmapItem[];
  loading?: boolean;
}

function getScoreColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 90) return { bg: "bg-emerald-700 dark:bg-emerald-600", text: "text-white", label: "90-100" };
  if (score >= 75) return { bg: "bg-emerald-400 dark:bg-emerald-500", text: "text-white", label: "75-89" };
  if (score >= 60) return { bg: "bg-yellow-400 dark:bg-yellow-600", text: "text-slate-800 dark:text-white", label: "60-74" };
  if (score >= 35) return { bg: "bg-orange-500 dark:bg-orange-600", text: "text-white", label: "35-59" };
  return { bg: "bg-red-500 dark:bg-red-600", text: "text-white", label: "0-34" };
}

function getScoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-700 dark:border-emerald-600";
  if (score >= 75) return "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-500";
  if (score >= 60) return "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-400 dark:border-yellow-500";
  if (score >= 35) return "bg-orange-50 dark:bg-orange-950/30 border-orange-500 dark:border-orange-400";
  return "bg-red-50 dark:bg-red-950/30 border-red-500 dark:border-red-400";
}

export function DistrictRiskHeatmap({ data, loading }: HeatmapProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">District Risk Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">District Risk Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="font-medium">Score:</span>
          {[
            { range: "90-100", color: "bg-emerald-700" },
            { range: "75-89", color: "bg-emerald-400" },
            { range: "60-74", color: "bg-yellow-400" },
            { range: "35-59", color: "bg-orange-500" },
            { range: "0-34", color: "bg-red-500" },
          ].map((l) => (
            <span key={l.range} className="inline-flex items-center gap-1">
              <span className={cn("w-2.5 h-2.5 rounded", l.color)} />
              {l.range}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {data.map((item) => {
            const sc = getScoreColor(item.riskScore);
            return (
              <div
                key={item.name}
                className={cn(
                  "px-2 py-2 rounded-md text-center border transition-transform hover:scale-105 cursor-default",
                  getScoreBg(item.riskScore)
                )}
                title={`${item.name}: Score ${item.riskScore} (${sc.label})`}
              >
                <p className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 truncate leading-tight">
                  {item.name}
                </p>
                <span className={cn(
                  "inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5",
                  sc.bg,
                  sc.text
                )}>
                  {item.riskScore}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
