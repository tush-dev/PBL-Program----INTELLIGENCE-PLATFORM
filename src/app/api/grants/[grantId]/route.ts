import { NextRequest, NextResponse } from "next/server";
import { generateGrantReport } from "@/lib/engines/grant-report-engine";
import { createNarrativeGenerator } from "@/lib/engines/narrative-generator";

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
  const generator = createNarrativeGenerator();
  const narrative = await generator.generateGrantNarrative({
    grantName: report.grant.name,
    financialSummary: report.summary.financialSummary,
    outcomeSummary: report.summary.outcomeSummary,
    recommendations: report.summary.recommendations,
  });

  return NextResponse.json({ report, narrative });
}
