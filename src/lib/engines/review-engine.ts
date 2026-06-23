import { prisma } from "@/lib/prisma";
import { calculateDashboardMetrics } from "./kpi-engine";
import { calculateCompositeRisk } from "./risk-engine";
import type { ReviewSummary, FilterParams } from "@/types";

export async function generateReviewSummary(
  filters: FilterParams
): Promise<ReviewSummary> {
  const metrics = await calculateDashboardMetrics(filters);

  const allMetrics = await prisma.schoolMetric.findMany({
    where: buildWhereClause(filters),
    include: { school: { include: { district: true, block: true } } },
  });

  const achievements: string[] = [];
  const gaps: string[] = [];
  const priorityDistricts: string[] = [];
  const priorityBlocks: string[] = [];
  const discussionPoints: string[] = [];

  if (metrics.participationRate >= 75) {
    achievements.push(
      `Strong PBL participation at ${metrics.participationRate}% across ${metrics.totalSchools} schools`
    );
  } else if (metrics.participationRate >= 60) {
    gaps.push(
      `Participation rate at ${metrics.participationRate}% is approaching target but needs improvement`
    );
  } else {
    gaps.push(
      `Participation rate at ${metrics.participationRate}% is significantly below the 75% target`
    );
  }

  if (metrics.evidenceSubmissionRate >= 75) {
    achievements.push(
      `Strong evidence submission at ${metrics.evidenceSubmissionRate}%`
    );
  } else if (metrics.evidenceSubmissionRate >= 60) {
    gaps.push(
      `Evidence submission rate at ${metrics.evidenceSubmissionRate}% needs improvement`
    );
  } else {
    gaps.push(
      `Evidence submission rate at ${metrics.evidenceSubmissionRate}% is critically low`
    );
  }

  if (metrics.attendanceRate >= 75) {
    achievements.push(
      `Good student attendance at ${metrics.attendanceRate}% across PBL sessions`
    );
  } else if (metrics.attendanceRate >= 60) {
    gaps.push(
      `Attendance rate at ${metrics.attendanceRate}% needs attention`
    );
  } else {
    gaps.push(
      `Attendance rate at ${metrics.attendanceRate}% is critically low and needs immediate intervention`
    );
  }

  const districtParticipation = new Map<
    string,
    { total: number; participating: number; evidence: number }
  >();

  for (const m of allMetrics) {
    const dName = m.school.district.name;
    if (!districtParticipation.has(dName)) {
      districtParticipation.set(dName, { total: 0, participating: 0, evidence: 0 });
    }
    const d = districtParticipation.get(dName)!;
    d.total++;
    if (m.pblConducted) d.participating++;
    if (m.evidenceSubmitted) d.evidence++;
  }

  const districtRates = Array.from(districtParticipation.entries())
    .map(([name, data]) => ({
      name,
      rate: data.total > 0 ? (data.participating / data.total) * 100 : 0,
      evidenceRate: data.total > 0 ? (data.evidence / data.total) * 100 : 0,
    }))
    .sort((a, b) => a.rate - b.rate);

  const worstDistricts = districtRates.slice(0, 3);
  for (const d of worstDistricts) {
    priorityDistricts.push(
      `${d.name} (Participation: ${Math.round(d.rate)}%, Evidence: ${Math.round(d.evidenceRate)}%)`
    );
  }

  const blockParticipation = new Map<
    string,
    { total: number; participating: number; evidence: number; district: string }
  >();

  for (const m of allMetrics) {
    const bName = m.school.block.name;
    if (!blockParticipation.has(bName)) {
      blockParticipation.set(bName, { total: 0, participating: 0, evidence: 0, district: m.school.district.name });
    }
    const b = blockParticipation.get(bName)!;
    b.total++;
    if (m.pblConducted) b.participating++;
    if (m.evidenceSubmitted) b.evidence++;
  }

  const blockRates = Array.from(blockParticipation.entries())
    .map(([name, data]) => ({
      name: `${name} (${data.district})`,
      rate: data.total > 0 ? (data.participating / data.total) * 100 : 0,
      evidenceRate: data.total > 0 ? (data.evidence / data.total) * 100 : 0,
    }))
    .sort((a, b) => a.rate - b.rate);

  const worstBlocks = blockRates.slice(0, 5);
  for (const b of worstBlocks) {
    priorityBlocks.push(
      `${b.name} (Participation: ${Math.round(b.rate)}%, Evidence: ${Math.round(b.evidenceRate)}%)`
    );
  }

  const { riskLevel, riskScore } = calculateCompositeRisk(
    metrics.participationRate,
    metrics.attendanceRate,
    metrics.evidenceSubmissionRate
  );

  discussionPoints.push(
    `Overall program risk level is "${riskLevel}" with a composite score of ${riskScore}`
  );

  if (metrics.participationRate < 75) {
    discussionPoints.push(
      `Discuss strategies to improve PBL participation from current ${metrics.participationRate}% to the 75% target`
    );
  }

  if (metrics.evidenceSubmissionRate < 60) {
    discussionPoints.push(
      `Review evidence submission workflow - current rate is ${metrics.evidenceSubmissionRate}%`
    );
  }

  if (priorityDistricts.length > 0) {
    discussionPoints.push(
      `Priority districts requiring attention: ${priorityDistricts.map((d) => d.split(" ")[0]).join(", ")}`
    );
  }

  const totalEnrolled = allMetrics.reduce((s, m) => s + m.totalEnrollment, 0);
  const totalAttended = allMetrics.reduce((s, m) => s + m.totalAttendance, 0);
  discussionPoints.push(
    `Total student reach: ${totalEnrolled} enrolled, ${totalAttended} attending PBL sessions`
  );

  const month = filters.month || "current period";
  const executiveSummary = `For ${month}, the PBL program reached ${metrics.totalSchools} schools with a participation rate of ${metrics.participationRate}%, evidence submission rate of ${metrics.evidenceSubmissionRate}%, and attendance rate of ${metrics.attendanceRate}%. The program composite risk score is ${riskScore} (${riskLevel}). ${achievements.length} key achievements identified, ${gaps.length} gaps need addressing, and ${priorityDistricts.length} districts require priority attention.`;

  const summary: ReviewSummary = {
    executiveSummary,
    achievements: achievements.length > 0 ? achievements : ["Program is operational"],
    gaps: gaps.length > 0 ? gaps : ["No significant gaps identified"],
    priorityDistricts: priorityDistricts.length > 0 ? priorityDistricts : ["All districts performing adequately"],
    priorityBlocks: priorityBlocks.length > 0 ? priorityBlocks : ["All blocks performing adequately"],
    discussionPoints,
  };

  await prisma.reviewSummary.create({
    data: {
      reportingMonth: filters.month || "",
      districtFilter: filters.district || null,
      blockFilter: filters.block || null,
      executiveSummary,
      achievements: JSON.stringify(summary.achievements),
      gaps: JSON.stringify(summary.gaps),
      priorityDistricts: JSON.stringify(summary.priorityDistricts),
      priorityBlocks: JSON.stringify(summary.priorityBlocks),
      discussionPoints: JSON.stringify(summary.discussionPoints),
    },
  });

  return summary;
}

function buildWhereClause(filters: FilterParams) {
  const where: Record<string, unknown> = {};
  if (filters.month) where.reportingMonth = filters.month;
  if (filters.district || filters.block) {
    const schoolFilter: Record<string, unknown> = {};
    if (filters.district) schoolFilter.district = { name: filters.district };
    if (filters.block) schoolFilter.block = { name: filters.block };
    where.school = schoolFilter;
  }
  if (filters.grade) where.grade = filters.grade;
  if (filters.subject) where.subject = filters.subject;
  return where;
}
