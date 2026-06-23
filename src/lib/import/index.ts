import * as fs from "fs";
import * as path from "path";
import { prisma } from "@/lib/prisma";

const CSV_DIR = path.join(process.cwd(), "csv");

function parseCSV(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === "\n" && !inQuotes) {
      lines.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);

  if (lines.length < 2) return [];

  const rawHeaders = parseCSVLine(lines[0]);
  const headers = rawHeaders.map((h) => h.replace(/^"|"$/g, "").trim());

  const result: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || "").replace(/^"|"$/g, "").trim();
    });
    result.push(row);
  }
  return result;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const toInt = (val: string) => { const n = parseInt(val, 10); return isNaN(n) ? 0 : n; };
const toFloat = (val: string) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };

// Reverse lookup: districtId → name, populated after bulk create + fetch
let districtNameById = new Map<number, string>();

interface MetricRow {
  schoolId: number;
  reportingMonth: string;
  grade: string;
  subject: string;
  pblConducted: boolean;
  evidenceSubmitted: boolean;
  enrollmentClass6: number;
  attendanceClass6Science: number;
  attendanceClass6Math: number;
  enrollmentClass7: number;
  attendanceClass7Science: number;
  attendanceClass7Math: number;
  enrollmentClass8: number;
  attendanceClass8Science: number;
  attendanceClass8Math: number;
  totalEnrollment: number;
  totalAttendance: number;
  attendanceRate: number;
  riskStatus: string;
}

// ---------------------------------------------------------------------------
// Public import functions
// ---------------------------------------------------------------------------
export async function importAllSchoolData() {
  const months = ["July_2025", "August_2025", "September_2025"];
  const schoolRowsByMonth: { month: string; row: Record<string, string> }[] = [];

  for (const month of months) {
    const fp = path.join(CSV_DIR, `PBL_School_Response_Data_${month}.csv`);
    if (!fs.existsSync(fp)) { console.log(`Skipping ${month} — file not found`); continue; }
    const rows = parseCSV(fp).filter((r) => r["What is your school's synthetic school code?"]);
    rows.forEach((r) => schoolRowsByMonth.push({ month, row: r }));
    console.log(`  Parsed ${rows.length} rows for ${month}`);
  }

  const totalRows = schoolRowsByMonth.length;
  console.log(`\nTotal school metric rows across all months: ${totalRows}`);

  // 1. Collect all unique districts, blocks, schools in memory (0 DB queries)
  const blockKey = (r: Record<string, string>) => `${r["Block Details"]}||${r["What is the name of your district?"]}`;

  const allDistrictNames = [...new Set(schoolRowsByMonth.map((e) => e.row["What is the name of your district?"]).filter(Boolean))];
  const blockEntries = [...new Map(
    schoolRowsByMonth.filter((e) => e.row["Block Details"])
      .map((e) => [blockKey(e.row), { name: e.row["Block Details"], districtName: e.row["What is the name of your district?"] }])
  ).values()];
  const schoolEntries = [...new Map(
    schoolRowsByMonth.filter((e) => e.row["What is your school's synthetic school code?"])
      .map((e) => [e.row["What is your school's synthetic school code?"], {
        code: e.row["What is your school's synthetic school code?"],
        name: e.row["What is the name of your school?"],
        blockKey: blockKey(e.row),
      }])
  ).values()];

  console.log(`  Unique districts: ${allDistrictNames.length}`);
  console.log(`  Unique blocks: ${blockEntries.length}`);
  console.log(`  Unique schools: ${schoolEntries.length}`);

  // 2. Bulk-create districts (1 createMany + 1 findMany)
  console.log("\nCreating districts...");
  await prisma.district.createMany({ data: allDistrictNames.map((n) => ({ name: n })), skipDuplicates: true });
  const districts = new Map((await prisma.district.findMany({ where: { name: { in: allDistrictNames } } })).map((d) => [d.name, d.id]));
  districtNameById = new Map([...districts.entries()].map(([name, id]) => [id, name]));

  // 3. Bulk-create blocks (1 createMany + 1 findMany)
  console.log("Creating blocks...");
  const blockData = blockEntries
    .map((e) => {
      const did = districts.get(e.districtName);
      return did ? { name: e.name, districtId: did } : null;
    })
    .filter((x): x is { name: string; districtId: number } => x !== null);
  await prisma.block.createMany({ data: blockData, skipDuplicates: true });
  const blockIds = [...new Set(blockData.map((b) => b.districtId))];
  const blocks = new Map(
    (await prisma.block.findMany({ where: { districtId: { in: blockIds } } }))
      .map((b) => [`${b.name}||${districtNameById.get(b.districtId)}`, b.id])
  );

  // 4. Bulk-create schools (1 createMany + 1 findMany)
  console.log("Creating schools...");
  const blockDistricts = new Map(
    (await prisma.block.findMany({ where: { districtId: { in: blockIds } } }))
      .map((b) => [b.id, b.districtId])
  );
  const schoolData = schoolEntries
    .map((e) => {
      const bid = blocks.get(e.blockKey);
      if (!bid) return null;
      const did = blockDistricts.get(bid);
      return did ? { code: e.code, name: e.name, blockId: bid, districtId: did } : null;
    })
    .filter((x): x is { code: string; name: string; blockId: number; districtId: number } => x !== null);
  await prisma.school.createMany({ data: schoolData, skipDuplicates: true });
  const schoolCodes = schoolData.map((s) => s.code);
  const schools = new Map(
    (await prisma.school.findMany({ where: { code: { in: schoolCodes } } })).map((s) => [s.code, s.id])
  );

  // 5. Bulk-create school metrics (createMany batches)
  console.log("Creating school metrics...");
  const allMetrics: MetricRow[] = [];
  for (const { month, row } of schoolRowsByMonth) {
    const sid = schools.get(row["What is your school's synthetic school code?"]);
    if (!sid) continue;
    allMetrics.push({
      schoolId: sid, reportingMonth: month,
      grade: row["In which class/classes did you conduct the PBL project?"],
      subject: row["Which subject do you teach?"],
      pblConducted: row["Was the PBL project conducted in your school this month?"]?.toLowerCase() === "yes",
      evidenceSubmitted: row["Was evidence submitted for the completed PBL project?"]?.toLowerCase() === "yes",
      enrollmentClass6: toInt(row["Total number of students enrolled in Class 6, including all sections"]),
      attendanceClass6Science: toInt(row["Average student attendance during the Class 6 PBL Science session. If you did not teach Science in Class 6, enter 0."]),
      attendanceClass6Math: toInt(row["Average student attendance during the Class 6 PBL Math session. If you did not teach Math in Class 6, enter 0."]),
      enrollmentClass7: toInt(row["Total number of students enrolled in Class 7, including all sections"]),
      attendanceClass7Science: toInt(row["Average student attendance during the Class 7 PBL Science session. If you did not teach Science in Class 7, enter 0."]),
      attendanceClass7Math: toInt(row["Average student attendance during the Class 7 PBL Math session. If you did not teach Math in Class 7, enter 0."]),
      enrollmentClass8: toInt(row["Total number of students enrolled in Class 8, including all sections"]),
      attendanceClass8Science: toInt(row["Average student attendance during the Class 8 PBL Science session. If you did not teach Science in Class 8, enter 0."]),
      attendanceClass8Math: toInt(row["Average student attendance during the Class 8 PBL Math session. If you did not teach Math in Class 8, enter 0."]),
      totalEnrollment: toInt(row["Derived: Total enrollment across Classes 6-8"] || "0"),
      totalAttendance: toInt(row["Derived: Total attendance across PBL Science and Math sessions"] || "0"),
      attendanceRate: toFloat(row["Derived: Overall PBL attendance rate"] || "0"),
      riskStatus: row["Derived: Risk status"] || "",
    });
  }

  const batchSize = 1000;
  for (let i = 0; i < allMetrics.length; i += batchSize) {
    await prisma.schoolMetric.createMany({ data: allMetrics.slice(i, i + batchSize), skipDuplicates: true });
    console.log(`  ${Math.min(i + batchSize, allMetrics.length)} / ${allMetrics.length} metrics`);
  }
  console.log(`  Done: ${allMetrics.length} school metrics across ${months.length} months`);
}

export async function importGrantProfileAndFinance() {
  const filePath = path.join(CSV_DIR, "01_Grant_Profile_and_Finance.csv");
  if (!fs.existsSync(filePath)) { console.log("Grant Profile CSV not found, skipping."); return; }

  const rows = parseCSV(filePath);
  console.log(`Importing ${rows.length} grant finance records`);

  // Bulk-create grants
  const grantRows = [...new Map(rows.map((r) => [r["grant_id"], r])).values()];
  const grants = grantRows.map((r) => ({
    id: r["grant_id"],
    donor: r["donor"],
    name: r["grant_name"],
    periodStart: r["period_start"],
    periodEnd: r["period_end"],
    coveredDistricts: r["covered_districts"],
  }));
  await prisma.grant.createMany({ data: grants, skipDuplicates: true });
  console.log(`  Grants: ${grants.length}`);

  // Bulk-create grant finances
  const finances = rows.map((r) => ({
    grantId: r["grant_id"],
    reportingMonth: r["reporting_month"],
    budgetLine: r["budget_line"],
    approvedBudget: parseFloat(r["approved_budget_units"]) || 0,
    monthlyUtilized: parseFloat(r["monthly_utilized_units"]) || 0,
    cumulativeUtilized: parseFloat(r["cumulative_utilized_units"]) || 0,
    cumulativeUtilizationRate: parseFloat(r["cumulative_utilization_rate"]) || 0,
    financeNote: r["finance_note"] || "",
  }));
  await prisma.grantFinance.createMany({ data: finances, skipDuplicates: true });
  console.log(`  Finance records: ${finances.length}`);
}

export async function importGrantPerformance() {
  const filePath = path.join(CSV_DIR, "02_Grant_Performance_and_Report_Material.csv");
  if (!fs.existsSync(filePath)) { console.log("Grant Performance CSV not found, skipping."); return; }

  const rows = parseCSV(filePath);
  console.log(`Importing ${rows.length} grant performance records`);

  // Bulk-create grants that may not exist yet
  const grantRows = [...new Map(rows.map((r) => [r["grant_id"], r])).values()];
  const grants = grantRows.map((r) => ({
    id: r["grant_id"],
    donor: r["donor"],
    name: r["grant_name"],
    periodStart: "",
    periodEnd: r["period_end_date"] || "",
    coveredDistricts: r["covered_districts"] || "",
  }));
  await prisma.grant.createMany({ data: grants, skipDuplicates: true });

  // Bulk-create performances
  const performances = rows.map((r) => ({
    grantId: r["grant_id"],
    reportingMonth: r["reporting_month"],
    periodEndDate: r["period_end_date"] || "",
    reportDueDate: r["report_due_date"] || "",
    reportStatus: r["report_status"] || "",
    coveredDistricts: r["covered_districts"] || "",
    sampledSchoolRecords: parseInt(r["sampled_school_records"]) || 0,
    schoolsCompletedPbl: parseInt(r["schools_completed_pbl"]) || 0,
    pblCompletionRate: parseFloat(r["pbl_completion_rate"]) || 0,
    schoolsWithEvidence: parseInt(r["schools_with_evidence"]) || 0,
    evidenceSubmissionRate: parseFloat(r["evidence_submission_rate"]) || 0,
    totalEnrollment: parseInt(r["total_enrollment"]) || 0,
    totalAttendance: parseInt(r["total_attendance"]) || 0,
    attendanceRate: parseFloat(r["attendance_rate"]) || 0,
    riskStatus: r["risk_status"] || "",
    milestoneSummary: r["milestone_summary"] || "",
    draftReportText: r["draft_report_text"] || "",
  }));
  await prisma.grantPerformance.createMany({ data: performances, skipDuplicates: true });
  console.log(`  Performance records: ${performances.length}`);
}

export async function importEvidenceAssets() {
  const filePath = path.join(CSV_DIR, "03_Evidence_and_Media_Index.csv");
  if (!fs.existsSync(filePath)) { console.log("Evidence CSV not found, skipping."); return; }

  const rows = parseCSV(filePath);
  console.log(`Importing ${rows.length} evidence records`);

  const assets = rows.map((r) => ({
    id: r["record_id"],
    recordType: r["record_type"],
    grantId: r["grant_id"],
    donor: r["donor"],
    reportingMonth: r["reporting_month"],
    district: r["district"],
    title: r["title"],
    summary: r["summary_or_caption"] || "",
    fileName: r["file_name"] || "",
    relativePath: r["relative_path"] || "",
    usageNote: r["usage_note"] || "",
  }));
  await prisma.evidenceAsset.createMany({ data: assets, skipDuplicates: true });
  console.log(`  Evidence records: ${assets.length}`);
}

export async function importAll() {
  console.log("=== PBL DATA IMPORT ===\n");
  console.log("Importing school data (all months)...");
  await importAllSchoolData();
  console.log("\nImporting grant data...");
  await importGrantProfileAndFinance();
  await importGrantPerformance();
  await importEvidenceAssets();
  console.log("\n=== IMPORT COMPLETE ===");
}

async function main() {
  try {
    await importAll();
    console.log("Import completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
