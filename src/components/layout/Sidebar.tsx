"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Grid3X3,
  ShieldAlert,
  FileText,
  Receipt,
  Image,
  ListChecks,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/district-intelligence", label: "Districts", icon: Map },
  { href: "/block-intelligence", label: "Blocks", icon: Grid3X3 },
  { href: "/risk-center", label: "Risk Center", icon: ShieldAlert },
  { href: "/review-preparation", label: "Review", icon: FileText },
  { href: "/grant-reporting", label: "Grants", icon: Receipt },
  { href: "/evidence-center", label: "Evidence", icon: Image },
  { href: "/actions-center", label: "Actions", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-slate-800 text-white flex flex-col transition-all duration-300 shrink-0 border-r border-slate-700",
        collapsed ? "w-16" : "w-56"
      )}
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-3 px-4 h-12 border-b border-slate-700 shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 shrink-0">
          <GraduationCap className="h-4 w-4 text-emerald-400" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-xs font-bold leading-tight text-white">PBL Program</h1>
            <p className="text-[9px] text-slate-500 font-medium tracking-wide uppercase">Intelligence Platform</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5 scrollbar-thin" role="navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-md text-xs transition-all duration-150 group relative",
                isActive
                  ? "bg-emerald-600/20 text-emerald-300 font-medium"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              )}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-400 rounded-full" />
              )}
              <Icon className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-emerald-400" : "text-slate-500"
              )} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-1.5 border-t border-slate-700 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-700 h-7 text-xs"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </aside>
  );
}
