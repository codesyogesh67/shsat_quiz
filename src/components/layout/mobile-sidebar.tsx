"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Menu,
  Sparkles,
  Target,
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
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

type MobileSidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const mobileNav = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Track progress, accuracy, and recent sessions.",
    icon: BarChart3,
  },
  {
    href: "/diagnostic",
    label: "Diagnostic",
    description: "Find weak areas and get your starting level.",
    icon: ClipboardList,
  },
  {
    href: "/practice",
    label: "Practice",
    description: "Train by topic, timed sets, and exam-style flow.",
    icon: Target,
  },
];

function MobileNavCard({
  href,
  label,
  description,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative block overflow-hidden rounded-[28px]",
        "border border-slate-200/70",
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.72))]",
        "p-4 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl",
        "transition-all duration-200",
        "hover:border-indigo-200/80 hover:shadow-[0_14px_40px_rgba(99,102,241,0.10)]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(28rem_14rem_at_0%_0%,rgba(99,102,241,0.10),transparent_55%),radial-gradient(22rem_12rem_at_100%_100%,rgba(139,92,246,0.08),transparent_55%)] opacity-70 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center app-icon-filled">
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold tracking-wide text-slate-900">
              {label}
            </h3>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>

          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function MobileSidebar({ open, setOpen }: MobileSidebarProps) {
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");

    const onChange = () => {
      if (mq.matches) setOpen(false);
    };

    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setOpen]);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Open menu"
            className={cn(
              "rounded-2xl border border-slate-200/70 bg-white/80 text-slate-700",
              "shadow-sm backdrop-blur-xl transition-all duration-200",
              "hover:border-indigo-200/80",
              "hover:bg-[radial-gradient(80%_120%_at_50%_0%,rgba(99,102,241,0.10),transparent_70%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))]",
              "hover:text-slate-900"
            )}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className={cn(
            "w-[24rem] max-w-[92vw] border-l border-slate-200/70 p-0 [&>button]:hidden",
            "bg-[radial-gradient(38rem_18rem_at_100%_0%,rgba(99,102,241,0.16),transparent_52%),radial-gradient(24rem_14rem_at_0%_100%,rgba(139,92,246,0.12),transparent_50%),linear-gradient(to_bottom_right,rgba(248,250,252,0.98),rgba(255,255,255,0.98),rgba(238,242,255,0.72))]"
          )}
        >
          <div className="flex h-full min-h-0 flex-col">
            <SheetHeader className="shrink-0 px-5 pt-6">
              <div className="flex items-start justify-between gap-4">
                <SheetTitle asChild>
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="group flex min-w-0 items-center gap-3"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center app-icon-filled">
                      <Sparkles className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 leading-tight">
                      <p className="truncate text-sm font-semibold tracking-wide text-slate-900">
                        SHSAT Guide
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        Premium math prep platform
                      </p>
                    </div>
                  </Link>
                </SheetTitle>

                <div className="flex items-center gap-2">
                  <SignedIn>
                    <div>
                      <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                          elements: {
                            userButtonAvatarBox: "h-8 w-8 rounded-xl",
                            userButtonTrigger:
                              "rounded-xl transition-all duration-200 focus:shadow-none focus:ring-0",
                            userButtonPopoverCard:
                              "shadow-2xl border border-slate-200 rounded-2xl",
                          },
                        }}
                      />
                    </div>
                  </SignedIn>

                  <SheetClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Close menu"
                      className="cursor-pointer rounded-xl text-slate-700 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <X className="h-5 w-5 text-indigo-600" />
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-5">
              <div className="space-y-4">
                <div className="overflow-hidden">
                  <div className="pointer-events-none mb-4 h-px" />
                  <div className="space-y-3">
                    {mobileNav.map((item) => (
                      <MobileNavCard
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        description={item.description}
                        icon={item.icon}
                        onClick={() => setOpen(false)}
                      />
                    ))}
                  </div>
                </div>

                <SignedOut>
                  <div className="rounded-[28px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,255,255,0.64))] p-4 shadow-[0_10px_35px_rgba(15,23,42,0.05)] backdrop-blur-xl">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Continue your prep
                        </p>
                        <p className="text-xs text-slate-500">
                          Access dashboard and exam progress
                        </p>
                      </div>
                    </div>

                    <SignInButton mode="modal">
                      <Button className="mt-2 h-8 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:opacity-95">
                        Sign in
                      </Button>
                    </SignInButton>
                  </div>
                </SignedOut>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
