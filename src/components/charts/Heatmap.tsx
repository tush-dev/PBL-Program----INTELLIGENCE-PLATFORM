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

const riskColors: Record<string, string> = {
  Critical: "bg-red-500 text-white",
  "At Risk": "bg-orange-500 text-white",
  Behind: "bg-amber-400 text-white",
  "On Track": "bg-emerald-500 text-white",
};

const riskBg = {
  Critical: "bg-red-50 border-red-200",
  "At Risk": "bg-orange-50 border-orange-200",
  Behind: "bg-amber-50 border-amber-200",
  "On Track": "bg-emerald-50 border-emerald-200",
};

export function DistrictRiskHeatmap({ data, loading }: HeatmapProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">District Risk Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse grid grid-cols-4 gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded" />
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
        <div className="grid grid-cols-4 gap-1.5">
          {data.map((item) => (
            <div
              key={item.name}
              className={cn(
                "px-2 py-2 rounded-md text-center border transition-transform hover:scale-105 cursor-default",
                riskBg[item.riskLevel as keyof typeof riskBg] || "bg-slate-50 border-slate-200"
              )}
              title={`${item.name}: ${item.riskLevel} (Score: ${item.riskScore})`}
            >
              <p className="text-[10px] font-semibold text-slate-700 truncate leading-tight">
                {item.name}
              </p>
              <span className={cn(
                "inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-0.5",
                riskColors[item.riskLevel as keyof typeof riskColors] || "bg-slate-200 text-slate-600"
              )}>
                {item.riskLevel}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
