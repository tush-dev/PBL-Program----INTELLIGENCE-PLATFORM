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
  Menu,
  X,
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

function NavContent({ collapsed, onNavClick }: { collapsed: boolean; onNavClick?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5 scrollbar-thin" role="navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 px-2.5 py-2 rounded-md text-xs transition-all duration-150 group relative",
              isActive
                ? "bg-emerald-700 text-white font-medium"
                : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
            )}
            title={collapsed ? item.label : undefined}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className={cn(
              "h-4 w-4 shrink-0",
              isActive ? "text-white" : "text-slate-400"
            )} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-2 left-2 z-50 md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-[#111827] text-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 z-50 md:hidden flex flex-col bg-[#111827] text-white border-r border-slate-800 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: "16rem" }}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 shrink-0">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-bold leading-tight text-white">PBL Program</h1>
              <p className="text-[9px] text-slate-400 font-medium tracking-wide uppercase">Intelligence Platform</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <NavContent collapsed={false} onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r transition-all duration-300",
          "bg-[#111827] text-white border-slate-800",
          collapsed ? "w-16" : "w-56"
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3 px-4 h-12 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 shrink-0">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-xs font-bold leading-tight text-white">PBL Program</h1>
              <p className="text-[9px] text-slate-400 font-medium tracking-wide uppercase">Intelligence Platform</p>
            </div>
          )}
        </div>
        <NavContent collapsed={collapsed} />
        <div className="p-1.5 border-t border-slate-800 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-slate-500 hover:text-slate-300 hover:bg-[#1E293B] h-7 text-xs"
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
    </>
  );
}
