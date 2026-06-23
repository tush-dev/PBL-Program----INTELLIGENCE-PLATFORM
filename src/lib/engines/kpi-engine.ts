import { prisma } from "@/lib/prisma";
import type { DashboardMetrics, FilterParams } from "@/types";

export async function calculateDashboardMetrics(
  filters: FilterParams
): Promise<DashboardMetrics> {
  const monthFilter = filters.month;
  const districtFilter = filters.district;
  const blockFilter = filters.block;
  const gradeFilter = filters.grade;
  const subjectFilter = filters.subject;

  const where: Record<string, unknown> = {};

  if (monthFilter) {
    where.reportingMonth = monthFilter;
  }
  if (districtFilter) {
    where.school = { district: { name: districtFilter } } as const;
  }
  if (blockFilter) {
    where.school = { ...(where.school as Record<string, unknown> || {}), block: { name: blockFilter } };
  }
  if (gradeFilter) {
    where.grade = gradeFilter;
  }
  if (subjectFilter) {
    where.subject = subjectFilter;
  }

  const metrics = await prisma.schoolMetric.findMany({
    where,
    include: { school: true },
  });

  if (metrics.length === 0) {
    return {
      totalSchools: 0,
      participatingSchools: 0,
      participationRate: 0,
      evidenceSubmissionRate: 0,
      totalEnrollment: 0,
      attendanceCount: 0,
      attendanceRate: 0,
    };
  }

  const uniqueSchools = new Set(metrics.map((m) => m.schoolId));
  const totalSchools = uniqueSchools.size;

  const participatingSchoolsSet = new Set(
    metrics.filter((m) => m.pblConducted).map((m) => m.schoolId)
  );
  const participatingSchools = participatingSchoolsSet.size;

  const evidenceSchoolsSet = new Set(
    metrics.filter((m) => m.evidenceSubmitted).map((m) => m.schoolId)
  );

  const totalEnrollment = metrics.reduce((sum, m) => sum + m.totalEnrollment, 0);
  const attendanceCount = metrics.reduce((sum, m) => sum + m.totalAttendance, 0);

  const participationRate =
    totalSchools > 0
      ? Math.round((participatingSchools / totalSchools) * 10000) / 100
      : 0;

  const evidenceSubmissionRate =
    totalSchools > 0
      ? Math.round((evidenceSchoolsSet.size / totalSchools) * 10000) / 100
      : 0;

  const allAttendanceRates = metrics
    .filter((m) => m.totalEnrollment > 0)
    .map((m) => m.attendanceRate);

  const attendanceRate =
    allAttendanceRates.length > 0
      ? Math.round(
          (allAttendanceRates.reduce((a, b) => a + b, 0) /
            allAttendanceRates.length) *
            10000
        ) / 100
      : 0;

  return {
    totalSchools,
    participatingSchools,
    participationRate,
    evidenceSubmissionRate,
    totalEnrollment,
    attendanceCount,
    attendanceRate,
  };
}

export async function calculateParticipationRate(
  filters: FilterParams
): Promise<number> {
  const metrics = await calculateDashboardMetrics(filters);
  return metrics.participationRate;
}

export async function calculateAttendanceRate(
  filters: FilterParams
): Promise<number> {
  const metrics = await calculateDashboardMetrics(filters);
  return metrics.attendanceRate;
}

export async function calculateEvidenceSubmissionRate(
  filters: FilterParams
): Promise<number> {
  const metrics = await calculateDashboardMetrics(filters);
  return metrics.evidenceSubmissionRate;
}
