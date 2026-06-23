"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Copy,
  Check,
  FileText,
  DollarSign,
  BarChart3,
  Calendar,
  TrendingUp,
  Image as ImageIcon,
  AlertTriangle,
  Download,
  Users,
  GraduationCap,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GrantOption {
  id: string;
  donor: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  coveredDistricts: string;
}

interface GrantReportData {
  report: {
    grant: GrantOption;
    financeRecords: {
      grantId: string;
      reportingMonth: string;
      budgetLine: string;
      approvedBudget: number;
      monthlyUtilized: number;
      cumulativeUtilized: number;
      cumulativeUtilizationRate: number;
      financeNote: string;
    }[];
    performance: {
      pblCompletionRate: number;
      evidenceSubmissionRate: number;
      attendanceRate: number;
      riskStatus: string;
      milestoneSummary: string;
      draftReportText: string;
      reportStatus: string;
      reportDueDate: string;
    } | null;
    evidenceAssets: {
      id: string;
      title: string;
      recordType: string;
    }[];
    summary: {
      grantSummary: string;
      financialSummary: string;
      outcomeSummary: string;
      recommendations: string[];
    };
  };
  narrative: string;
}

function KpiCard({
  label,
  value,
  icon,
  trend,
  variant,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; direction: "up" | "down" };
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const borderMap = {
    default: "border-slate-200 dark:border-slate-700",
    success: "border-emerald-200 dark:border-emerald-800",
    warning: "border-amber-200 dark:border-amber-800",
    danger: "border-red-200 dark:border-red-800",
  };
  const bgMap = {
    default: "bg-white dark:bg-slate-800",
    success: "bg-white dark:bg-slate-800",
    warning: "bg-white dark:bg-slate-800",
    danger: "bg-white dark:bg-slate-800",
  };
  const textMap = {
    default: "text-slate-900 dark:text-slate-100",
    success: "text-emerald-700 dark:text-emerald-300",
    warning: "text-amber-700 dark:text-amber-300",
    danger: "text-red-700 dark:text-red-300",
  };

  return (
    <div className={cn("rounded-xl border p-3.5 card-hover", borderMap[variant || "default"], bgMap[variant || "default"])}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      </div>
      <p className={cn("text-xl font-bold", textMap[variant || "default"])}>{value}</p>
      {trend && (
        <p className={cn("text-[10px] mt-0.5 font-medium", trend.direction === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
          {trend.direction === "up" ? "↑" : "↓"} {trend.value}
        </p>
      )}
    </div>
  );
}

export default function GrantReportingPage() {
  const [grants, setGrants] = useState<GrantOption[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedGrant, setSelectedGrant] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [data, setData] = useState<GrantReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/grants")
      .then((r) => r.json())
      .then((d) => {
        setGrants(d.grants);
        setMonths(d.months);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedGrant || !selectedMonth) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const controller = new AbortController();
    fetch(`/api/grants/${selectedGrant}?month=${selectedMonth}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [selectedGrant, selectedMonth]);

  const handleCopy = async () => {
    if (!data) return;
    const text = [
      data.report.summary.grantSummary,
      data.report.summary.financialSummary,
      data.report.summary.outcomeSummary,
      "Recommendations:",
      ...data.report.summary.recommendations,
    ].join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copy report summary");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rows = data.report.financeRecords.map((r) => ({
      "Budget Line": r.budgetLine,
      "Approved Budget": r.approvedBudget,
      "Monthly Utilized": r.monthlyUtilized,
      "Cumulative Utilized": r.cumulativeUtilized,
      "Utilization Rate": `${Math.round(r.cumulativeUtilizationRate * 100)}%`,
      Note: r.financeNote,
    }));
    const header = Object.keys(rows[0]).join(",");
    const csv = [header, ...rows.map((r) => Object.values(r).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.report.grant.id}_${selectedMonth}_finance.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const totalBudget = data?.report.financeRecords.reduce((s, r) => s + r.approvedBudget, 0) || 0;
  const totalUtilized = data?.report.financeRecords.reduce((s, r) => s + r.cumulativeUtilized, 0) || 0;
  const avgUtilization = totalBudget > 0 ? Math.round((totalUtilized / totalBudget) * 100) : 0;
  const remaining = totalBudget - totalUtilized;

  const hasSelection = selectedGrant && selectedMonth;

  const perf = data?.report.performance;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Grant Reporting"
        description="Select a grant and reporting month to view performance metrics, budget utilization, and data-driven recommendations."
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Grant</label>
              <SearchableCombobox
                value={selectedGrant}
                onValueChange={setSelectedGrant}
                options={grants.map((g) => ({ value: g.id, label: `${g.name} (${g.donor})` }))}
                placeholder="Choose a grant..."
                searchPlaceholder="Search grant..."
                triggerClassName="w-64 h-9 text-sm"
                className="w-64"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Month</label>
              <SearchableCombobox
                value={selectedMonth}
                onValueChange={setSelectedMonth}
                options={months.map((m) => ({ value: m, label: m }))}
                placeholder="Select month..."
                searchPlaceholder="Search month..."
                triggerClassName="w-40 h-9 text-sm"
                className="w-40"
              />
            </div>
            {data && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="h-9 text-xs">
                  {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-9 text-xs">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  CSV
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!hasSelection && !loading && (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <CardContent className="py-16 text-center">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-2">No Grant Selected</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Select a grant and reporting month to view real program performance metrics, budget utilization data, and recommendations derived from CSV data.
            </p>
          </CardContent>
        </Card>
      )}

      {loading && hasSelection && (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
          <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard
              label="Budget"
              value={`${(totalBudget / 1000).toFixed(0)}K`}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <KpiCard
              label="Utilized"
              value={`${avgUtilization}%`}
              icon={<TrendingUp className="h-4 w-4" />}
              variant={avgUtilization >= 75 ? "success" : avgUtilization >= 50 ? "warning" : "danger"}
            />
            <KpiCard
              label="Remaining"
              value={`${(remaining / 1000).toFixed(0)}K`}
              icon={<DollarSign className="h-4 w-4" />}
              variant={remaining < 100 ? "danger" : "default"}
            />
            <KpiCard
              label="PBL Completion"
              value={perf ? `${Math.round(perf.pblCompletionRate * 100)}%` : "—"}
              icon={<GraduationCap className="h-4 w-4" />}
              variant={perf && perf.pblCompletionRate >= 0.75 ? "success" : perf && perf.pblCompletionRate >= 0.5 ? "warning" : "danger"}
            />
            <KpiCard
              label="Evidence"
              value={perf ? `${Math.round(perf.evidenceSubmissionRate * 100)}%` : "—"}
              icon={<ImageIcon className="h-4 w-4" />}
              variant={perf && perf.evidenceSubmissionRate >= 0.6 ? "success" : perf && perf.evidenceSubmissionRate >= 0.4 ? "warning" : "danger"}
            />
            <KpiCard
              label="Attendance"
              value={perf ? `${Math.round(perf.attendanceRate * 100)}%` : "—"}
              icon={<Users className="h-4 w-4" />}
              variant={perf && perf.attendanceRate >= 0.6 ? "success" : perf && perf.attendanceRate >= 0.4 ? "warning" : "danger"}
            />
          </div>

          {data.narrative && (
            <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <FileText className="h-4 w-4" />
                  Program Narrative
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-[system-ui]">
                  {data.narrative}
                </div>
              </CardContent>
            </Card>
          )}

          {perf && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Budget by Line Item
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-[oklch(0.22_0.025_260)]">
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-4 py-2.5">Budget Line</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right px-4 py-2.5">Approved</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right px-4 py-2.5">Utilized</TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right px-4 py-2.5">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.report.financeRecords.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-sm text-slate-900 dark:text-slate-200 px-4 py-2.5">{r.budgetLine}</TableCell>
                          <TableCell className="text-right font-mono text-sm text-slate-700 dark:text-slate-200 px-4 py-2.5">${r.approvedBudget.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono text-sm text-slate-700 dark:text-slate-200 px-4 py-2.5">${r.cumulativeUtilized.toLocaleString()}</TableCell>
                          <TableCell className="text-right px-4 py-2.5">
                            <span className={cn(
                              "font-medium text-sm",
                              r.cumulativeUtilizationRate >= 0.75 ? "text-emerald-600 dark:text-emerald-400" :
                              r.cumulativeUtilizationRate >= 0.5 ? "text-amber-600 dark:text-amber-400" :
                              "text-red-600 dark:text-red-400"
                            )}>
                              {Math.round(r.cumulativeUtilizationRate * 100)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-3 text-center">
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">PBL Completion</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{Math.round(perf.pblCompletionRate * 100)}%</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-3 text-center">
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Evidence</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{Math.round(perf.evidenceSubmissionRate * 100)}%</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-3 text-center">
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Attendance</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{Math.round(perf.attendanceRate * 100)}%</p>
                    </div>
                  </div>

                  {perf.milestoneSummary && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Milestones
                      </p>
                      <p className="text-xs text-slate-700 dark:text-slate-200 mt-1">{perf.milestoneSummary}</p>
                    </div>
                  )}

                  {perf.draftReportText && (
                    <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Report Notes</p>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{perf.draftReportText}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Data-Driven Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.report.summary.recommendations.length > 0 ? (
                  data.report.summary.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <span className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{r}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No recommendations generated. Select a grant and month to generate data-driven insights.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Grant Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Grant Info</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{data.report.grant.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{data.report.grant.donor} · {data.report.grant.periodStart} to {data.report.grant.periodEnd}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{data.report.grant.coveredDistricts}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Overview</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{data.report.summary.grantSummary}</p>
                </div>
                {data.report.performance?.reportStatus && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Status: <span className="font-medium text-slate-700 dark:text-slate-200">{data.report.performance.reportStatus}</span></span>
                    <span>·</span>
                    <span>Due: <span className="font-medium text-slate-700 dark:text-slate-200">{data.report.performance.reportDueDate}</span></span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {data.report.evidenceAssets.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Evidence Assets ({data.report.evidenceAssets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.report.evidenceAssets.map((e) => (
                    <div key={e.id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
                      {e.recordType === "news_clipping" ? <FileText className="h-3 w-3 text-slate-400" /> : <ImageIcon className="h-3 w-3 text-slate-400" />}
                      {e.title}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
