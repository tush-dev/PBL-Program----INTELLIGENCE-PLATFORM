import { prisma } from "@/lib/prisma";
import type { RiskAssessment, FilterParams } from "@/types";

export function classifyRisk(score: number): {
  riskLevel: "On Track" | "Behind" | "At Risk" | "Critical";
  riskReason: string;
} {
  if (score >= 75) {
    return { riskLevel: "On Track", riskReason: "Performance meets or exceeds target threshold of 75%" };
  } else if (score >= 60) {
    return { riskLevel: "Behind", riskReason: "Performance between 60-74%, needs improvement to reach target" };
  } else if (score >= 35) {
    return { riskLevel: "At Risk", riskReason: "Performance between 35-59%, significant attention required" };
  } else {
    return { riskLevel: "Critical", riskReason: "Performance below 35%, immediate intervention needed" };
  }
}

export function calculateCompositeRisk(
  participationRate: number,
  attendanceRate: number,
  evidenceSubmissionRate: number
): { riskScore: number; riskLevel: "On Track" | "Behind" | "At Risk" | "Critical"; riskReason: string } {
  const riskScore = Math.round(
    (participationRate * 0.4 + attendanceRate * 0.3 + evidenceSubmissionRate * 0.3) * 100
  ) / 100;

  const { riskLevel, riskReason } = classifyRisk(riskScore);
  return { riskScore, riskLevel, riskReason };
}

export async function assessDistrictRisks(
  filters: FilterParams
): Promise<RiskAssessment[]> {
  const monthFilter = filters.month;
  const districtFilter = filters.district;

  const where: Record<string, unknown> = {};
  if (monthFilter) where.reportingMonth = monthFilter;
  if (districtFilter) {
    where.school = { district: { name: districtFilter } } as const;
  }

  const districts = await prisma.district.findMany({
    include: {
      schools: {
        include: {
          metrics: {
            where: monthFilter ? { reportingMonth: monthFilter } : undefined,
          },
        },
      },
    },
  });

  const assessments: RiskAssessment[] = [];

  for (const district of districts) {
    const allMetrics = district.schools.flatMap((s) => s.metrics);
    if (allMetrics.length === 0) continue;

    const uniqueSchools = new Set(allMetrics.map((m) => m.schoolId));
    const participatingSchools = new Set(allMetrics.filter((m) => m.pblConducted).map((m) => m.schoolId));
    const evidenceSchools = new Set(allMetrics.filter((m) => m.evidenceSubmitted).map((m) => m.schoolId));

    const participationRate = uniqueSchools.size > 0
      ? (participatingSchools.size / uniqueSchools.size) * 100
      : 0;
    const evidenceRate = uniqueSchools.size > 0
      ? (evidenceSchools.size / uniqueSchools.size) * 100
      : 0;
    const avgAttendance =
      allMetrics.filter((m) => m.attendanceRate > 0).reduce((s, m) => s + m.attendanceRate, 0) /
        Math.max(1, allMetrics.filter((m) => m.attendanceRate > 0).length) *
      100;

    const { riskScore, riskLevel, riskReason } = calculateCompositeRisk(
      participationRate,
      avgAttendance,
      evidenceRate
    );

    assessments.push({
      level: "district",
      levelId: String(district.id),
      levelName: district.name,
      riskScore,
      riskLevel,
      riskReason,
      metricType: "overall",
    });
  }

  return assessments.sort((a, b) => a.riskScore - b.riskScore);
}

export async function assessBlockRisks(
  filters: FilterParams
): Promise<RiskAssessment[]> {
  const monthFilter = filters.month;
  const districtFilter = filters.district;
  const blockFilter = filters.block;

  const where: Record<string, unknown> = {};
  if (monthFilter) where.reportingMonth = monthFilter;
  if (districtFilter || blockFilter) {
    const schoolFilter: Record<string, unknown> = {};
    if (districtFilter) schoolFilter.district = { name: districtFilter };
    if (blockFilter) schoolFilter.block = { name: blockFilter };
    where.school = schoolFilter;
  }

  const blocks = await prisma.block.findMany({
    include: {
      schools: {
        include: {
          metrics: {
            where: monthFilter ? { reportingMonth: monthFilter } : undefined,
          },
        },
      },
      district: true,
    },
  });

  const assessments: RiskAssessment[] = [];

  for (const block of blocks) {
    const allMetrics = block.schools.flatMap((s) => s.metrics);
    if (allMetrics.length === 0) continue;

    const uniqueSchools = new Set(allMetrics.map((m) => m.schoolId));
    const participatingSchools = new Set(allMetrics.filter((m) => m.pblConducted).map((m) => m.schoolId));
    const evidenceSchools = new Set(allMetrics.filter((m) => m.evidenceSubmitted).map((m) => m.schoolId));

    const participationRate = uniqueSchools.size > 0
      ? (participatingSchools.size / uniqueSchools.size) * 100
      : 0;
    const evidenceRate = uniqueSchools.size > 0
      ? (evidenceSchools.size / uniqueSchools.size) * 100
      : 0;
    const avgAttendance =
      allMetrics.filter((m) => m.attendanceRate > 0).reduce((s, m) => s + m.attendanceRate, 0) /
        Math.max(1, allMetrics.filter((m) => m.attendanceRate > 0).length) *
      100;

    const { riskScore, riskLevel, riskReason } = calculateCompositeRisk(
      participationRate,
      avgAttendance,
      evidenceRate
    );

    assessments.push({
      level: "block",
      levelId: String(block.id),
      levelName: `${block.name} (${block.district.name})`,
      riskScore,
      riskLevel,
      riskReason,
      metricType: "overall",
    });
  }

  return assessments.sort((a, b) => a.riskScore - b.riskScore);
}

export async function getRiskDistribution(
  filters: FilterParams
): Promise<{ level: string; count: number }[]> {
  const districtRisks = await assessDistrictRisks(filters);
  const distribution: Record<string, number> = {
    "On Track": 0,
    Behind: 0,
    "At Risk": 0,
    Critical: 0,
  };

  for (const risk of districtRisks) {
    distribution[risk.riskLevel] = (distribution[risk.riskLevel] || 0) + 1;
  }

  return Object.entries(distribution).map(([level, count]) => ({ level, count }));
}
