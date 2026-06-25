"use client";

import { useEffect, useState, useMemo } from "react";
import { useFilterStore } from "@/store/filters";
import { PageHeader } from "@/components/layout/PageHeader";
import { RiskBadge } from "@/components/charts/RiskBadge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ListChecks,
  AlertCircle,
  Calendar,
  User,
  TrendingUp,
  Search,
} from "lucide-react";

interface Action {
  title: string;
  description: string;
  owner: string;
  priority: string;
  dueDate: string;
  status: string;
  linkedMetric: string;
  riskLevel?: string;
}

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export default function ActionsCenterPage() {
  const filters = useFilterStore();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const q = new URLSearchParams();
  if (filters.month && filters.month !== "all") q.set("month", filters.month);
  if (filters.district && filters.district !== "all") q.set("district", filters.district);
  if (filters.block && filters.block !== "all") q.set("block", filters.block);

  useEffect(() => {
    fetch(`/api/actions?${q}`)
      .then((r) => r.json())
      .then((d) => setActions(d.actions))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.month, filters.district, filters.block]);

  const filtered = useMemo(() => {
    let result = [...actions];
    if (search) {
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (priorityFilter !== "All") {
      result = result.filter((a) => a.priority === priorityFilter);
    }
    result.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 99;
      const pb = PRIORITY_ORDER[b.priority] ?? 99;
      return sortAsc ? pa - pb : pb - pa;
    });
    return result;
  }, [actions, search, priorityFilter, sortAsc]);

  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const priorityColors: Record<string, string> = {
    High: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
    Medium: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800",
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800",
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Actions Center"
        description="Priority-ranked recommended actions generated from program performance data. Filter by priority level and search to find what needs attention."
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search actions..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="w-full h-9 rounded-lg border border-slate-300 dark:border-[var(--input)] bg-white dark:bg-slate-800 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:focus:border-emerald-500"
                aria-label="Search actions"
              />
            </div>
            <div className="flex gap-1">
              {["All", "High", "Medium", "Low"].map((p) => (
                <button
                  key={p}
                  onClick={() => { setPriorityFilter(p); setPage(0); }}
                    className={`px-2.5 py-1.5 text-[11px] font-medium rounded-md border transition-colors ${
                      priorityFilter === p
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-[var(--input)] dark:hover:bg-slate-700"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-slate-400 dark:text-slate-500">
            <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No actions generated</p>
            <p className="text-xs mt-1">Try adjusting your filter selection</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {paginated.map((action, i) => (
              <Card key={i} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "rounded-full w-8 h-8 flex items-center justify-center shrink-0 text-sm font-medium",
                      action.priority === "High" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" :
                      action.priority === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" :
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                    )}>
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {action.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className={priorityColors[action.priority] || "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200"}
                          >
                            {action.priority}
                          </Badge>
                          {action.riskLevel && (
                            <RiskBadge level={action.riskLevel} size="sm" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-1.5 leading-relaxed">
                        {action.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {action.owner}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Due: {action.dueDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {action.linkedMetric}
                        </span>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {action.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
              </p>
            <div className="flex gap-1 flex-wrap">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 text-xs text-slate-700 dark:text-slate-200">Prev</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="h-7 text-xs text-slate-700 dark:text-slate-200">Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


