"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/diagnostic", label: "Diagnostic" },
  { href: "/practice", label: "Practice" },
];

export function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-1.5">
      {nav.map((item) => {
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "group relative inline-flex items-center justify-center overflow-hidden rounded-full",
              "px-4 py-2 text-sm font-medium",
              // "border border-transparent text-slate-600",
              // "transition-all duration-200",
              "hover:-translate-y-0",
              // "hover:border-indigo-200/70 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50",
              // "hover:text-slate-900 hover:shadow-sm hover:shadow-indigo-500/10",
              "hover:bg-gradient-to-r from-indigo-600 to-violet-600 hover:text-white"
              // "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
            )}
          >
            <span className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.08))] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            <span className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-300/70 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
