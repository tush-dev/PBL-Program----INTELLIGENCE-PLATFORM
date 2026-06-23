"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, X, Filter } from "lucide-react";
import { useFilterStore } from "@/store/filters";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import type { FilterOptions, BlockOption } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MONTH_LABELS: Record<string, string> = {
  "July_2025": "July 2025",
  "August_2025": "August 2025",
  "September_2025": "September 2025",
};

const monthOptions = (months: string[]) =>
  months.map((m) => ({ value: m, label: MONTH_LABELS[m] || m }));

const districtOptions = (districts: string[]) =>
  districts.map((d) => ({ value: d, label: d }));

const blockOptions = (blocks: BlockOption[], currentDistrict: string) => {
  const filtered = currentDistrict
    ? blocks.filter((b) => b.districtName === currentDistrict)
    : blocks;
  return filtered.map((b) => ({ value: b.name, label: b.name }));
};

const simpleOptions = (items: string[]) =>
  items.map((i) => ({ value: i, label: i }));

const activeFilters = (filters: Record<string, string | undefined>) =>
  Object.entries(filters).filter(([, v]) => v && v !== "all") as [string, string][];

export function GlobalFilters() {
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const filters = useFilterStore();

  useEffect(() => {
    const load = async () => {
      const blockParams = filters.district
        ? `?district=${encodeURIComponent(filters.district)}`
        : "";
      const res = await fetch(`/api/filters${blockParams}`);
      setOptions(await res.json());
    };
    load();
  }, [filters.district]);

  const active = useMemo(
    () =>
      activeFilters({
        Month: filters.month,
        District: filters.district,
        Block: filters.block,
        Grade: filters.grade,
        Subject: filters.subject,
      }),
    [filters.month, filters.district, filters.block, filters.grade, filters.subject]
  );

  const clearFilter = (key: string) => {
    if (key === "Month") filters.setMonth("");
    else if (key === "District") { filters.setDistrict(""); filters.setBlock(""); }
    else if (key === "Block") filters.setBlock("");
    else if (key === "Grade") filters.setGrade("");
    else if (key === "Subject") filters.setSubject("");
  };

  const filterContent = (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-1.5 flex-wrap">
        <SearchableCombobox
          value={filters.month || "all"}
          onValueChange={(v) => filters.setMonth(v === "all" ? "" : v)}
          options={[{ value: "all", label: "All Months" }, ...(options ? monthOptions(options.months) : [])]}
          placeholder="All Months"
          searchPlaceholder="Search month..."
          className="w-[135px]"
        />
        <span className="text-slate-300 dark:text-slate-600 text-[11px] shrink-0">|</span>
        <SearchableCombobox
          value={filters.district || "all"}
          onValueChange={(v) => filters.setDistrict(v === "all" ? "" : v)}
          options={[{ value: "all", label: "All Districts" }, ...(options ? districtOptions(options.districts) : [])]}
          placeholder="All Districts"
          searchPlaceholder="Search district..."
          className="w-[145px]"
        />
        <SearchableCombobox
          value={filters.block || "all"}
          onValueChange={(v) => filters.setBlock(v === "all" ? "" : v)}
          options={[{ value: "all", label: "All Blocks" }, ...(options ? blockOptions(options.blocks, filters.district || "") : [])]}
          placeholder="All Blocks"
          searchPlaceholder="Search block..."
          className="w-[155px]"
        />
        <span className="text-slate-300 dark:text-slate-600 text-[11px] shrink-0">|</span>
        <SearchableCombobox
          value={filters.grade || "all"}
          onValueChange={(v) => filters.setGrade(v === "all" ? "" : v)}
          options={[{ value: "all", label: "All Grades" }, ...(options ? simpleOptions(options.grades) : [])]}
          placeholder="All Grades"
          searchPlaceholder="Search grade..."
          className="w-[115px]"
        />
        <SearchableCombobox
          value={filters.subject || "all"}
          onValueChange={(v) => filters.setSubject(v === "all" ? "" : v)}
          options={[{ value: "all", label: "All Subjects" }, ...(options ? simpleOptions(options.subjects) : [])]}
          placeholder="All Subjects"
          searchPlaceholder="Search subject..."
          className="w-[125px]"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={filters.resetFilters}
          title="Reset Filters"
          className="h-7 w-7 text-slate-400 hover:text-slate-600 shrink-0"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>

      {active.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {active.map(([key, val]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-medium border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
            >
              {key}: {MONTH_LABELS[val] || val}
              <button
                onClick={() => clearFilter(key)}
                className="ml-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full p-0.5"
                aria-label={`Remove ${key} filter`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900">
      <div className="px-4 py-2">
        <div className="hidden md:block">{filterContent}</div>
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <Filter className="h-4 w-4" />
              <span>Filters{active.length > 0 ? ` (${active.length})` : ""}</span>
            </SheetTrigger>
            <SheetContent side="bottom" showCloseButton={false}>
              <SheetTitle className="sr-only">Filters</SheetTitle>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-900">Filters</span>
                <button onClick={filters.resetFilters} className="text-xs text-emerald-600 font-medium">
                  Reset all
                </button>
              </div>
              <div className="space-y-3 pb-4">
                <MobileFilter
                  label="Month"
                  value={filters.month || "all"}
                  onChange={(v) => filters.setMonth(v === "all" ? "" : v)}
                  options={monthOptions(options?.months || [])}
                  placeholder="All Months"
                />
                <MobileFilter
                  label="District"
                  value={filters.district || "all"}
                  onChange={(v) => filters.setDistrict(v === "all" ? "" : v)}
                  options={districtOptions(options?.districts || [])}
                  placeholder="All Districts"
                />
                <MobileFilter
                  label="Block"
                  value={filters.block || "all"}
                  onChange={(v) => filters.setBlock(v === "all" ? "" : v)}
                  options={blockOptions(options?.blocks || [], filters.district || "")}
                  placeholder="All Blocks"
                />
                <MobileFilter
                  label="Grade"
                  value={filters.grade || "all"}
                  onChange={(v) => filters.setGrade(v === "all" ? "" : v)}
                  options={simpleOptions(options?.grades || [])}
                  placeholder="All Grades"
                />
                <MobileFilter
                  label="Subject"
                  value={filters.subject || "all"}
                  onChange={(v) => filters.setSubject(v === "all" ? "" : v)}
                  options={simpleOptions(options?.subjects || [])}
                  placeholder="All Subjects"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

function MobileFilter({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">{label}</label>
      <SearchableCombobox
        value={value}
        onValueChange={onChange}
        options={[{ value: "all", label: placeholder }, ...options]}
        placeholder={placeholder}
        searchPlaceholder={`Search ${label.toLowerCase()}...`}
        className="w-full"
        triggerClassName="h-9 text-sm"
      />
    </div>
  );
}
