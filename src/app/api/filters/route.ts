import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { FilterOptions } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const districtFilter = searchParams.get("district") || undefined;

  const months = await prisma.schoolMetric.findMany({
    select: { reportingMonth: true },
    distinct: ["reportingMonth"],
    orderBy: { reportingMonth: "asc" },
  });

  const districts = await prisma.district.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });

  const blockQuery: Record<string, unknown> = {};
  if (districtFilter) {
    blockQuery.district = { name: districtFilter };
  }
  const blocks = await prisma.block.findMany({
    where: blockQuery,
    select: { name: true, district: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  const grades = await prisma.schoolMetric.findMany({
    select: { grade: true },
    distinct: ["grade"],
    orderBy: { grade: "asc" },
  });

  const subjects = await prisma.schoolMetric.findMany({
    select: { subject: true },
    distinct: ["subject"],
    orderBy: { subject: "asc" },
  });

  const options: FilterOptions = {
    months: months.map((m) => m.reportingMonth),
    districts: districts.map((d) => d.name),
    blocks: blocks.map((b) => ({
      name: b.name,
      districtName: b.district.name,
    })),
    grades: grades.map((g) => g.grade),
    subjects: subjects.map((s) => s.subject),
  };

  return NextResponse.json(options);
}
