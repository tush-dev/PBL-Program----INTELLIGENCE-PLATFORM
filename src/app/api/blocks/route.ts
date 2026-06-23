import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assessBlockRisks } from "@/lib/engines/risk-engine";
import type { FilterParams, BlockPerformance } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters: FilterParams = {
    month: searchParams.get("month") || undefined,
    district: searchParams.get("district") || undefined,
    block: searchParams.get("block") || undefined,
  };

  const blocks = await prisma.block.findMany({
    include: {
      district: true,
      schools: {
        include: {
          metrics: {
            where: filters.month
              ? { reportingMonth: filters.month }
              : undefined,
          },
        },
      },
    },
  });

  const risks = await assessBlockRisks(filters);

  const performance: BlockPerformance[] = blocks.map((block) => {
    const allMetrics = block.schools.flatMap((s) => s.metrics);
    const uniqueSchools = new Set(allMetrics.map((m) => m.schoolId));
    const participatingSchools = new Set(
      allMetrics.filter((m) => m.pblConducted).map((m) => m.schoolId)
    );
    const evidenceSchools = new Set(
      allMetrics.filter((m) => m.evidenceSubmitted).map((m) => m.schoolId)
    );

    const totalSchools = uniqueSchools.size;
    const participationRate =
      totalSchools > 0
        ? Math.round((participatingSchools.size / totalSchools) * 10000) / 100
        : 0;
    const evidenceSubmissionRate =
      totalSchools > 0
        ? Math.round((evidenceSchools.size / totalSchools) * 10000) / 100
        : 0;

    const attRates = allMetrics
      .filter((m) => m.attendanceRate > 0)
      .map((m) => m.attendanceRate);
    const attendanceRate =
      attRates.length > 0
        ? Math.round(
            (attRates.reduce((a, b) => a + b, 0) / attRates.length) * 10000
          ) / 100
        : 0;

    const blockRisk = risks.find((r) => r.levelId === String(block.id));

    return {
      id: block.id,
      name: block.name,
      districtName: block.district.name,
      participationRate,
      evidenceSubmissionRate,
      attendanceRate,
      totalSchools,
      participatingSchools: participatingSchools.size,
      riskLevel: blockRisk?.riskLevel || "Unknown",
      riskScore: blockRisk?.riskScore || 0,
      trend: "stable" as const,
    };
  });

  const sorted = performance.sort(
    (a, b) => b.participationRate - a.participationRate
  );

  return NextResponse.json({
    blocks: sorted,
    bestBlocks: sorted.slice(0, 5),
    worstBlocks: sorted.slice(-5).reverse(),
  });
}
