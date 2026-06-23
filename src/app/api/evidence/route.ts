import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const grantId = searchParams.get("grantId") || undefined;
  const recordType = searchParams.get("recordType") || undefined;
  const month = searchParams.get("month") || undefined;

  const where: Record<string, unknown> = {};
  if (grantId) where.grantId = grantId;
  if (recordType) where.recordType = recordType;
  if (month) where.reportingMonth = month;

  const records = await prisma.evidenceAsset.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const enriched = records.map((r) => {
    const fileName = r.fileName || path.basename(r.relativePath || "");
    const publicPath = path.join(process.cwd(), "public", "images", fileName);
    const imageExists = fileName ? fs.existsSync(publicPath) : false;

    return {
      id: r.id,
      recordType: r.recordType,
      grantId: r.grantId,
      donor: r.donor,
      reportingMonth: r.reportingMonth,
      district: r.district,
      title: r.title,
      summary: r.summary,
      fileName: r.fileName,
      relativePath: r.relativePath,
      usageNote: r.usageNote,
      imageExists,
      imageUrl: imageExists ? `/images/${encodeURIComponent(fileName)}` : null,
    };
  });

  return NextResponse.json({ records: enriched });
}
