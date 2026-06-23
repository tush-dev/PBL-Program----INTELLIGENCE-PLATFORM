import { NextRequest, NextResponse } from "next/server";
import { calculateDashboardMetrics } from "@/lib/engines/kpi-engine";
import { getMonthOverMonthMetrics } from "@/lib/engines/trend-engine";
import type { FilterParams } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters: FilterParams = {
    month: searchParams.get("month") || undefined,
    district: searchParams.get("district") || undefined,
    block: searchParams.get("block") || undefined,
    grade: searchParams.get("grade") || undefined,
    subject: searchParams.get("subject") || undefined,
  };

  const [metrics, trends] = await Promise.all([
    calculateDashboardMetrics(filters),
    getMonthOverMonthMetrics(filters),
  ]);

  return NextResponse.json({ metrics, trends });
}
