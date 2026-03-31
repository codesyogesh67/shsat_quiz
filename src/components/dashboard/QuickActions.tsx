"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Flag,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const actions = [
  {
    title: "Practice weak topics",
    description: "Focus on your lowest-performing categories.",
    href: "/practice",
    icon: Target,
    iconStyle: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Review flagged questions",
    description: "Revisit questions you marked earlier.",
    href: "/review?filter=flagged",
    icon: Flag,
    iconStyle: "bg-amber-50 text-amber-600",
  },
  {
    title: "Study with guidance",
    description: "Unlock structured explanations and study flows.",
    href: "/pricing",
    icon: Brain,
    iconStyle: "bg-violet-50 text-violet-600",
  },
];

export function QuickActions() {
  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Quick actions
          </h2>
          <p className="text-sm text-slate-500">Move forward with your prep.</p>
        </div>

        <div className="hidden items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 sm:flex">
          <Sparkles className="h-3.5 w-3.5" />
          Recommended
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {/* 🔥 Featured Action */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <PlayCircle className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-white/90">
                Start full exam
              </p>
              <p className="mt-1 text-sm text-white/80">
                Simulate the real SHSAT under timed conditions.
              </p>

              <Button
                asChild
                size="sm"
                className="mt-3 rounded-xl bg-white text-slate-900 hover:bg-white/90"
              >
                <Link href="/exams">
                  Begin exam
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ⚡ Action List */}
        <div className="space-y-2">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all duration-200 hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.iconStyle}`}
                  >
                    {" "}
                    <Icon className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {action.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {action.description}
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-600" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
