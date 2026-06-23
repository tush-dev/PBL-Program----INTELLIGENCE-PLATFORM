"use client";

import { useEffect, useState, useMemo } from "react";
import { useFilterStore } from "@/store/filters";
import { PageHeader } from "@/components/layout/PageHeader";
import { PieChartComponent } from "@/components/charts/PieChartComponent";
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
        <div className="animate-pulse h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  const criticalDistricts = data.districtRisks.filter((r) => r.riskLevel === "Critical");
  const atRiskDistricts = data.districtRisks.filter((r) => r.riskLevel === "At Risk");
  const behindDistricts = data.districtRisks.filter((r) => r.riskLevel === "Behind");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Risk Center"
        description="Deterministic risk assessment identifying critical, at-risk, and behind areas. Prioritize interventions based on composite risk scores."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Districts" value={data.districtRisks.length} icon={<ShieldAlert className="h-5 w-5" />} />
        <MetricCard title="Critical" value={criticalDistricts.length} subtitle={criticalDistricts.map((d) => d.levelName).join(", ")} icon={<AlertCircle className="h-5 w-5" />} variant="critical" />
        <MetricCard title="At Risk" value={atRiskDistricts.length} icon={<AlertTriangle className="h-5 w-5" />} variant="at-risk" />
        <MetricCard title="Behind" value={behindDistricts.length} icon={<AlertTriangle className="h-5 w-5" />} variant="behind" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PieChartComponent title="Risk Distribution" data={data.distribution} />
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">Risk Assessment Details</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search entities..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="h-8 w-36 rounded-md border border-slate-200 bg-white pl-7 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Search entities"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Filter by type"
                >
                  <option value="All">All Types</option>
                  <option value="district">Districts</option>
                  <option value="block">Blocks</option>
                </select>
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
                    <TableHead className="sticky top-0 bg-slate-50 z-10 text-xs font-semibold uppercase tracking-wider text-slate-500">Entity</TableHead>
                    <TableHead className="sticky top-0 bg-slate-50 z-10 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</TableHead>
                    <TableHead className="sticky top-0 bg-slate-50 z-10 text-xs font-semibold uppercase tracking-wider text-slate-500">Score</TableHead>
                    <TableHead className="sticky top-0 bg-slate-50 z-10 text-xs font-semibold uppercase tracking-wider text-slate-500">Level</TableHead>
                    <TableHead className="sticky top-0 bg-slate-50 z-10 text-xs font-semibold uppercase tracking-wider text-slate-500">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((r, i) => (
                    <TableRow key={`${r.level}-${r.levelId}-${i}`} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium">{r.levelName}</TableCell>
                      <TableCell className="capitalize text-slate-500 text-xs">{r.level}</TableCell>
                      <TableCell>
                        <span className={`font-mono font-bold text-sm ${r.riskScore < 35 ? "text-red-600" : r.riskScore < 60 ? "text-orange-600" : r.riskScore < 75 ? "text-amber-600" : "text-emerald-600"}`}>
                          {r.riskScore}
                        </span>
                      </TableCell>
                      <TableCell>
                        <RiskBadge level={r.riskLevel} size="sm" />
                      </TableCell>
                      <TableCell className="max-w-xs text-xs text-slate-500">
                        <span className="line-clamp-2">{r.riskReason}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-slate-500">
                  Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, allRisks.length)} of {allRisks.length}
                </p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 text-xs">Prev</Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 text-xs">Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
