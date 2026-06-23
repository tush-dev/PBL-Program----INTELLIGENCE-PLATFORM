import { NextRequest, NextResponse } from "next/server";
import { generateActions } from "@/lib/engines/action-engine";
import type { FilterParams } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters: FilterParams = {
    month: searchParams.get("month") || undefined,
    district: searchParams.get("district") || undefined,
    block: searchParams.get("block") || undefined,
  };

  const actions = await generateActions(filters);

  return NextResponse.json({ actions });
}
