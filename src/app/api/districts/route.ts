import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assessDistrictRisks } from "@/lib/engines/risk-engine";
import type { FilterParams, DistrictPerformance } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters: FilterParams = {
    month: searchParams.get("month") || undefined,
    district: searchParams.get("district") || undefined,
    block: searchParams.get("block") || undefined,
  };

  const districts = await prisma.district.findMany({
    include: {
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

  const risks = await assessDistrictRisks(filters);

  const performance: DistrictPerformance[] = districts.map((district) => {
    const allMetrics = district.schools.flatMap((s) => s.metrics);
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

    const districtRisk = risks.find(
      (r) => r.levelId === String(district.id)
    );

    return {
      id: district.id,
      name: district.name,
      participationRate,
      evidenceSubmissionRate,
      attendanceRate,
      totalSchools,
      participatingSchools: participatingSchools.size,
      riskLevel: districtRisk?.riskLevel || "Unknown",
      riskScore: districtRisk?.riskScore || 0,
      trend: "stable" as const,
    };
  });

  const sorted = performance.sort(
    (a, b) => b.participationRate - a.participationRate
  );

  return NextResponse.json({
    districts: sorted,
    bestDistricts: sorted.slice(0, 5),
    worstDistricts: sorted.slice(-5).reverse(),
  });
}
