"use client";

import { useEffect, useState } from "react";
import { useFilterStore } from "@/store/filters";
import { MetricCard } from "@/components/charts/MetricCard";
import { TrendChart } from "@/components/charts/TrendChart";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
import { ExecutiveSummaryBanner } from "@/components/charts/ExecutiveSummaryBanner";
import { QuickStatsStrip } from "@/components/charts/QuickStatsStrip";
import { TopPerformers, BottomPerformers } from "@/components/charts/TopPerformers";
import { DistrictRiskHeatmap } from "@/components/charts/Heatmap";
import {
  School,
  ClipboardCheck,
  BookOpen,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import type {
  DashboardMetrics,
  TrendData,
  RiskDistribution,
  ExecutiveSummary,
  StatItem,
  DistrictPerformance,
  RecommendedAction,
} from "@/types";

interface DashboardData {
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

const MONTHS = ["2025-07", "2025-08", "2025-09"];
const MONTH_FULL: Record<string, string> = {
  "2025-07": "July",
  "2025-08": "August",
  "2025-09": "September",
};

export default function OverviewPage() {
  const filters = useFilterStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams();
  if (filters.month && filters.month !== "all") queryParams.set("month", filters.month);
  if (filters.district && filters.district !== "all") queryParams.set("district", filters.district);
  if (filters.block && filters.block !== "all") queryParams.set("block", filters.block);
  if (filters.grade && filters.grade !== "all") queryParams.set("grade", filters.grade);
  if (filters.subject && filters.subject !== "all") queryParams.set("subject", filters.subject);

  useEffect(() => {
    Promise.all([
      fetch(`/api/metrics?${queryParams}`).then((r) => r.json()),
      fetch(`/api/risks?${queryParams}`).then((r) => r.json()),
      fetch(`/api/districts?${queryParams}`).then((r) => r.json()),
      fetch(`/api/actions?${queryParams}`).then((r) => r.json()),
    ])
      .then(([metricsData, risksData, districtsData, actionsData]) => {
        setData({
          metrics: metricsData.metrics,
          trends: metricsData.trends,
          riskDistribution: risksData.distribution,
          districtPerformances: districtsData.districts || [],
          actions: actionsData.actions || [],
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.month, filters.district, filters.block, filters.grade, filters.subject]);

  if (loading || !data) {
    return (
      <div className="space-y-5">
        <ExecutiveSummaryBanner data={null} loading />
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { metrics, trends, riskDistribution, districtPerformances, actions } = data;

  const activeMonth = filters.month && filters.month !== "all" ? filters.month : "2025-09";
  const monthName = MONTH_FULL[activeMonth] || "Current";
  const year = "2025";

  const execSummary: ExecutiveSummary = {
    month: monthName,
    year,
    attendanceRate: metrics.attendanceRate,
    attendanceChange: trends.attendanceTrend[0]?.absoluteChange || 0,
    participationRate: metrics.participationRate,
    participationChange: trends.participationTrend[0]?.absoluteChange || 0,
    evidenceRate: metrics.evidenceSubmissionRate,
    evidenceChange: trends.evidenceTrend[0]?.absoluteChange || 0,
    totalDistricts: districtPerformances.length,
    criticalDistricts: districtPerformances.filter((d) => d.riskLevel === "Critical").length,
    criticalDistrictNames: districtPerformances.filter((d) => d.riskLevel === "Critical").map((d) => d.name),
  };

  const trendToData = (tr: { current: number }[]) =>
    MONTHS.slice(1).map((m, i) => ({
      month: m,
      value: tr[i]?.current || 0,
    }));

  const stats: StatItem[] = [
    { label: "Schools", value: metrics.totalSchools },
    { label: "Districts", value: districtPerformances.length },
    { label: "Students", value: metrics.totalEnrollment.toLocaleString() },
    { label: "Attendance", value: `${metrics.attendanceRate}%`, trend: { direction: trends.attendanceTrend[0]?.direction as "up" | "down" || "stable", value: `${Math.abs(trends.attendanceTrend[0]?.absoluteChange || 0)}%` } },
    { label: "Participation", value: `${metrics.participationRate}%`, trend: { direction: trends.participationTrend[0]?.direction as "up" | "down" || "stable", value: `${Math.abs(trends.participationTrend[0]?.absoluteChange || 0)}%` } },
    { label: "Evidence", value: `${metrics.evidenceSubmissionRate}%`, trend: { direction: trends.evidenceTrend[0]?.direction as "up" | "down" || "stable", value: `${Math.abs(trends.evidenceTrend[0]?.absoluteChange || 0)}%` } },
  ];

  const criticalCount = districtPerformances.filter((d) => d.riskLevel === "Critical").length;
  const atRiskCount = districtPerformances.filter((d) => d.riskLevel === "At Risk").length;
  const behindCount = districtPerformances.filter((d) => d.riskLevel === "Behind").length;
  const onTrackCount = districtPerformances.filter((d) => d.riskLevel === "On Track").length;

  const sorted = [...districtPerformances].sort((a, b) => b.participationRate - a.participationRate);
  const topPerformers = sorted.slice(0, 5);
  const bottomPerformers = sorted.slice(-5).reverse();

  return (
    <div className="space-y-5">
        <ExecutiveSummaryBanner data={execSummary} />
        <p className="text-sm text-slate-500 -mt-3">Monitor participation, attendance, evidence submissions, and district performance trends across all program areas.</p>

      <QuickStatsStrip items={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="On Track"
          value={onTrackCount}
          subtitle="Districts"
          icon={<School className="h-5 w-5" />}
          variant="on-track"
        />
        <MetricCard
          title="Behind"
          value={behindCount}
          subtitle="Districts"
          icon={<School className="h-5 w-5" />}
          variant="behind"
        />
        <MetricCard
          title="At Risk"
          value={atRiskCount}
          subtitle="Districts"
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="at-risk"
        />
        <MetricCard
          title="Critical"
          value={criticalCount}
          subtitle={criticalCount > 0 ? districtPerformances.filter(d => d.riskLevel === "Critical").map(d => d.name).join(", ") : "No critical districts"}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="critical"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Participation Rate"
          value={`${metrics.participationRate}%`}
          icon={<ClipboardCheck className="h-5 w-5" />}
          trend={trends.participationTrend[0] ? {
            current: trends.participationTrend[0].current,
            previous: trends.participationTrend[0].previous,
            absoluteChange: trends.participationTrend[0].absoluteChange,
            percentageChange: 0,
            direction: trends.participationTrend[0].direction as "up" | "down" | "stable",
            label: trends.participationTrend[0].label,
          } : undefined}
        />
        <MetricCard
          title="Attendance Rate"
          value={`${metrics.attendanceRate}%`}
          icon={<BookOpen className="h-5 w-5" />}
          trend={trends.attendanceTrend[0] ? {
            current: trends.attendanceTrend[0].current,
            previous: trends.attendanceTrend[0].previous,
            absoluteChange: trends.attendanceTrend[0].absoluteChange,
            percentageChange: 0,
            direction: trends.attendanceTrend[0].direction as "up" | "down" | "stable",
            label: trends.attendanceTrend[0].label,
          } : undefined}
        />
        <MetricCard
          title="Evidence Submission"
          value={`${metrics.evidenceSubmissionRate}%`}
          icon={<ImageIcon className="h-5 w-5" />}
          trend={trends.evidenceTrend[0] ? {
            current: trends.evidenceTrend[0].current,
            previous: trends.evidenceTrend[0].previous,
            absoluteChange: trends.evidenceTrend[0].absoluteChange,
            percentageChange: 0,
            direction: trends.evidenceTrend[0].direction as "up" | "down" | "stable",
            label: trends.evidenceTrend[0].label,
          } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <TrendChart
          title="Participation Trend"
          data={trendToData(trends.participationTrend)}
          color="#059669"
        />
        <TrendChart
          title="Attendance Trend"
          data={trendToData(trends.attendanceTrend)}
          color="#0284c7"
        />
        <TrendChart
          title="Evidence Submission Trend"
          data={trendToData(trends.evidenceTrend)}
          color="#7c3aed"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PieChartComponent
          title="Risk Distribution"
          data={riskDistribution}
        />
        <DistrictRiskHeatmap data={districtPerformances.map((d) => ({ name: d.name, riskLevel: d.riskLevel, riskScore: d.riskScore }))} />
        <div className="space-y-4">
          {actions.length > 0 && (
            <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
              <div className="bg-orange-50 px-4 py-2.5 border-b border-orange-200">
                <h3 className="text-sm font-semibold text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Priority Actions
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {actions.slice(0, 3).map((action, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900 text-xs">{action.title}</p>
                      <p className="text-[11px] text-slate-500">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-medium text-slate-900 mb-3">Monthly Summary</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <strong>{metrics.participatingSchools}</strong> of{" "}
                <strong>{metrics.totalSchools}</strong> schools participated in PBL
                this period.
              </p>
              <p>
                Participation rate: <strong>{metrics.participationRate}%</strong>
              </p>
              <p>
                Evidence submission rate:{" "}
                <strong>{metrics.evidenceSubmissionRate}%</strong>
              </p>
              <p>
                Total enrollment:{" "}
                <strong>{metrics.totalEnrollment.toLocaleString()}</strong> |
                Attendance:{" "}
                <strong>{metrics.attendanceCount.toLocaleString()}</strong> (
                {metrics.attendanceRate}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopPerformers data={topPerformers} />
        <BottomPerformers data={bottomPerformers} />
      </div>
    </div>
  );
}
