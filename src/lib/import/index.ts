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

export async function importSchoolData(month: string) {
  const fileName = `PBL_School_Response_Data_${month}.csv`;
  const filePath = path.join(CSV_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}, skipping.`);
    return;
  }

  const rows = parseCSV(filePath);
  console.log(`Importing ${rows.length} rows from ${fileName}`);

  let imported = 0;
  for (const row of rows) {
    const schoolName = row["What is the name of your school?"];
    const schoolCode = row["What is your school's synthetic school code?"];
    const districtName = row["What is the name of your district?"];
    const blockName = row["Block Details"];
    const grade = row["In which class/classes did you conduct the PBL project?"];
    const subject = row["Which subject do you teach?"];
    const pblConducted = row["Was the PBL project conducted in your school this month?"]?.toLowerCase() === "yes";
    const evidenceSubmitted = row["Was evidence submitted for the completed PBL project?"]?.toLowerCase() === "yes";

    if (!schoolCode) continue;

    const district = await prisma.district.upsert({
      where: { name: districtName },
      update: {},
      create: { name: districtName },
    });

    const block = await prisma.block.upsert({
      where: { name_districtId: { name: blockName, districtId: district.id } },
      update: {},
      create: { name: blockName, districtId: district.id },
    });

    const school = await prisma.school.upsert({
      where: { code: schoolCode },
      update: { name: schoolName, districtId: district.id, blockId: block.id },
      create: {
        name: schoolName,
        code: schoolCode,
        districtId: district.id,
        blockId: block.id,
      },
    });

    const toInt = (val: string) => {
      const n = parseInt(val, 10);
      return isNaN(n) ? 0 : n;
    };

    const toFloat = (val: string) => {
      const n = parseFloat(val);
      return isNaN(n) ? 0 : n;
    };

    const enrollmentClass6 = toInt(row["Total number of students enrolled in Class 6, including all sections"]);
    const attendanceClass6Science = toInt(row["Average student attendance during the Class 6 PBL Science session. If you did not teach Science in Class 6, enter 0."]);
    const attendanceClass6Math = toInt(row["Average student attendance during the Class 6 PBL Math session. If you did not teach Math in Class 6, enter 0."]);
    const enrollmentClass7 = toInt(row["Total number of students enrolled in Class 7, including all sections"]);
    const attendanceClass7Science = toInt(row["Average student attendance during the Class 7 PBL Science session. If you did not teach Science in Class 7, enter 0."]);
    const attendanceClass7Math = toInt(row["Average student attendance during the Class 7 PBL Math session. If you did not teach Math in Class 7, enter 0."]);
    const enrollmentClass8 = toInt(row["Total number of students enrolled in Class 8, including all sections"]);
    const attendanceClass8Science = toInt(row["Average student attendance during the Class 8 PBL Science session. If you did not teach Science in Class 8, enter 0."]);
    const attendanceClass8Math = toInt(row["Average student attendance during the Class 8 PBL Math session. If you did not teach Math in Class 8, enter 0."]);
    const totalEnrollment = toInt(row["Derived: Total enrollment across Classes 6-8"] || "0");
    const totalAttendance = toInt(row["Derived: Total attendance across PBL Science and Math sessions"] || "0");
    const attendanceRate = toFloat(row["Derived: Overall PBL attendance rate"] || "0");
    const riskStatus = row["Derived: Risk status"] || "";

    await prisma.schoolMetric.upsert({
      where: {
        schoolId_reportingMonth_grade_subject: {
          schoolId: school.id,
          reportingMonth: month,
          grade,
          subject,
        },
      },
      update: {
        pblConducted,
        evidenceSubmitted,
        enrollmentClass6,
        attendanceClass6Science,
        attendanceClass6Math,
        enrollmentClass7,
        attendanceClass7Science,
        attendanceClass7Math,
        enrollmentClass8,
        attendanceClass8Science,
        attendanceClass8Math,
        totalEnrollment,
        totalAttendance,
        attendanceRate,
        riskStatus,
      },
      create: {
        schoolId: school.id,
        reportingMonth: month,
        grade,
        subject,
        pblConducted,
        evidenceSubmitted,
        enrollmentClass6,
        attendanceClass6Science,
        attendanceClass6Math,
        enrollmentClass7,
        attendanceClass7Science,
        attendanceClass7Math,
        enrollmentClass8,
        attendanceClass8Science,
        attendanceClass8Math,
        totalEnrollment,
        totalAttendance,
        attendanceRate,
        riskStatus,
      },
    });

    imported++;
    if (imported % 500 === 0) console.log(`  Imported ${imported}...`);
  }
  console.log(`  Done: ${imported} records imported for ${month}`);
}

export async function importGrantProfileAndFinance() {
  const filePath = path.join(CSV_DIR, "01_Grant_Profile_and_Finance.csv");
  if (!fs.existsSync(filePath)) {
    console.log("Grant Profile CSV not found, skipping.");
    return;
  }

  const rows = parseCSV(filePath);
  console.log(`Importing ${rows.length} grant finance records`);

  const grantCache = new Map<string, boolean>();

  for (const row of rows) {
    const grantId = row["grant_id"];

    if (!grantCache.has(grantId)) {
      await prisma.grant.upsert({
        where: { id: grantId },
        update: {
          donor: row["donor"],
          name: row["grant_name"],
          periodStart: row["period_start"],
          periodEnd: row["period_end"],
          coveredDistricts: row["covered_districts"],
        },
        create: {
          id: grantId,
          donor: row["donor"],
          name: row["grant_name"],
          periodStart: row["period_start"],
          periodEnd: row["period_end"],
          coveredDistricts: row["covered_districts"],
        },
      });
      grantCache.set(grantId, true);
    }

    await prisma.grantFinance.upsert({
      where: {
        grantId_reportingMonth_budgetLine: {
          grantId,
          reportingMonth: row["reporting_month"],
          budgetLine: row["budget_line"],
        },
      },
      update: {
        approvedBudget: parseFloat(row["approved_budget_units"]) || 0,
        monthlyUtilized: parseFloat(row["monthly_utilized_units"]) || 0,
        cumulativeUtilized: parseFloat(row["cumulative_utilized_units"]) || 0,
        cumulativeUtilizationRate: parseFloat(row["cumulative_utilization_rate"]) || 0,
        financeNote: row["finance_note"] || "",
      },
      create: {
        grantId,
        reportingMonth: row["reporting_month"],
        budgetLine: row["budget_line"],
        approvedBudget: parseFloat(row["approved_budget_units"]) || 0,
        monthlyUtilized: parseFloat(row["monthly_utilized_units"]) || 0,
        cumulativeUtilized: parseFloat(row["cumulative_utilized_units"]) || 0,
        cumulativeUtilizationRate: parseFloat(row["cumulative_utilization_rate"]) || 0,
        financeNote: row["finance_note"] || "",
      },
    });
  }
  console.log(`  Done: ${rows.length} grant finance records`);
}

export async function importGrantPerformance() {
  const filePath = path.join(CSV_DIR, "02_Grant_Performance_and_Report_Material.csv");
  if (!fs.existsSync(filePath)) {
    console.log("Grant Performance CSV not found, skipping.");
    return;
  }

  const rows = parseCSV(filePath);
  console.log(`Importing ${rows.length} grant performance records`);

  for (const row of rows) {
    const grantId = row["grant_id"];

    await prisma.grant.upsert({
      where: { id: grantId },
      update: {
        donor: row["donor"],
        name: row["grant_name"],
      },
      create: {
        id: grantId,
        donor: row["donor"],
        name: row["grant_name"],
        periodStart: "",
        periodEnd: row["period_end_date"] || "",
        coveredDistricts: row["covered_districts"] || "",
      },
    });

    await prisma.grantPerformance.upsert({
      where: {
        grantId_reportingMonth: {
          grantId,
          reportingMonth: row["reporting_month"],
        },
      },
      update: {
        periodEndDate: row["period_end_date"] || "",
        reportDueDate: row["report_due_date"] || "",
        reportStatus: row["report_status"] || "",
        coveredDistricts: row["covered_districts"] || "",
        sampledSchoolRecords: parseInt(row["sampled_school_records"]) || 0,
        schoolsCompletedPbl: parseInt(row["schools_completed_pbl"]) || 0,
        pblCompletionRate: parseFloat(row["pbl_completion_rate"]) || 0,
        schoolsWithEvidence: parseInt(row["schools_with_evidence"]) || 0,
        evidenceSubmissionRate: parseFloat(row["evidence_submission_rate"]) || 0,
        totalEnrollment: parseInt(row["total_enrollment"]) || 0,
        totalAttendance: parseInt(row["total_attendance"]) || 0,
        attendanceRate: parseFloat(row["attendance_rate"]) || 0,
        riskStatus: row["risk_status"] || "",
        milestoneSummary: row["milestone_summary"] || "",
        draftReportText: row["draft_report_text"] || "",
      },
      create: {
        grantId,
        reportingMonth: row["reporting_month"],
        periodEndDate: row["period_end_date"] || "",
        reportDueDate: row["report_due_date"] || "",
        reportStatus: row["report_status"] || "",
        coveredDistricts: row["covered_districts"] || "",
        sampledSchoolRecords: parseInt(row["sampled_school_records"]) || 0,
        schoolsCompletedPbl: parseInt(row["schools_completed_pbl"]) || 0,
        pblCompletionRate: parseFloat(row["pbl_completion_rate"]) || 0,
        schoolsWithEvidence: parseInt(row["schools_with_evidence"]) || 0,
        evidenceSubmissionRate: parseFloat(row["evidence_submission_rate"]) || 0,
        totalEnrollment: parseInt(row["total_enrollment"]) || 0,
        totalAttendance: parseInt(row["total_attendance"]) || 0,
        attendanceRate: parseFloat(row["attendance_rate"]) || 0,
        riskStatus: row["risk_status"] || "",
        milestoneSummary: row["milestone_summary"] || "",
        draftReportText: row["draft_report_text"] || "",
      },
    });
  }
  console.log(`  Done: ${rows.length} grant performance records`);
}

export async function importEvidenceAssets() {
  const filePath = path.join(CSV_DIR, "03_Evidence_and_Media_Index.csv");
  if (!fs.existsSync(filePath)) {
    console.log("Evidence CSV not found, skipping.");
    return;
  }

  const rows = parseCSV(filePath);
  console.log(`Importing ${rows.length} evidence records`);

  for (const row of rows) {
    await prisma.evidenceAsset.upsert({
      where: { id: row["record_id"] },
      update: {
        recordType: row["record_type"],
        grantId: row["grant_id"],
        donor: row["donor"],
        reportingMonth: row["reporting_month"],
        district: row["district"],
        title: row["title"],
        summary: row["summary_or_caption"] || "",
        fileName: row["file_name"] || "",
        relativePath: row["relative_path"] || "",
        usageNote: row["usage_note"] || "",
      },
      create: {
        id: row["record_id"],
        recordType: row["record_type"],
        grantId: row["grant_id"],
        donor: row["donor"],
        reportingMonth: row["reporting_month"],
        district: row["district"],
        title: row["title"],
        summary: row["summary_or_caption"] || "",
        fileName: row["file_name"] || "",
        relativePath: row["relative_path"] || "",
        usageNote: row["usage_note"] || "",
      },
    });
  }
  console.log(`  Done: ${rows.length} evidence records`);
}

export async function importAll() {
  console.log("=== PBL DATA IMPORT ===");
  console.log("Importing school data...");
  await importSchoolData("July_2025");
  await importSchoolData("August_2025");
  await importSchoolData("September_2025");
  console.log("Importing grant data...");
  await importGrantProfileAndFinance();
  await importGrantPerformance();
  await importEvidenceAssets();
  console.log("=== IMPORT COMPLETE ===");
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
