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
import { ArrowUpDown, Search } from "lucide-react";

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
  }, [data, riskFilter, search, sortBy, sortAsc]);

  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  if (loading || !data) {
    return (
      <div className="space-y-5">
        <PageHeader title="District Intelligence" description="Loading..." />
        <div className="animate-pulse h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="District Intelligence"
        description="Compare district-level performance across participation, attendance, and evidence submission. Sort, filter, and drill down to identify top and bottom performers."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 card-hover">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Districts</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data.districts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-4 card-hover border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Best District</p>
          <p className="text-lg font-bold text-slate-900 mt-1 truncate">{data.bestDistricts[0]?.name || "N/A"}</p>
          <p className="text-xs text-emerald-600">{data.bestDistricts[0]?.participationRate}% participation</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 card-hover border-l-4 border-l-red-500">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Needs Attention</p>
          <p className="text-lg font-bold text-slate-900 mt-1 truncate">{data.worstDistricts[data.worstDistricts.length - 1]?.name || "N/A"}</p>
          <p className="text-xs text-red-600">{data.worstDistricts[data.worstDistricts.length - 1]?.participationRate}% participation</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 card-hover">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Participation</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {Math.round(data.districts.reduce((s, d) => s + d.participationRate, 0) / data.districts.length)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartComponent
          title="Top Districts by Participation"
          data={data.bestDistricts.map((d) => ({
            name: d.name,
            value: d.participationRate,
          }))}
          color="#059669"
        />
        <BarChartComponent
          title="Bottom Districts by Participation"
          data={data.worstDistricts.map((d) => ({
            name: d.name,
            value: d.participationRate,
          }))}
          color="#dc2626"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">All Districts Performance</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search districts..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  className="h-8 w-40 rounded-md border border-slate-200 bg-white pl-7 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Search districts"
                />
              </div>
              <div className="flex gap-1">
                {RISK_FILTERS.map((rf) => (
                  <button
                    key={rf}
                    onClick={() => { setRiskFilter(rf); setPage(0); }}
                    className={`px-2 py-1 text-[10px] font-medium rounded-md border transition-colors ${
                      riskFilter === rf
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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
                <TableRow className="bg-slate-50">
                  <TableHead className="sticky top-0 bg-slate-50 z-10">
                    <button onClick={() => { setSortBy("name"); setSortAsc(!sortAsc); }} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      District <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="sticky top-0 bg-slate-50 z-10 text-xs font-semibold uppercase tracking-wider text-slate-500">Schools</TableHead>
                  <TableHead className="sticky top-0 bg-slate-50 z-10">
                    <button onClick={() => { setSortBy("participation"); setSortAsc(!sortAsc); }} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Participation <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="sticky top-0 bg-slate-50 z-10">
                    <button onClick={() => { setSortBy("attendance"); setSortAsc(!sortAsc); }} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Attendance <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="sticky top-0 bg-slate-50 z-10">
                    <button onClick={() => { setSortBy("evidence"); setSortAsc(!sortAsc); }} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Evidence <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead className="sticky top-0 bg-slate-50 z-10 text-xs font-semibold uppercase tracking-wider text-slate-500">Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((d) => (
                  <TableRow key={d.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {d.participatingSchools}/{d.totalSchools}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium text-sm ${d.participationRate >= 75 ? "text-emerald-600" : d.participationRate >= 60 ? "text-amber-600" : "text-red-600"}`}>
                        {d.participationRate}%
                      </span>
                    </TableCell>
                    <TableCell>{d.attendanceRate}%</TableCell>
                    <TableCell>{d.evidenceSubmissionRate}%</TableCell>
                    <TableCell>
                      <RiskBadge level={d.riskLevel} size="sm" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-slate-500">
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="h-7 text-xs"
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="h-7 text-xs"
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
