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

function getDueDate(month: string | undefined, daysFromNow: number): string {
  if (!month) {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split("T")[0];
  }
  const year = parseInt(month.substring(0, 4), 10);
  const m = parseInt(month.substring(5, 7), 10);
  const d = new Date(year, m - 1, 1);
  d.setDate(Math.min(daysFromNow, new Date(year, m, 0).getDate()));
  return d.toISOString().split("T")[0];
}
