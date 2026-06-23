import { NextRequest, NextResponse } from "next/server";
import { generateGrantReport } from "@/lib/engines/grant-report-engine";
import { createNarrativeGenerator } from "@/lib/engines/narrative-generator";
import type { GrantNarrativeData } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ grantId: string }> }
) {
  const { grantId } = await params;
  const { searchParams } = new URL(request.url);
  const reportingMonth = searchParams.get("month");

  if (!reportingMonth) {
    return NextResponse.json(
      { error: "Reporting month is required" },
      { status: 400 }
    );
  }

  const report = await generateGrantReport(grantId, reportingMonth);
  const perf = report.performance;

  const totalBudget = report.financeRecords.reduce((s, r) => s + r.approvedBudget, 0);
  const totalUtilized = report.financeRecords.reduce((s, r) => s + r.cumulativeUtilized, 0);
  const budgetUtilizationPercent = totalBudget > 0
    ? Math.round((totalUtilized / totalBudget) * 10000) / 100
    : 0;

  const pblPct = perf ? Math.round(perf.pblCompletionRate * 100) : 0;
  const evPct = perf ? Math.round(perf.evidenceSubmissionRate * 100) : 0;
  const attPct = perf ? Math.round(perf.attendanceRate * 100) : 0;

  const topIssues: string[] = [];
  if (perf) {
    if (perf.attendanceRate < 0.6) topIssues.push("Low attendance");
    if (perf.evidenceSubmissionRate < 0.6) topIssues.push("Low evidence submission");
    if (perf.pblCompletionRate < 0.75) topIssues.push("Low PBL completion");
  }
  if (budgetUtilizationPercent < 50) topIssues.push("Low budget utilization");

  const narrativeData: GrantNarrativeData = {
    grantName: report.grant.name,
    grantCode: report.grant.id,
    reportingMonth,
    coveredDistricts: report.grant.coveredDistricts,
    budgetUtilizationPercent,
    pblCompletionPercent: pblPct,
    evidenceSubmissionPercent: evPct,
    attendancePercent: attPct,
    riskStatus: perf?.riskStatus || "Unknown",
    topIssues,
    financialSummary: report.summary.financialSummary,
    outcomeSummary: report.summary.outcomeSummary,
    recommendations: report.summary.recommendations,
  };

  const generator = createNarrativeGenerator();
  const narrative = await generator.generateGrantNarrative(narrativeData);

  return NextResponse.json({ report, narrative });
}
