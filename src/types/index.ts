export interface FilterParams {
  month?: string;
  district?: string;
  block?: string;
  grade?: string;
  subject?: string;
}

export interface DashboardMetrics {
  totalSchools: number;
  participatingSchools: number;
  participationRate: number;
  evidenceSubmissionRate: number;
  totalEnrollment: number;
  attendanceCount: number;
  attendanceRate: number;
}

export interface TrendData {
  current: number;
  previous: number;
  absoluteChange: number;
  percentageChange: number;
  direction: "up" | "down" | "stable";
  label: string;
}

export interface MonthOverMonthMetrics {
  month: string;
  metrics: DashboardMetrics;
}

export interface DistrictPerformance {
  id: number;
  name: string;
  participationRate: number;
  evidenceSubmissionRate: number;
  attendanceRate: number;
  totalSchools: number;
  participatingSchools: number;
  riskLevel: string;
  riskScore: number;
  trend: "improving" | "declining" | "stable";
}

export interface BlockPerformance {
  id: number;
  name: string;
  districtName: string;
  participationRate: number;
  evidenceSubmissionRate: number;
  attendanceRate: number;
  totalSchools: number;
  participatingSchools: number;
  riskLevel: string;
  riskScore: number;
  trend: "improving" | "declining" | "stable";
}

export interface RiskAssessment {
  level: string;
  levelId: string;
  levelName: string;
  riskScore: number;
  riskLevel: "On Track" | "Behind" | "At Risk" | "Critical";
  riskReason: string;
  metricType: string;
}

export interface ReviewSummary {
  executiveSummary: string;
  achievements: string[];
  gaps: string[];
  priorityDistricts: string[];
  priorityBlocks: string[];
  discussionPoints: string[];
}

export interface RecommendedAction {
  id?: number;
  title: string;
  description: string;
  owner: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  status: "Pending" | "In Progress" | "Completed";
  linkedMetric: string;
  riskLevel?: string;
}

export interface GrantInfo {
  id: string;
  donor: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  coveredDistricts: string;
}

export interface GrantFinanceRecord {
  grantId: string;
  reportingMonth: string;
  budgetLine: string;
  approvedBudget: number;
  monthlyUtilized: number;
  cumulativeUtilized: number;
  cumulativeUtilizationRate: number;
  financeNote: string;
}

export interface GrantPerformanceRecord {
  grantId: string;
  reportingMonth: string;
  reportStatus: string;
  reportDueDate: string;
  pblCompletionRate: number;
  evidenceSubmissionRate: number;
  attendanceRate: number;
  riskStatus: string;
  milestoneSummary: string;
  draftReportText: string;
}

export interface GrantReport {
  grant: GrantInfo;
  financeRecords: GrantFinanceRecord[];
  performance: GrantPerformanceRecord | null;
  evidenceAssets: EvidenceAsset[];
  summary: {
    grantSummary: string;
    financialSummary: string;
    outcomeSummary: string;
    recommendations: string[];
  };
}

export interface EvidenceAsset {
  id: string;
  recordType: string;
  grantId: string;
  donor: string;
  reportingMonth: string;
  district: string;
  title: string;
  summary: string;
  fileName: string;
  relativePath: string;
  usageNote: string;
  imageUrl?: string;
}

export interface FilterOptions {
  months: string[];
  districts: string[];
  blocks: string[];
  grades: string[];
  subjects: string[];
}

export interface RiskDistribution {
  level: string;
  count: number;
}

export interface DashboardPageData {
  metrics: DashboardMetrics;
  trends: {
    participationTrend: TrendData[];
    attendanceTrend: TrendData[];
    evidenceTrend: TrendData[];
  };
  riskDistribution: RiskDistribution[];
  districtPerformances: DistrictPerformance[];
  actions: RecommendedAction[];
}

export interface StatItem {
  label: string;
  value: string | number;
  icon?: string;
  trend?: {
    direction: "up" | "down" | "stable";
    value: string;
  };
}

export interface ExecutiveSummary {
  month: string;
  year: string;
  attendanceRate: number;
  attendanceChange: number;
  participationRate: number;
  participationChange: number;
  evidenceRate: number;
  evidenceChange: number;
  totalDistricts: number;
  criticalDistricts: number;
  criticalDistrictNames: string[];
}
