"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ImageIcon,
  FileImage,
  Newspaper,
  Grid3X3,
  List,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EvidenceRecord {
  id: string;
  recordType: string;
  grantId: string;
  donor: string;
  reportingMonth: string;
  district: string;
  title: string;
  summary: string;
  fileName: string;
  relativePath: string;
  usageNote: string;
  imageExists: boolean;
  imageUrl: string | null;
}

const CATEGORY_MAP: Record<string, string> = {
  image: "Student Activity",
  news_clipping: "News Coverage",
};

const CATEGORY_STYLES: Record<string, string> = {
  image: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  news_clipping: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
};

export default function EvidenceCenterPage() {
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EvidenceRecord | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetch("/api/evidence")
      .then((r) => r.json())
      .then((d) => setRecords(d.records))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter((r) => {
    if (categoryFilter !== "all" && r.recordType !== categoryFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.summary.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categories = [
    { value: "all", label: "All Media", count: records.length },
    { value: "image", label: "Student Activity", count: records.filter((r) => r.recordType === "image").length },
    { value: "news_clipping", label: "News Coverage", count: records.filter((r) => r.recordType === "news_clipping").length },
  ];

  function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    console.warn(`Image load failed: ${img.src}`);
    img.style.display = "none";
    const fallback = document.createElement("div");
    fallback.className = "w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600";
    fallback.innerHTML = '<svg class="h-10 w-10 mb-1" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><span class="text-[10px] text-slate-400 dark:text-slate-500">No preview</span>';
    img.parentElement?.appendChild(fallback);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Evidence Center"
        description="Browse student activity photos, recognition events, and news coverage. Click any card to view full details."
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search evidence by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-[var(--input)] dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500"
                aria-label="Search evidence"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn("p-1.5 rounded-md transition-colors", viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn("p-1.5 rounded-md transition-colors", viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(cat.value)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  categoryFilter === cat.value
                    ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                )}
              >
                {cat.label}
                <span className={cn(
                  "text-[10px] rounded-full px-1.5",
                  categoryFilter === cat.value ? "bg-emerald-500/30 text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                )}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((record) => (
            <Card
              key={record.id}
              className="cursor-pointer overflow-hidden hover:shadow-lg dark:hover:shadow-2xl transition-all duration-200 group"
              onClick={() => setSelected(record)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelected(record)}
              aria-label={`View ${record.title}`}
            >
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                {record.imageExists && record.imageUrl ? (
                  <img
                    src={record.imageUrl}
                    alt={record.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                    <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                    <span className="text-xs text-slate-400 dark:text-slate-500">No preview</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                    CATEGORY_STYLES[record.recordType] || "bg-slate-100 text-slate-700"
                  )}>
                    {record.recordType === "news_clipping" ? <Newspaper className="h-3 w-3" /> : <FileImage className="h-3 w-3" />}
                    <span>{CATEGORY_MAP[record.recordType] || record.recordType}</span>
                  </span>
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 leading-snug">
                  {record.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {record.summary}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-200">
                    {record.grantId}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-200">
                    {record.reportingMonth}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-200">
                    {record.district}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400 dark:text-slate-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No evidence records found</p>
              <p className="text-xs mt-1">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((record) => (
            <div
              key={record.id}
              className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-xl transition-all cursor-pointer"
              onClick={() => setSelected(record)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setSelected(record)}
            >
              <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0">
                {record.imageExists && record.imageUrl ? (
                  <img
                    src={record.imageUrl}
                    alt={record.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{record.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{record.summary}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-medium text-slate-700 dark:text-slate-200">{record.grantId}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{record.reportingMonth}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{CATEGORY_MAP[record.recordType] || record.recordType}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400 dark:text-slate-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No evidence records found</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  {selected.recordType === "news_clipping" ? <Newspaper className="h-4 w-4" /> : <FileImage className="h-4 w-4" />}
                  {selected.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden max-h-96">
                  {selected.imageExists && selected.imageUrl ? (
                    <img
                      src={selected.imageUrl}
                      alt={selected.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const img = e.currentTarget;
                        console.warn(`Image load failed: ${img.src}`);
                        img.style.display = "none";
                        const fallback = document.createElement("div");
                        fallback.className = "flex items-center justify-center h-64 text-slate-300 dark:text-slate-600";
                        fallback.innerHTML = '<svg class="h-16 w-16" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg><p class="text-sm ml-2">Image not available</p>';
                        img.parentElement?.appendChild(fallback);
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-slate-300 dark:text-slate-600">
                      <ImageIcon className="h-16 w-16" />
                      <p className="text-sm ml-2">Image not available</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{selected.summary}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-2.5">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Grant</span>
                    <span className="text-slate-800 dark:text-slate-100">{selected.grantId}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-2.5">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Month</span>
                    <span className="text-slate-800 dark:text-slate-100">{selected.reportingMonth}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-2.5">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">District</span>
                    <span className="text-slate-800 dark:text-slate-100">{selected.district}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/80 rounded-lg p-2.5">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Type</span>
                    <span className="text-slate-800 dark:text-slate-100 capitalize">{selected.recordType.replace("_", " ")}</span>
                  </div>
                </div>
                {selected.usageNote && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-800/80 rounded-lg p-3 leading-relaxed">
                    {selected.usageNote}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
