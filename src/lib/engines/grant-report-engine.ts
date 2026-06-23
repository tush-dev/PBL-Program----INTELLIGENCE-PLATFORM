import { prisma } from "@/lib/prisma";
import type { GrantReport, GrantInfo, GrantFinanceRecord, GrantPerformanceRecord, EvidenceAsset } from "@/types";

export async function generateGrantReport(
  grantId: string,
  reportingMonth: string
): Promise<GrantReport> {
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
  });

  if (!grant) {
    throw new Error(`Grant ${grantId} not found`);
  }

  const grantInfo: GrantInfo = {
    id: grant.id,
    donor: grant.donor,
    name: grant.name,
    periodStart: grant.periodStart,
    periodEnd: grant.periodEnd,
    coveredDistricts: grant.coveredDistricts,
  };

  const financeRecords = await prisma.grantFinance.findMany({
    where: {
      grantId,
      reportingMonth,
    },
    orderBy: { budgetLine: "asc" },
  });

  const financeRecordsTyped: GrantFinanceRecord[] = financeRecords.map((r) => ({
    grantId: r.grantId,
    reportingMonth: r.reportingMonth,
    budgetLine: r.budgetLine,
    approvedBudget: r.approvedBudget,
    monthlyUtilized: r.monthlyUtilized,
    cumulativeUtilized: r.cumulativeUtilized,
    cumulativeUtilizationRate: r.cumulativeUtilizationRate,
    financeNote: r.financeNote,
  }));

  const performance = await prisma.grantPerformance.findUnique({
    where: {
      grantId_reportingMonth: { grantId, reportingMonth },
    },
  });

  const performanceTyped: GrantPerformanceRecord | null = performance
    ? {
        grantId: performance.grantId,
        reportingMonth: performance.reportingMonth,
        reportStatus: performance.reportStatus,
        reportDueDate: performance.reportDueDate,
        pblCompletionRate: performance.pblCompletionRate,
        evidenceSubmissionRate: performance.evidenceSubmissionRate,
        attendanceRate: performance.attendanceRate,
        riskStatus: performance.riskStatus,
        milestoneSummary: performance.milestoneSummary,
        draftReportText: performance.draftReportText,
      }
    : null;

  const evidence = await prisma.evidenceAsset.findMany({
    where: {
      grantId,
      reportingMonth,
    },
  });

  const evidenceTyped: EvidenceAsset[] = evidence.map((e) => ({
    id: e.id,
    recordType: e.recordType,
    grantId: e.grantId,
    donor: e.donor,
    reportingMonth: e.reportingMonth,
    district: e.district,
    title: e.title,
    summary: e.summary,
    fileName: e.fileName,
    relativePath: e.relativePath,
    usageNote: e.usageNote,
    imageUrl: e.relativePath
      ? `/${e.relativePath}`
      : undefined,
  }));

  const totalBudget = financeRecordsTyped.reduce((s, r) => s + r.approvedBudget, 0);
  const totalUtilized = financeRecordsTyped.reduce((s, r) => s + r.cumulativeUtilized, 0);
  const overallUtilizationRate = totalBudget > 0
    ? Math.round((totalUtilized / totalBudget) * 10000) / 100
    : 0;

  const grantSummary = `Grant "${grantInfo.name}" (${grantInfo.id}) by ${grantInfo.donor} for period ${grantInfo.periodStart} to ${grantInfo.periodEnd}. Reporting month: ${reportingMonth}. Covered districts: ${grantInfo.coveredDistricts}. Overall budget utilization: ${overallUtilizationRate}%.`;

  const financialSummary = `Total approved budget: ${totalBudget} units. Total utilized: ${totalUtilized} units. Overall utilization rate: ${overallUtilizationRate}%. ${financeRecordsTyped
    .map(
      (r) =>
        `${r.budgetLine}: ${r.approvedBudget} units approved, ${r.cumulativeUtilized} units utilized (${Math.round(r.cumulativeUtilizationRate * 100)}%)`
    )
    .join(". ")}`;

  const recommendations: string[] = [];

  if (overallUtilizationRate < 50) {
    recommendations.push(
      `Budget utilization is at ${overallUtilizationRate}%. Accelerate spending in the next month to meet grant targets.`
    );
  } else if (overallUtilizationRate < 80) {
    recommendations.push(
      `Budget utilization at ${overallUtilizationRate}% is on track. Continue monitoring to ensure full utilization by period end.`
    );
  } else {
    recommendations.push(`Budget utilization at ${overallUtilizationRate}% is strong. Maintain current pace.`);
  }

  if (performanceTyped) {
    if (performanceTyped.pblCompletionRate < 0.75) {
      recommendations.push(
        `PBL completion rate is ${Math.round(performanceTyped.pblCompletionRate * 100)}%. Target is 75%+. Prioritize schools not completing PBL.`
      );
    }
    if (performanceTyped.evidenceSubmissionRate < 0.6) {
      recommendations.push(
        `Evidence submission rate is ${Math.round(performanceTyped.evidenceSubmissionRate * 100)}%. Strengthen M&E processes.`
      );
    }
    if (performanceTyped.attendanceRate < 0.6) {
      recommendations.push(
        `Attendance rate is ${Math.round(performanceTyped.attendanceRate * 100)}%. Investigate and address attendance barriers.`
      );
    }

    recommendations.push(
      `Report status: ${performanceTyped.reportStatus}. Next report due: ${performanceTyped.reportDueDate}.`
    );
  }

  const outcomeSummary = performanceTyped
    ? `PBL Completion Rate: ${Math.round(performanceTyped.pblCompletionRate * 100)}% | Evidence Submission Rate: ${Math.round(performanceTyped.evidenceSubmissionRate * 100)}% | Attendance Rate: ${Math.round(performanceTyped.attendanceRate * 100)}% | Overall Risk: ${performanceTyped.riskStatus}. ${performanceTyped.milestoneSummary}`
    : "Performance data not available for this period.";

  return {
    grant: grantInfo,
    financeRecords: financeRecordsTyped,
    performance: performanceTyped,
    evidenceAssets: evidenceTyped,
    summary: {
      grantSummary,
      financialSummary,
      outcomeSummary,
      recommendations,
    },
  };
}
