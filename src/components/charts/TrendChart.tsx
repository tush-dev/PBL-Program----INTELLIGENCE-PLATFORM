"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendChartProps {
  title: string;
  data: { month: string; value: number }[];
  dataKey?: string;
  color?: string;
}

const MONTH_LABELS: Record<string, string> = {
  "July_2025": "Jul",
  "August_2025": "Aug",
  "September_2025": "Sep",
};

export function TrendChart({
  title,
  data,
  dataKey = "value",
  color = "#059669",
}: TrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    month: MONTH_LABELS[d.month] || d.month,
  }));

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max((max - min) * 0.2, 5);
  const yMin = Math.max(0, Math.floor(min - padding));
  const yMax = Math.min(100, Math.ceil(max + padding));

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-h-0">
          <div className="h-40 sm:h-48 md:h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                domain={[yMin, yMax]}
                tickFormatter={(v) => `${v}%`}
                width={35}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, title]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  background: "#FFFFFF",
                  color: "#4B5563",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
                labelStyle={{ fontWeight: 600, marginBottom: 4, color: "#111827" }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={3}
                fill={`url(#gradient-${title.replace(/\s/g, "")})`}
                dot={{ fill: color, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
