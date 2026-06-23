"use client";

import { useEffect, useState } from "react";
import { useFilterStore } from "@/store/filters";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Copy,
  Check,
  FileDown,
  Lightbulb,
  AlertTriangle,
  Award,
  Target,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface ReviewData {
  summary: {
    executiveSummary: string;
    achievements: string[];
    gaps: string[];
    priorityDistricts: string[];
    priorityBlocks: string[];
    discussionPoints: string[];
  };
  narrative: string;
}

export default function ReviewPreparationPage() {
  const filters = useFilterStore();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const q = new URLSearchParams();
  if (filters.month && filters.month !== "all") q.set("month", filters.month);
  if (filters.district && filters.district !== "all") q.set("district", filters.district);
  if (filters.block && filters.block !== "all") q.set("block", filters.block);
  if (filters.grade && filters.grade !== "all") q.set("grade", filters.grade);
  if (filters.subject && filters.subject !== "all") q.set("subject", filters.subject);

  useEffect(() => {
    fetch(`/api/review?${q}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.month, filters.district, filters.block, filters.grade, filters.subject]);

  const handleCopy = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.narrative);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (format: "txt" | "html") => {
    if (!data) return;
    const content = format === "html"
      ? data.narrative.replace(/\n/g, "<br>").replace(/•/g, "&bull;")
      : data.narrative;

    const blob = new Blob(
      [format === "html" ? `<html><body><pre>${content}</pre></body></html>` : content],
      { type: format === "html" ? "text/html" : "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `review-summary.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${format.toUpperCase()}`);
  };

  if (loading || !data) {
    return (
      <div className="space-y-5">
        <PageHeader title="Review Preparation" description="Loading..." />
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-40 bg-slate-200 rounded-xl" />
            <div className="h-40 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Review Preparation"
        description="Auto-generated leadership briefing covering achievements, risks, priority areas, and discussion questions for program review meetings."
      >
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 text-xs">
            {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload("txt")} className="h-8 text-xs">
            <FileDown className="h-3.5 w-3.5 mr-1" /> TXT
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDownload("html")} className="h-8 text-xs">
            <Download className="h-3.5 w-3.5 mr-1" /> HTML
          </Button>
        </div>
      </PageHeader>

      {/* Executive Summary Banner */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-white overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Executive Summary</h2>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                {data.summary.executiveSummary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements & Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-emerald-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-700">
              <Award className="h-4 w-4" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.summary.achievements.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-emerald-50/50">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700">{a}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Risks & Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.summary.gaps.map((g, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-red-50/50">
                <span className="w-5 h-5 rounded-full bg-red-200 text-red-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700">{g}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Priority Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-700">
              <Target className="h-4 w-4" />
              Priority Districts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.summary.priorityDistricts.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-orange-50/50">
                  <ChevronRight className="h-4 w-4 text-orange-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-800">{d}</span>
                </div>
              ))}
              {data.summary.priorityDistricts.length === 0 && (
                <p className="text-sm text-slate-400">No priority districts identified</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-700">
              <Target className="h-4 w-4" />
              Priority Blocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.summary.priorityBlocks.map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-orange-50/50">
                  <ChevronRight className="h-4 w-4 text-orange-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-800">{b}</span>
                </div>
              ))}
              {data.summary.priorityBlocks.length === 0 && (
                <p className="text-sm text-slate-400">No priority blocks identified</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Actions */}
      <Card className="border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
            <Lightbulb className="h-4 w-4" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.summary.discussionPoints.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700">
                <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-medium">
                  {i + 1}
                </span>
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Discussion Questions */}
      <Card className="border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700">
            <MessageSquare className="h-4 w-4" />
            Discussion Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.summary.discussionPoints.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700">
                <span className="bg-purple-100 text-purple-700 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-medium">
                  {i + 1}
                </span>
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
