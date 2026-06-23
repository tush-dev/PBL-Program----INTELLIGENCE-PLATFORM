"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RotateCcw, X, Filter } from "lucide-react";
import { useFilterStore } from "@/store/filters";
import type { FilterOptions } from "@/types";

const MONTH_LABELS: Record<string, string> = {
  "2025-07": "July 2025",
  "2025-08": "August 2025",
  "2025-09": "September 2025",
};

const activeFilters = (filters: Record<string, string | undefined>) =>
  Object.entries(filters).filter(([, v]) => v && v !== "all") as [string, string][];

export function GlobalFilters() {
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const filters = useFilterStore();

  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then(setOptions)
      .catch(() => {});
  }, []);

  const active = useMemo(
    () => activeFilters({
      Month: filters.month,
      District: filters.district,
      Block: filters.block,
      Grade: filters.grade,
      Subject: filters.subject,
    }),
    [filters.month, filters.district, filters.block, filters.grade, filters.subject]
  );

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="px-4 py-2">
        <div className="hidden md:flex items-center gap-1.5 flex-wrap">
          <Select
            value={filters.month}
            onValueChange={(v) => v && filters.setMonth(v)}
          >
            <SelectTrigger className="w-[130px] h-7 text-[11px]" aria-label="Select month">
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent className="max-h-[260px] min-w-[140px]">
              <SelectItem value="all">All Months</SelectItem>
              {options?.months.map((m) => (
                <SelectItem key={m} value={m}>
                  {MONTH_LABELS[m] || m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-slate-300 text-[11px]">|</span>

          <Select
            value={filters.district}
            onValueChange={(v) => v && filters.setDistrict(v)}
          >
            <SelectTrigger className="w-[140px] h-7 text-[11px]" aria-label="Select district">
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent className="max-h-[260px] min-w-[160px]">
              <SelectItem value="all">All Districts</SelectItem>
              {options?.districts.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.block}
            onValueChange={(v) => v && filters.setBlock(v)}
          >
            <SelectTrigger className="w-[160px] h-7 text-[11px]" aria-label="Select block">
              <SelectValue placeholder="All Blocks" />
            </SelectTrigger>
            <SelectContent className="max-h-[260px] min-w-[180px]">
              <SelectItem value="all">All Blocks</SelectItem>
              {options?.blocks.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.grade}
            onValueChange={(v) => v && filters.setGrade(v)}
          >
            <SelectTrigger className="w-[110px] h-7 text-[11px]" aria-label="Select grade">
              <SelectValue placeholder="All Grades" />
            </SelectTrigger>
            <SelectContent className="max-h-[260px] min-w-[120px]">
              <SelectItem value="all">All Grades</SelectItem>
              {options?.grades.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.subject}
            onValueChange={(v) => v && filters.setSubject(v)}
          >
            <SelectTrigger className="w-[120px] h-7 text-[11px]" aria-label="Select subject">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent className="max-h-[260px] min-w-[130px]">
              <SelectItem value="all">All Subjects</SelectItem>
              {options?.subjects.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={filters.resetFilters}
            title="Reset Filters"
            className="h-7 w-7 ml-1 text-slate-400 hover:text-slate-600"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center gap-2 text-sm text-slate-600"
        >
          <Filter className="h-4 w-4" />
          <span>Filters{active.length > 0 ? ` (${active.length})` : ""}</span>
        </button>
      </div>

      {active.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {active.map(([key, val]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-medium border border-emerald-200"
            >
              {key}: {val}
              <button
                onClick={() => {
                  if (key === "Month") filters.setMonth("");
                  else if (key === "District") filters.setDistrict("");
                  else if (key === "Block") filters.setBlock("");
                  else if (key === "Grade") filters.setGrade("");
                  else if (key === "Subject") filters.setSubject("");
                }}
                className="ml-0.5 hover:bg-emerald-200 rounded-full p-0.5"
                aria-label={`Remove ${key} filter`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {mobileOpen && (
        <div className="md:hidden p-4 border-t space-y-2">
          <MobileFilter
            label="Month"
            value={filters.month}
            options={options?.months || []}
            labels={MONTH_LABELS}
            onChange={(v) => filters.setMonth(v)}
          />
          <MobileFilter
            label="District"
            value={filters.district}
            options={options?.districts || []}
            onChange={(v) => filters.setDistrict(v)}
          />
          <MobileFilter
            label="Block"
            value={filters.block}
            options={options?.blocks || []}
            onChange={(v) => filters.setBlock(v)}
          />
          <MobileFilter
            label="Grade"
            value={filters.grade}
            options={options?.grades || []}
            onChange={(v) => filters.setGrade(v)}
          />
          <MobileFilter
            label="Subject"
            value={filters.subject}
            options={options?.subjects || []}
            onChange={(v) => filters.setSubject(v)}
          />
          <Button variant="outline" size="sm" onClick={filters.resetFilters} className="w-full">
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}

function MobileFilter({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: string[];
  labels?: Record<string, string>;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label={`Select ${label}`}
      >
        <option value="">All {label}s</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] || o}
          </option>
        ))}
      </select>
    </div>
  );
}
