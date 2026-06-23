-- CreateTable
CREATE TABLE "District" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Block" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "districtId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Block_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "School" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "districtId" INTEGER NOT NULL,
    "blockId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "School_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "School_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SchoolMetric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "schoolId" INTEGER NOT NULL,
    "reportingMonth" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "pblConducted" BOOLEAN NOT NULL,
    "evidenceSubmitted" BOOLEAN NOT NULL,
    "enrollmentClass6" INTEGER NOT NULL DEFAULT 0,
    "attendanceClass6Science" INTEGER NOT NULL DEFAULT 0,
    "attendanceClass6Math" INTEGER NOT NULL DEFAULT 0,
    "enrollmentClass7" INTEGER NOT NULL DEFAULT 0,
    "attendanceClass7Science" INTEGER NOT NULL DEFAULT 0,
    "attendanceClass7Math" INTEGER NOT NULL DEFAULT 0,
    "enrollmentClass8" INTEGER NOT NULL DEFAULT 0,
    "attendanceClass8Science" INTEGER NOT NULL DEFAULT 0,
    "attendanceClass8Math" INTEGER NOT NULL DEFAULT 0,
    "totalEnrollment" INTEGER NOT NULL DEFAULT 0,
    "totalAttendance" INTEGER NOT NULL DEFAULT 0,
    "attendanceRate" REAL NOT NULL DEFAULT 0,
    "riskStatus" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "SchoolMetric_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Grant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "donor" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "periodStart" TEXT NOT NULL,
    "periodEnd" TEXT NOT NULL,
    "coveredDistricts" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GrantFinance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "grantId" TEXT NOT NULL,
    "reportingMonth" TEXT NOT NULL,
    "budgetLine" TEXT NOT NULL,
    "approvedBudget" REAL NOT NULL,
    "monthlyUtilized" REAL NOT NULL,
    "cumulativeUtilized" REAL NOT NULL,
    "cumulativeUtilizationRate" REAL NOT NULL,
    "financeNote" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "GrantFinance_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GrantPerformance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "grantId" TEXT NOT NULL,
    "reportingMonth" TEXT NOT NULL,
    "periodEndDate" TEXT NOT NULL,
    "reportDueDate" TEXT NOT NULL,
    "reportStatus" TEXT NOT NULL,
    "coveredDistricts" TEXT NOT NULL,
    "sampledSchoolRecords" INTEGER NOT NULL,
    "schoolsCompletedPbl" INTEGER NOT NULL,
    "pblCompletionRate" REAL NOT NULL,
    "schoolsWithEvidence" INTEGER NOT NULL,
    "evidenceSubmissionRate" REAL NOT NULL,
    "totalEnrollment" INTEGER NOT NULL,
    "totalAttendance" INTEGER NOT NULL,
    "attendanceRate" REAL NOT NULL,
    "riskStatus" TEXT NOT NULL,
    "milestoneSummary" TEXT NOT NULL DEFAULT '',
    "draftReportText" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "GrantPerformance_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordType" TEXT NOT NULL,
    "grantId" TEXT NOT NULL,
    "donor" TEXT NOT NULL,
    "reportingMonth" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "fileName" TEXT NOT NULL DEFAULT '',
    "relativePath" TEXT NOT NULL DEFAULT '',
    "usageNote" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EvidenceAsset_grantId_fkey" FOREIGN KEY ("grantId") REFERENCES "Grant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "level" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "levelName" TEXT NOT NULL,
    "reportingMonth" TEXT NOT NULL,
    "riskScore" REAL NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "riskReason" TEXT NOT NULL DEFAULT '',
    "metricType" TEXT NOT NULL DEFAULT 'overall',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ReviewSummary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportingMonth" TEXT NOT NULL,
    "districtFilter" TEXT,
    "blockFilter" TEXT,
    "executiveSummary" TEXT NOT NULL DEFAULT '',
    "achievements" TEXT NOT NULL DEFAULT '[]',
    "gaps" TEXT NOT NULL DEFAULT '[]',
    "priorityDistricts" TEXT NOT NULL DEFAULT '[]',
    "priorityBlocks" TEXT NOT NULL DEFAULT '[]',
    "discussionPoints" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RecommendedAction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportingMonth" TEXT NOT NULL,
    "districtFilter" TEXT,
    "blockFilter" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "owner" TEXT NOT NULL DEFAULT '',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "dueDate" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "linkedMetric" TEXT NOT NULL DEFAULT '',
    "riskLevel" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GeneratedReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reportType" TEXT NOT NULL,
    "grantId" TEXT,
    "reportingMonth" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "District_name_key" ON "District"("name");

-- CreateIndex
CREATE INDEX "Block_districtId_idx" ON "Block"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_name_districtId_key" ON "Block"("name", "districtId");

-- CreateIndex
CREATE UNIQUE INDEX "School_code_key" ON "School"("code");

-- CreateIndex
CREATE INDEX "School_districtId_idx" ON "School"("districtId");

-- CreateIndex
CREATE INDEX "School_blockId_idx" ON "School"("blockId");

-- CreateIndex
CREATE INDEX "SchoolMetric_reportingMonth_idx" ON "SchoolMetric"("reportingMonth");

-- CreateIndex
CREATE INDEX "SchoolMetric_schoolId_idx" ON "SchoolMetric"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SchoolMetric_schoolId_reportingMonth_grade_subject_key" ON "SchoolMetric"("schoolId", "reportingMonth", "grade", "subject");

-- CreateIndex
CREATE INDEX "GrantFinance_grantId_idx" ON "GrantFinance"("grantId");

-- CreateIndex
CREATE INDEX "GrantFinance_reportingMonth_idx" ON "GrantFinance"("reportingMonth");

-- CreateIndex
CREATE UNIQUE INDEX "GrantFinance_grantId_reportingMonth_budgetLine_key" ON "GrantFinance"("grantId", "reportingMonth", "budgetLine");

-- CreateIndex
CREATE INDEX "GrantPerformance_grantId_idx" ON "GrantPerformance"("grantId");

-- CreateIndex
CREATE INDEX "GrantPerformance_reportingMonth_idx" ON "GrantPerformance"("reportingMonth");

-- CreateIndex
CREATE UNIQUE INDEX "GrantPerformance_grantId_reportingMonth_key" ON "GrantPerformance"("grantId", "reportingMonth");

-- CreateIndex
CREATE INDEX "EvidenceAsset_grantId_idx" ON "EvidenceAsset"("grantId");

-- CreateIndex
CREATE INDEX "EvidenceAsset_recordType_idx" ON "EvidenceAsset"("recordType");

-- CreateIndex
CREATE INDEX "EvidenceAsset_reportingMonth_idx" ON "EvidenceAsset"("reportingMonth");

-- CreateIndex
CREATE INDEX "RiskAssessment_level_levelId_reportingMonth_idx" ON "RiskAssessment"("level", "levelId", "reportingMonth");

-- CreateIndex
CREATE INDEX "RiskAssessment_reportingMonth_idx" ON "RiskAssessment"("reportingMonth");

-- CreateIndex
CREATE INDEX "RiskAssessment_riskLevel_idx" ON "RiskAssessment"("riskLevel");

-- CreateIndex
CREATE INDEX "ReviewSummary_reportingMonth_idx" ON "ReviewSummary"("reportingMonth");

-- CreateIndex
CREATE INDEX "RecommendedAction_reportingMonth_idx" ON "RecommendedAction"("reportingMonth");

-- CreateIndex
CREATE INDEX "RecommendedAction_priority_idx" ON "RecommendedAction"("priority");

-- CreateIndex
CREATE INDEX "GeneratedReport_reportType_grantId_reportingMonth_idx" ON "GeneratedReport"("reportType", "grantId", "reportingMonth");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
