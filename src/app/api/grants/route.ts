import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const grants = await prisma.grant.findMany({
    orderBy: { id: "asc" },
  });

  const months = await prisma.grantFinance.findMany({
    select: { reportingMonth: true },
    distinct: ["reportingMonth"],
    orderBy: { reportingMonth: "asc" },
  });

  return NextResponse.json({
    grants: grants.map((g) => ({
      id: g.id,
      donor: g.donor,
      name: g.name,
      periodStart: g.periodStart,
      periodEnd: g.periodEnd,
      coveredDistricts: g.coveredDistricts,
    })),
    months: months.map((m) => m.reportingMonth),
  });
}
