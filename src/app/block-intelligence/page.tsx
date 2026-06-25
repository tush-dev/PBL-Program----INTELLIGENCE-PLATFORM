"use client";

import { useEffect, useState, useMemo } from "react";
import { useFilterStore } from "@/store/filters";
import { PageHeader } from "@/components/layout/PageHeader";
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

interface BlockData {
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
  trend: string;
}

const RISK_FILTERS = ["All", "Critical", "At Risk", "Behind", "On Track"] as const;

function renderSchoolCount(participating: number, total: number): string {
  if (total === 0) return "N/A";
  return `${participating}/${total}`;
}

export default function BlockIntelligencePage() {
  const filters = useFilterStore();
  const [data, setData] = useState<{
    blocks: BlockData[];
    bestBlocks: BlockData[];
    worstBlocks: BlockData[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("participation");
  const [sortAsc, setSortAsc] = useState(false);
  const [riskFilter, setRiskFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const q = new URLSearchParams();
  if (filters.month && filters.month !== "all") q.set("month", filters.month);
  if (filters.district && filters.district !== "all") q.set("district", filters.district);

  useEffect(() => {
    fetch(`/api/blocks?${q}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.month, filters.district]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = [...data.blocks];
    if (filters.district && filters.district !== "all") {
      result = result.filter((b) => b.districtName === filters.district);
    }
    if (filters.block && filters.block !== "all") {
      result = result.filter((b) => b.name === filters.block);
    }
    if (riskFilter !== "All") {
      result = result.filter((b) => b.riskLevel === riskFilter);
    }
    if (search) {
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.districtName.toLowerCase().includes(search.toLowerCase())
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
  }, [data, riskFilter, search, sortBy, sortAsc, filters.district, filters.block]);

  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  if (loading || !data) {
    return (
      <div className="space-y-5">
        <PageHeader title="Block Intelligence" description="Loading..." />
        <div className="animate-pulse h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    );
  }

  const totalSchools = filtered.reduce((s, b) => s + b.totalSchools, 0);
  const participating = filtered.reduce((s, b) => s + b.participatingSchools, 0);
  const bestBlock = filtered.length > 0 ? filtered.reduce((a, b) => a.participationRate >= b.participationRate ? a : b) : null;
  const worstBlock = filtered.length > 0 ? filtered.reduce((a, b) => a.participationRate <= b.participationRate ? a : b) : null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Block Intelligence"
        description="Drill into block-level performance data. Filter by district, search specific blocks, and identify areas needing intervention."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Blocks</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-l-emerald-500">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Best Block
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">{bestBlock?.name || "N/A"}</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">{bestBlock?.participationRate ? `${bestBlock.participationRate}%` : ""}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 bg-red-50/50 dark:bg-red-950/20 dark:border-l-red-500">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Needs Attention
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">{worstBlock?.name || "N/A"}</p>
            <p className="text-xs text-red-700 dark:text-red-400">{worstBlock?.participationRate ? `${worstBlock.participationRate}%` : ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Schools</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalSchools > 0 ? `${participating}/${totalSchools}` : "N/A"}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Participating</p>
          </CardContent>
        </Card>
      </div>

      <Card className="gap-0">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">All Blocks Performance</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative w-full sm:flex-1 sm:min-w-[320px] sm:max-w-[400px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search blocks by name or district..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-[var(--input)] bg-white dark:bg-slate-800 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-500"
                  aria-label="Search blocks"
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
                  <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-4 py-2.5">Block</TableHead>
                  <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-4 py-2.5">District</TableHead>
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
                  <TableHead className="sticky top-0 bg-slate-50 dark:bg-[oklch(0.22_0.025_260)] z-10 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-4 py-2.5">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100 px-4 py-2.5">{b.name}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-400 px-4 py-2.5">{b.districtName}</TableCell>
                    <TableCell className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-500 bg-slate-100 dark:bg-slate-700 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-200">
                        {renderSchoolCount(b.participatingSchools, b.totalSchools)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2.5">
                      <span className={`font-semibold text-sm ${b.participationRate >= 75 ? "text-emerald-600 dark:text-emerald-400" : b.participationRate >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                        {b.participationRate}%
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2.5 text-slate-700 dark:text-slate-200">{b.attendanceRate}%</TableCell>
                    <TableCell className="px-4 py-2.5 text-slate-700 dark:text-slate-200">{b.evidenceSubmissionRate}%</TableCell>
                    <TableCell className="px-4 py-2.5">
                      <RiskBadge level={b.riskLevel} size="sm" />
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
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 text-xs text-slate-700 dark:text-slate-200">Prev</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 text-xs text-slate-700 dark:text-slate-200">Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
