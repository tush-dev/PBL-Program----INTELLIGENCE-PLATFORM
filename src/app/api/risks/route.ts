import { NextRequest, NextResponse } from "next/server";
import {
  assessDistrictRisks,
  assessBlockRisks,
  getRiskDistribution,
} from "@/lib/engines/risk-engine";
import type { FilterParams } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters: FilterParams = {
    month: searchParams.get("month") || undefined,
    district: searchParams.get("district") || undefined,
    block: searchParams.get("block") || undefined,
  };

  const [districtRisks, blockRisks, distribution] = await Promise.all([
    assessDistrictRisks(filters),
    assessBlockRisks(filters),
    getRiskDistribution(filters),
  ]);

  return NextResponse.json({
    districtRisks,
    blockRisks,
    distribution,
  });
}
