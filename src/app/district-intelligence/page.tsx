"use client";

import { useEffect, useState, useMemo } from "react";
import { useFilterStore } from "@/store/filters";
import { PageHeader } from "@/components/layout/PageHeader";
import { BarChartComponent } from "@/components/charts/BarChartComponent";
import { RiskBadge } from "@/components/charts/RiskBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search, Trophy, AlertTriangle } from "lucide-react";

interface DistrictData {
  id: number;
  name: string;
  participationRate: number;
  evidenceSubmissionRate: number;
  attendanceRate: number;
  totalSchools: number;
  participatingSchools: number;
  riskLevel: string;
  riskScore: number;
  trend: string;
}

const RISK_FILTERS = ["All", "Critical", "At Risk", "Behind", "On Track"] as const;

function renderSchoolCount(participating: number, total: number): string {
  if (total === 0) return "N/A";
  return `${participating}/${total}`;
}

export default function DistrictIntelligencePage() {
  const filters = useFilterStore();
  const [data, setData] = useState<{
    districts: DistrictData[];
    bestDistricts: DistrictData[];
    worstDistricts: DistrictData[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("participation");
  const [sortAsc, setSortAsc] = useState(false);
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const q = new URLSearchParams();
  if (filters.month && filters.month !== "all") q.set("month", filters.month);
  if (filters.district && filters.district !== "all") q.set("district", filters.district);

  useEffect(() => {
    fetch(`/api/districts?${q}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.month, filters.district]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = [...data.districts];

    if (filters.district && filters.district !== "all") {
      result = result.filter((d) => d.name === filters.district);
    }
    if (riskFilter !== "All") {
      result = result.filter((d) => d.riskLevel === riskFilter);
    }
    if (search) {
      result = result.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "participation") cmp = a.participationRate - b.participationRate;
      else if (sortBy === "attendance") cmp = a.attendanceRate - b.attendanceRate;
      else if (sortBy === "evidence") cmp = a.evidenceSubmissionRate - b.evidenceSubmissionRate;
      else if (sortBy === "risk") cmp = a.riskScore - b.riskScore;
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [data, riskFilter, search, sortBy, sortAsc, filters.district]);

  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  if (loading || !data) {
    return (
      <div className="space-y-5">
        <PageHeader title="District Intelligence" description="Loading..." />
        <div className="animate-pulse h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    );
  }

  const bestDistrict = filtered.length > 0 ? filtered.reduce((a, b) => a.participationRate >= b.participationRate ? a : b) : null;
  const worstDistrict = filtered.length > 0 ? filtered.reduce((a, b) => a.participationRate <= b.participationRate ? a : b) : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="District Intelligence"
        description="Compare district-level performance across participation, attendance, and evidence submission. Sort, filter, and drill down to identify top and bottom performers."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Districts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-l-emerald-500">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Best District
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">{bestDistrict?.name || "N/A"}</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">{bestDistrict?.participationRate ? `${bestDistrict.participationRate}% participation` : ""}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20 dark:border-l-red-500">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Needs Attention
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">{worstDistrict?.name || "N/A"}</p>
            <p className="text-xs text-red-700 dark:text-red-400">{worstDistrict?.participationRate ? `${worstDistrict.participationRate}% participation` : ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Participation</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {filtered.length > 0
                ? `${Math.round(filtered.reduce((s, d) => s + d.participationRate, 0) / filtered.length)}%`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartComponent
          title="Top Districts by Participation"
          data={filtered.sort((a, b) => b.participationRate - a.participationRate).slice(0, 5).map((d) => ({
            name: d.name,
            value: d.participationRate,
          }))}
          color="#059669"
        />
        <BarChartComponent
          title="Bottom Districts by Participation"
          data={filtered.sort((a, b) => a.participationRate - b.participationRate).slice(0, 5).map((d) => ({
            name: d.name,
            value: d.participationRate,
          }))}
          color="#dc2626"
        />
      </div>

      <Card className="gap-0">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">All Districts Performance</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[320px] max-w-[400px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search districts..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-[var(--input)] bg-white dark:bg-slate-800 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-500"
                  aria-label="Search districts"
                />
              </div>
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
        <CardContent className="p-0 flex-1">
          <div className="overflow-x-auto h-full">
            <Table className="table-zebra">
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-[oklch(0.22_0.025_260)]">
                  <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 px-4 py-2.5">
                    <button onClick={() => { setSortBy("name"); setSortAsc(!sortAsc); }} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      District <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-4 py-2.5">Schools</TableHead>
                  <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 px-4 py-2.5">
                    <button onClick={() => { setSortBy("participation"); setSortAsc(!sortAsc); }} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Participation <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 px-4 py-2.5">
                    <button onClick={() => { setSortBy("attendance"); setSortAsc(!sortAsc); }} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Attendance <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 px-4 py-2.5">
                    <button onClick={() => { setSortBy("evidence"); setSortAsc(!sortAsc); }} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Evidence <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-4 py-2.5">Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100 px-4 py-2.5">{d.name}</TableCell>
                    <TableCell className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-500 bg-slate-100 dark:bg-slate-700 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-200">
                        {renderSchoolCount(d.participatingSchools, d.totalSchools)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <span className={`font-semibold text-sm ${d.participationRate >= 75 ? "text-emerald-600 dark:text-emerald-400" : d.participationRate >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                        {d.participationRate}%
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-slate-700 dark:text-slate-200">{d.attendanceRate}%</TableCell>
                    <TableCell className="px-4 py-2.5 text-slate-700 dark:text-slate-200">{d.evidenceSubmissionRate}%</TableCell>
                    <TableCell className="px-4 py-2.5">
                      <RiskBadge level={d.riskLevel} size="sm" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-300">
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="h-7 text-xs text-slate-700 dark:text-slate-200"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="h-7 text-xs text-slate-700 dark:text-slate-200"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
