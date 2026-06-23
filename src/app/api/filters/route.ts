import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { FilterOptions } from "@/types";

export async function GET() {
  const months = await prisma.schoolMetric.findMany({
    select: { reportingMonth: true },
    distinct: ["reportingMonth"],
    orderBy: { reportingMonth: "asc" },
  });

  const districts = await prisma.district.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });

  const blocks = await prisma.block.findMany({
    select: { name: true },
    distinct: ["name"],
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
    blocks: blocks.map((b) => b.name),
    grades: grades.map((g) => g.grade),
    subjects: subjects.map((s) => s.subject),
  };

  return NextResponse.json(options);
}
