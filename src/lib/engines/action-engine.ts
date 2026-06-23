import { prisma } from "@/lib/prisma";
import { calculateDashboardMetrics } from "./kpi-engine";
import { calculateCompositeRisk } from "./risk-engine";
import type { RecommendedAction, FilterParams } from "@/types";

export async function generateActions(
  filters: FilterParams
): Promise<RecommendedAction[]> {
  const metrics = await calculateDashboardMetrics(filters);

  const { riskLevel, riskScore } = calculateCompositeRisk(
    metrics.participationRate,
    metrics.attendanceRate,
    metrics.evidenceSubmissionRate
  );

  const actions: RecommendedAction[] = [];

  if (metrics.participationRate < 75) {
    actions.push({
      title: "Increase PBL Participation",
      description: `Current participation is ${metrics.participationRate}%. Target is 75%. Conduct school outreach and provide implementation support to non-participating schools.`,
      owner: "Program Manager",
      priority: metrics.participationRate < 50 ? "High" : "Medium",
      dueDate: getDueDate(filters.month, 30),
      status: "Pending",
      linkedMetric: `Participation Rate (${metrics.participationRate}%)`,
    });
  }

  if (metrics.evidenceSubmissionRate < 75) {
    actions.push({
      title: "Improve Evidence Submission",
      description: `Current evidence submission is ${metrics.evidenceSubmissionRate}%. Provide training on documentation and streamline the submission process.`,
      owner: "M&E Lead",
      priority: metrics.evidenceSubmissionRate < 50 ? "High" : "Medium",
      dueDate: getDueDate(filters.month, 30),
      status: "Pending",
      linkedMetric: `Evidence Submission Rate (${metrics.evidenceSubmissionRate}%)`,
    });
  }

  if (metrics.attendanceRate < 75) {
    actions.push({
      title: "Boost Student Attendance",
      description: `Current attendance rate is ${metrics.attendanceRate}%. Engage with schools to identify barriers and implement attendance improvement strategies.`,
      owner: "Field Coordinator",
      priority: metrics.attendanceRate < 50 ? "High" : "Medium",
      dueDate: getDueDate(filters.month, 45),
      status: "Pending",
      linkedMetric: `Attendance Rate (${metrics.attendanceRate}%)`,
    });
  }

  if (riskLevel === "Critical" || riskLevel === "At Risk") {
    actions.push({
      title: "Risk Mitigation Plan",
      description: `Program is at "${riskLevel}" level (score: ${riskScore}). Develop and implement a comprehensive risk mitigation plan targeting low-performing districts and blocks.`,
      owner: "Program Director",
      priority: "High",
      dueDate: getDueDate(filters.month, 15),
      status: "Pending",
      linkedMetric: `Composite Risk Score (${riskScore})`,
    });
  }

  const monthFilter = filters.month;
  const districtFilter = filters.district;

  const where: Record<string, unknown> = {};
  if (monthFilter) where.reportingMonth = monthFilter;
  if (districtFilter) {
    where.school = { district: { name: districtFilter } } as const;
  }

  const allMetrics = await prisma.schoolMetric.findMany({
    where,
    include: { school: { include: { district: true } } },
  });

  const districtAgg = new Map<string, { total: number; participating: number; evidence: number; attSum: number; attCount: number }>();
  for (const m of allMetrics) {
    const dName = m.school.district.name;
    if (!districtAgg.has(dName)) {
      districtAgg.set(dName, { total: 0, participating: 0, evidence: 0, attSum: 0, attCount: 0 });
    }
    const d = districtAgg.get(dName)!;
    d.total++;
    if (m.pblConducted) d.participating++;
    if (m.evidenceSubmitted) d.evidence++;
    if (m.attendanceRate > 0) {
      d.attSum += m.attendanceRate;
      d.attCount++;
    }
  }

  for (const [name, agg] of districtAgg) {
    const participationRate = agg.total > 0 ? Math.round((agg.participating / agg.total) * 100) : 0;
    const evidenceRate = agg.total > 0 ? Math.round((agg.evidence / agg.total) * 100) : 0;
    const attendanceRate = agg.attCount > 0 ? Math.round((agg.attSum / agg.attCount) * 100) : 0;

    const { riskLevel: dRisk } = calculateCompositeRisk(participationRate, attendanceRate, evidenceRate);

    if (participationRate < 60) {
      actions.push({
        title: `Attendance Intervention — ${name}`,
        description: `${name} has participation rate of ${participationRate}%. Deploy field team to support non-participating schools.`,
        owner: "Field Coordinator",
        priority: participationRate < 35 ? "High" : "Medium",
        dueDate: getDueDate(filters.month, 30),
        status: "Pending",
        linkedMetric: `${name} Participation (${participationRate}%)`,
      });
    }

    if (evidenceRate < 60) {
      actions.push({
        title: `Evidence Collection Support — ${name}`,
        description: `${name} has evidence submission rate of ${evidenceRate}%. Provide documentation training and monitoring support.`,
        owner: "M&E Lead",
        priority: evidenceRate < 35 ? "High" : "Medium",
        dueDate: getDueDate(filters.month, 30),
        status: "Pending",
        linkedMetric: `${name} Evidence Rate (${evidenceRate}%)`,
      });
    }

    if (attendanceRate < 60) {
      actions.push({
        title: `Attendance Improvement — ${name}`,
        description: `${name} has attendance rate of ${attendanceRate}%. Investigate barriers and implement attendance drives.`,
        owner: "Field Coordinator",
        priority: attendanceRate < 35 ? "High" : "Medium",
        dueDate: getDueDate(filters.month, 45),
        status: "Pending",
        linkedMetric: `${name} Attendance (${attendanceRate}%)`,
      });
    }

    if (dRisk === "Critical") {
      actions.push({
        title: `Critical Risk Response — ${name}`,
        description: `${name} is at Critical risk level (score: ${Math.round(participationRate * 0.4 + attendanceRate * 0.3 + evidenceRate * 0.3)}). Escalate to Program Director for immediate intervention.`,
        owner: "Program Director",
        priority: "High",
        dueDate: getDueDate(filters.month, 7),
        status: "Pending",
        linkedMetric: `${name} Composite Risk`,
      });
    }
  }

  actions.push({
    title: "Monthly Program Review",
    description: `Conduct monthly review meeting to assess progress on ${metrics.totalSchools} schools, review KPI trends, and adjust implementation strategy.`,
    owner: "Program Manager",
    priority: "Medium",
    dueDate: getDueDate(filters.month, 7),
    status: "Pending",
    linkedMetric: "Overall Program Performance",
  });

  for (const action of actions) {
    await prisma.recommendedAction.create({
      data: {
        reportingMonth: filters.month || "",
        districtFilter: filters.district || null,
        blockFilter: filters.block || null,
        title: action.title,
        description: action.description,
        owner: action.owner,
        priority: action.priority,
        dueDate: action.dueDate,
        status: action.status,
        linkedMetric: action.linkedMetric,
        riskLevel,
      },
    });
  }

  return actions;
}

const MONTH_NAMES: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

function getDueDate(month: string | undefined, daysFromNow: number): string {
  if (!month) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split("T")[0];
  }
  const [monthName, yearStr] = month.split("_");
  const year = parseInt(yearStr, 10);
  const m = MONTH_NAMES[monthName] ?? 0;
  const d = new Date(year, m, 1);
  d.setDate(Math.min(daysFromNow, new Date(year, m + 1, 0).getDate()));
  return d.toISOString().split("T")[0];
}
