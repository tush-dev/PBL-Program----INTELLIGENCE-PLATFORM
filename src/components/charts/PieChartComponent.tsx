"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLORS: Record<string, string> = {
  Critical: "#dc2626",
  "At Risk": "#ea580c",
  Behind: "#d97706",
  "On Track": "#059669",
};

const BG_COLORS: Record<string, string> = {
  Critical: "bg-red-50",
  "At Risk": "bg-orange-50",
  Behind: "bg-amber-50",
  "On Track": "bg-emerald-50",
};

const TEXT_COLORS: Record<string, string> = {
  Critical: "text-red-700",
  "At Risk": "text-orange-700",
  Behind: "text-amber-700",
  "On Track": "text-emerald-700",
};

interface PieChartComponentProps {
  title: string;
  data: { level: string; count: number }[];
}

export function PieChartComponent({ title, data }: PieChartComponentProps) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
              barCategoryGap="20%"
            >
              <XAxis type="number" hide domain={[0, total]} />
              <YAxis type="category" dataKey="level" hide width={0} />
              <Tooltip
                formatter={(value) => [
                  `${value} (${total > 0 ? Math.round((Number(value) / total) * 100) : 0}%)`,
                  "Count",
                ]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={20}>
                {data.map((entry) => (
                  <Cell
                    key={entry.level}
                    fill={COLORS[entry.level as keyof typeof COLORS] || "#94a3b8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 space-y-1.5">
          {data.map((entry) => {
            const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
            return (
              <div
                key={entry.level}
                className={cn(
                  "flex items-center justify-between px-3 py-1.5 rounded-md text-xs",
                  BG_COLORS[entry.level as keyof typeof BG_COLORS] || "bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        COLORS[entry.level as keyof typeof COLORS] || "#94a3b8",
                    }}
                  />
                  <span className="font-medium text-slate-600">{entry.level}</span>
                </div>
                <span
                  className={cn(
                    "font-semibold",
                    TEXT_COLORS[entry.level as keyof typeof TEXT_COLORS] || "text-slate-700"
                  )}
                >
                  {entry.count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
