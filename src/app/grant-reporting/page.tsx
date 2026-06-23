"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RiskBadge } from "@/components/charts/RiskBadge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

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
    fetch(`/api/grants/${selectedGrant}?month=${selectedMonth}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
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
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const totalBudget = data?.report.financeRecords.reduce((s, r) => s + r.approvedBudget, 0) || 0;
  const totalUtilized = data?.report.financeRecords.reduce((s, r) => s + r.cumulativeUtilized, 0) || 0;
  const avgUtilization = totalBudget > 0 ? Math.round((totalUtilized / totalBudget) * 100) : 0;
  const remaining = totalBudget - totalUtilized;

  const hasSelection = selectedGrant && selectedMonth;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Grant Reporting"
        description="Select a grant and reporting month to generate a comprehensive financial and performance report."
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Select Grant</label>
              <Select value={selectedGrant} onValueChange={(v) => v && setSelectedGrant(v)}>
                <SelectTrigger className="w-64 h-9" aria-label="Select grant">
                  <SelectValue placeholder="Choose a grant..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {grants.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} ({g.donor})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Reporting Month</label>
              <Select value={selectedMonth} onValueChange={(v) => v && setSelectedMonth(v)}>
                <SelectTrigger className="w-40 h-9" aria-label="Select month">
                  <SelectValue placeholder="Select month..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {data && (
              <Button variant="outline" size="sm" onClick={handleCopy} className="h-9">
                {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                Copy Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!hasSelection && !loading && (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="py-16 text-center">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-base font-semibold text-slate-700 mb-2">No Grant Selected</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Select a grant and reporting month from the dropdowns above to generate a comprehensive report including budget utilization, outcome achievement, milestone status, and evidence summary.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Budget Analysis</span>
              <span className="flex items-center gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Performance Metrics</span>
              <span className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> Evidence Gallery</span>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && hasSelection && (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded-xl" />
            ))}
          </div>
          <div className="h-48 bg-slate-200 rounded-xl" />
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center card-hover">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Budget</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">${(totalBudget / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-white rounded-xl border border-emerald-200 p-3 text-center card-hover">
              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Utilization</p>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">{avgUtilization}%</p>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-3 text-center card-hover">
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Remaining</p>
              <p className="text-lg font-bold text-amber-700 mt-0.5">${(remaining / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-white rounded-xl border border-blue-200 p-3 text-center card-hover">
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Milestones</p>
              <p className="text-lg font-bold text-blue-700 mt-0.5">
                {data.report.performance ? `${Math.round(data.report.performance.pblCompletionRate * 100)}%` : "—"}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center card-hover">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Evidence</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{data.report.evidenceAssets.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 text-center card-hover">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</p>
              <div className="mt-1">
                <RiskBadge level={data.report.performance?.riskStatus || "On Track"} size="sm" />
              </div>
            </div>
          </div>

          {data.report.performance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 card-hover">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PBL Completion</p>
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1">{Math.round(data.report.performance.pblCompletionRate * 100)}%</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 card-hover">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Evidence Submission</p>
                  <ImageIcon className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1">{Math.round(data.report.performance.evidenceSubmissionRate * 100)}%</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 card-hover">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</p>
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1">{Math.round(data.report.performance.attendanceRate * 100)}%</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table className="table-zebra">
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">Budget Line</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Approved</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Utilized</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.report.financeRecords.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-sm">{r.budgetLine}</TableCell>
                        <TableCell className="text-right font-mono text-sm">${r.approvedBudget.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono text-sm">${r.cumulativeUtilized.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium text-sm ${r.cumulativeUtilizationRate >= 0.75 ? "text-emerald-600" : r.cumulativeUtilizationRate >= 0.5 ? "text-amber-600" : "text-red-600"}`}>
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
                  <FileText className="h-4 w-4 text-blue-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.report.summary.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-blue-50/50">
                    <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-slate-700">{r}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Grant Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Grant Info</h4>
                  <p className="text-sm font-medium text-slate-900">{data.report.grant.name}</p>
                  <p className="text-xs text-slate-500">{data.report.grant.donor} · {data.report.grant.periodStart} to {data.report.grant.periodEnd}</p>
                  <p className="text-xs text-slate-500 mt-1">{data.report.grant.coveredDistricts}</p>
                </div>
                <div className="lg:col-span-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Overview</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{data.report.summary.grantSummary}</p>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-3 mb-1">Outcomes</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{data.report.summary.outcomeSummary}</p>
                </div>
              </div>

              {data.report.performance?.milestoneSummary && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Milestones
                  </h4>
                  <p className="text-sm text-slate-700">{data.report.performance.milestoneSummary}</p>
                </div>
              )}

              {data.report.evidenceAssets.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Evidence Assets ({data.report.evidenceAssets.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.report.evidenceAssets.map((e) => (
                      <div key={e.id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                        <ImageIcon className="h-3 w-3 text-slate-400" />
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
