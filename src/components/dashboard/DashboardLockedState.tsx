// src/components/dashboard/DashboardLockedState.tsx
import Link from "next/link";
import { Crown, Lock, ArrowRight, BarChart3, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UserAccess } from "@/lib/access";

type Props = {
  access: UserAccess;
};

export default function DashboardLockedState({ access }: Props) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-6 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur">
            <Lock className="h-3.5 w-3.5" />
            Premium Dashboard Access
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Your dashboard is locked
          </h1>

          <p className="max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
            Continue practicing for free, or upgrade to unlock your full SHSAT
            performance dashboard, advanced review panels, and deeper progress
            insights.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {/* Main lock card */}
          <Card className="xl:col-span-2 rounded-3xl border-slate-200/70 bg-white shadow-sm">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                      <BarChart3 className="h-6 w-6" />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold text-slate-900">
                        Unlock your full student dashboard
                      </h2>

                      <p className="text-sm leading-6 text-slate-500">
                        View progress trends, detailed session reviews,
                        weak-topic signals, and premium-level insights designed
                        to help students and parents understand real improvement
                        over time.
                      </p>
                    </div>
                  </div>

                  {access.isTrialExpired ? (
                    <div className="inline-flex h-fit items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      Trial expired
                    </div>
                  ) : access.isTrialActive ? (
                    <div className="inline-flex h-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      {access.trialDaysLeft} day
                      {access.trialDaysLeft === 1 ? "" : "s"} left
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                    <p className="text-sm font-medium text-slate-900">
                      Included with Premium
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li>• Full dashboard analytics</li>
                      <li>• Detailed review panels</li>
                      <li>• Progress tracking over time</li>
                      <li>• Better visibility into weak areas</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                    <p className="text-sm font-medium text-slate-900">
                      Still available for free
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li>• Practice sessions</li>
                      <li>• Quick review after practice</li>
                      <li>• Continued access to core practice flow</li>
                      <li>• Upgrade whenever you are ready</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:opacity-95"
                  >
                    <Link href="/pricing">
                      Upgrade to Premium
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-xl border-slate-200/80 bg-white text-slate-700 transition-all duration-200 hover:bg-slate-100"
                  >
                    <Link href="/practice">Continue Free Practice</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Side summary card */}
          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Crown className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      SHSAT Guide Premium
                    </p>
                    <p className="text-xs text-slate-500">
                      Full learning dashboard access
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Designed for serious prep
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Premium is where students see patterns, track accuracy,
                        and review mistakes with more depth.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Practice mode</span>
                    <span className="font-medium text-emerald-600">
                      Included
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Quick review</span>
                    <span className="font-medium text-emerald-600">
                      Included
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dashboard analytics</span>
                    <span className="font-medium text-slate-900">Premium</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Detailed review panels</span>
                    <span className="font-medium text-slate-900">Premium</span>
                  </div>
                </div>

                <Button
                  asChild
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:opacity-95"
                >
                  <Link href="/pricing">See plans</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
