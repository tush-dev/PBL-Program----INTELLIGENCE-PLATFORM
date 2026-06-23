"use client";

import { useEffect, useState, useMemo } from "react";
import { useFilterStore } from "@/store/filters";
import { PageHeader } from "@/components/layout/PageHeader";

import { RiskBadge } from "@/components/charts/RiskBadge";
import { MetricCard } from "@/components/charts/MetricCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import { ShieldAlert, AlertTriangle, AlertCircle, Search } from "lucide-react";

interface RiskData {
  level: string;
  levelId: string;
  levelName: string;
  riskScore: number;
  riskLevel: string;
  riskReason: string;
  metricType: string;
}

const RISK_FILTERS = ["All", "Critical", "At Risk", "Behind", "On Track"];
const RISK_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  "At Risk": "#ea580c",
  Behind: "#d97706",
  "On Track": "#059669",
};
const RISK_ORDER = ["Critical", "At Risk", "Behind", "On Track"];

export default function RiskCenterPage() {
  const filters = useFilterStore();
  const [data, setData] = useState<{
    districtRisks: RiskData[];
    blockRisks: RiskData[];
    distribution: { level: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const q = new URLSearchParams();
  if (filters.month && filters.month !== "all") q.set("month", filters.month);
  if (filters.district && filters.district !== "all") q.set("district", filters.district);

  useEffect(() => {
    fetch(`/api/risks?${q}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.month, filters.district]);

  const allRisks = useMemo(() => {
    if (!data) return [];
    const items = [...data.districtRisks, ...data.blockRisks].sort(
      (a, b) => a.riskScore - b.riskScore
    );

    let filtered = items;
    if (riskFilter !== "All") {
      filtered = filtered.filter((r) => r.riskLevel === riskFilter);
    }
    if (typeFilter !== "All") {
      filtered = filtered.filter((r) => r.level === typeFilter.toLowerCase());
    }
    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.levelName.toLowerCase().includes(search.toLowerCase()) ||
          r.riskReason.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  }, [data, riskFilter, typeFilter, search]);

  const paginated = allRisks.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(allRisks.length / pageSize);

  if (loading || !data) {
    return (
      <div className="space-y-5">
        <PageHeader title="Risk Center" description="Loading..." />
        <div className="animate-pulse h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    );
  }

  const filteredDistricts = allRisks.filter((r) => r.level === "district");
  const criticalDistricts = filteredDistricts.filter((r) => r.riskLevel === "Critical");
  const atRiskDistricts = filteredDistricts.filter((r) => r.riskLevel === "At Risk");
  const behindDistricts = filteredDistricts.filter((r) => r.riskLevel === "Behind");

  const sortedDistribution = [...data.distribution].sort(
    (a, b) => RISK_ORDER.indexOf(a.level) - RISK_ORDER.indexOf(b.level)
  );
  const distTotal = sortedDistribution.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Risk Center"
        description="Deterministic risk assessment identifying critical, at-risk, and behind areas. Prioritize interventions based on composite risk scores."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Districts" value={filteredDistricts.length} icon={<ShieldAlert className="h-5 w-5" />} />
        <MetricCard title="Critical" value={criticalDistricts.length} icon={<AlertCircle className="h-5 w-5" />} variant="critical" />
        <MetricCard title="At Risk" value={atRiskDistricts.length} icon={<AlertTriangle className="h-5 w-5" />} variant="at-risk" />
        <MetricCard title="Behind" value={behindDistricts.length} icon={<AlertTriangle className="h-5 w-5" />} variant="behind" />
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 flex rounded-full overflow-hidden">
                {sortedDistribution.map((entry) => (
                  <div
                    key={entry.level}
                    style={{
                      width: `${distTotal > 0 ? (entry.count / distTotal) * 100 : 0}%`,
                      backgroundColor: RISK_COLORS[entry.level] || "#94a3b8",
                    }}
                    title={`${entry.level}: ${entry.count} (${distTotal > 0 ? Math.round((entry.count / distTotal) * 100) : 0}%)`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {sortedDistribution.map((entry) => {
                  const pct = distTotal > 0 ? Math.round((entry.count / distTotal) * 100) : 0;
                  return (
                    <div key={entry.level} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: RISK_COLORS[entry.level] || "#94a3b8" }} />
                        <span className="text-slate-600 truncate">{entry.level}</span>
                      </span>
                      <span className="font-medium text-slate-900 shrink-0 ml-2">{entry.count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="gap-0">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">Risk Assessment Details</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[260px] max-w-[360px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search entities..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="w-full h-9 rounded-lg border border-slate-300 dark:border-[var(--input)] bg-white dark:bg-slate-800 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-500"
                    aria-label="Search entities"
                  />
                </div>
                <SearchableCombobox
                  value={typeFilter}
                  onValueChange={(v) => { setTypeFilter(v); setPage(0); }}
                  options={[
                    { value: "All", label: "All Types" },
                    { value: "district", label: "Districts" },
                    { value: "block", label: "Blocks" },
                  ]}
                  placeholder="All Types"
                  searchPlaceholder="Filter type..."
                  triggerClassName="w-28"
                  className="w-28"
                />
                <div className="flex gap-1">
                  {RISK_FILTERS.map((rf) => (
                    <button
                      key={rf}
                      onClick={() => { setRiskFilter(rf); setPage(0); }}
                       className={`px-2.5 py-1.5 text-[11px] font-medium rounded-md border transition-colors ${
                         riskFilter === rf
                           ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                           : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-[var(--input)] dark:hover:bg-slate-700"
                       }`}
                    >
                      {rf}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="table-zebra">
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-[oklch(0.22_0.025_260)]">
                    <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-4 py-2.5">Entity</TableHead>
                    <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-4 py-2.5">Type</TableHead>
                    <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-4 py-2.5">Score</TableHead>
                    <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-4 py-2.5">Level</TableHead>
                    <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-4 py-2.5">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((r, i) => (
                    <TableRow key={`${r.level}-${r.levelId}-${i}`}>
                      <TableCell className="font-medium text-slate-900 dark:text-slate-100 px-4 py-2.5">{r.levelName}</TableCell>
                      <TableCell className="capitalize text-slate-700 dark:text-slate-400 text-xs px-4 py-2.5">{r.level}</TableCell>
                      <TableCell className="px-4 py-2.5">
                        <span className={`font-mono font-bold text-sm ${r.riskScore < 35 ? "text-red-600 dark:text-red-400" : r.riskScore < 60 ? "text-orange-600 dark:text-orange-400" : r.riskScore < 75 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          {r.riskScore}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <RiskBadge level={r.riskLevel} size="sm" />
                      </TableCell>
                      <TableCell className="max-w-xs text-xs text-slate-700 dark:text-slate-400 px-4 py-2.5">
                        <span className="line-clamp-2">{r.riskReason}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, allRisks.length)} of {allRisks.length}
                </p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 text-xs text-slate-700 dark:text-slate-200">Prev</Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 text-xs text-slate-700 dark:text-slate-200">Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
