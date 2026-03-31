"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Sparkles,
  LayoutDashboard,
  Target,
  BookOpen,
  BarChart3,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Target, label: "Diagnostic", href: "/diagnostic" },
  { icon: BookOpen, label: "Practice", href: "/practice" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: User, label: "Profile", href: "/profile" },
];

export default function MobileAppSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="border-slate-300 bg-white/80 backdrop-blur"
          aria-label="Open app menu"
          disabled
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="border-slate-300 bg-white/80 backdrop-blur"
            aria-label="Open app menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-80 p-0 [&>button]:hidden">
          <SheetHeader className="border-b px-5 py-5">
            <div className="flex items-center justify-between">
              <SheetTitle asChild>
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-md px-1 py-1"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">
                      SHSAT Guide
                    </p>
                    <p className="text-xs text-slate-500">Back to homepage</p>
                  </div>
                </Link>
              </SheetTitle>

              <SheetClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close app menu">
                  <X className="h-5 w-5" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          <div className="px-4 py-4">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex h-14 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          active
                            ? "bg-transparent text-white"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      <span>{item.label}</span>
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
