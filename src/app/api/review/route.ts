import { NextRequest, NextResponse } from "next/server";
import { generateReviewSummary } from "@/lib/engines/review-engine";
import { createNarrativeGenerator } from "@/lib/engines/narrative-generator";
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

  const summary = await generateReviewSummary(filters);
  const generator = createNarrativeGenerator();
  const narrative = await generator.generateNarrative(summary);

  return NextResponse.json({ summary, narrative });
}
