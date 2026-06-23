"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BarChartProps {
  title: string;
  data: { name: string; value: number; fill?: string }[];
  dataKey?: string;
  color?: string;
  unit?: string;
}

export function BarChartComponent({
  title,
  data,
  dataKey = "value",
  color = "#059669",
  unit = "%",
}: BarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-h-0">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                tickFormatter={(v) => `${v}${unit}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                width={90}
              />
              <Tooltip
                formatter={(value) => [
                  `${value}${unit}`,
                  title,
                ]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  background: "#FFFFFF",
                  color: "#4B5563",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Bar
                dataKey={dataKey}
                fill={color}
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
