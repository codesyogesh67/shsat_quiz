"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Target,
  BookOpen,
  BarChart3,
  User,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Target, label: "Diagnostic", href: "/diagnostic" },
  { icon: BookOpen, label: "Practice", href: "/practice" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: User, label: "Profile", href: "/profile" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen overflow-hidden border-r border-slate-200/70 bg-white/90 backdrop-blur-xl transition-[width,box-shadow] duration-300 md:flex md:flex-col",
        expanded ? "w-72 shadow-2xl shadow-slate-900/10" : "w-20"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="h-20 shrink-0 border-b border-slate-100 px-4">
          <Link
            href="/"
            className="flex h-full items-center gap-3 overflow-hidden"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p
                className={cn(
                  "whitespace-nowrap text-sm font-semibold text-slate-900 transition-all duration-200",
                  expanded
                    ? "translate-x-0 opacity-100"
                    : "pointer-events-none -translate-x-2 opacity-0"
                )}
              >
                SHSAT Guide
              </p>
              <p
                className={cn(
                  "whitespace-nowrap text-xs text-slate-500 transition-all duration-200 delay-75",
                  expanded
                    ? "translate-x-0 opacity-100"
                    : "pointer-events-none -translate-x-2 opacity-0"
                )}
              >
                Back to homepage
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-2 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-14 items-center rounded-2xl text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <span
                  className={cn(
                    "absolute left-7 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-transparent text-white"
                      : "bg-transparent text-slate-600"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <span
                  className={cn(
                    "pl-16 whitespace-nowrap transition-all duration-200",
                    expanded
                      ? "translate-x-0 opacity-100"
                      : "pointer-events-none opacity-0"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
