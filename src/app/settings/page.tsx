"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Database, Cpu, Shield, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="System configuration, AI narrative engine settings, risk threshold definitions, and database information."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-600" />
              AI Configuration
            </CardTitle>
            <CardDescription>
              Narrative generation engine settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">AI Mode</span>
              <Badge
                variant={process.env.NEXT_PUBLIC_USE_AI === "true" ? "default" : "secondary"}
                className={process.env.NEXT_PUBLIC_USE_AI === "true" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}
              >
                {process.env.NEXT_PUBLIC_USE_AI === "true"
                  ? "Enabled (Groq)"
                  : "Disabled (Rule-Based)"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Model</span>
              <span className="text-sm font-medium">
                {process.env.NEXT_PUBLIC_USE_AI === "true"
                  ? "Llama 3.3 70B"
                  : "Deterministic Engine"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Set <code className="bg-slate-100 px-1 rounded text-[10px]">USE_AI=true</code> and{" "}
              <code className="bg-slate-100 px-1 rounded text-[10px]">GROQ_API_KEY</code> in environment
              to enable AI narrative generation. All metrics and risk calculations remain
              deterministic regardless of AI setting.
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              Data Source
            </CardTitle>
            <CardDescription>
              Imported dataset information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Database</span>
              <span className="text-sm font-medium">SQLite (dev.db)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Import Status</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Complete
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Data Months</span>
              <span className="text-sm font-medium">July, August, September 2025</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Total Records</span>
              <span className="text-sm font-medium">6,900+</span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              Risk Thresholds
            </CardTitle>
            <CardDescription>
              Deterministic risk classification rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="font-medium text-emerald-800">On Track</span>
                <span className="font-semibold text-emerald-700">&ge; 75</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                <span className="font-medium text-amber-800">Behind</span>
                <span className="font-semibold text-amber-700">&ge; 60 and &lt; 75</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-orange-50 rounded-lg border border-orange-200">
                <span className="font-medium text-orange-800">At Risk</span>
                <span className="font-semibold text-orange-700">&ge; 35 and &lt; 60</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg border border-red-200">
                <span className="font-medium text-red-800">Critical</span>
                <span className="font-semibold text-red-700">&lt; 35</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-slate-600" />
              System Info
            </CardTitle>
            <CardDescription>
              Application version and build info
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Framework</span>
              <span className="text-sm font-medium">Next.js 16</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Database</span>
              <span className="text-sm font-medium">Prisma + SQLite</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              To migrate to PostgreSQL, update the{" "}
              <code className="bg-slate-100 px-1 rounded text-[10px]">DATABASE_URL</code> and run{" "}
              <code className="bg-slate-100 px-1 rounded text-[10px]">prisma migrate</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
