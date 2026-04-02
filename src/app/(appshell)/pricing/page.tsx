// src/app/pricing/page.tsx
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getUserAccess } from "@/lib/access";
import {
  Crown,
  Sparkles,
  Check,
  BarChart3,
  FileSearch,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function PricingPage() {
  const { userId: clerkUserId } = await auth();

  let access = getUserAccess(null);

  if (clerkUserId) {
    const user = await prisma.user.findUnique({
      where: { externalAuthId: clerkUserId },
      select: {
        planType: true,
        trialStartedAt: true,
        trialEndsAt: true,
        premiumStartedAt: true,
        premiumEndsAt: true,
      },
    });

    access = getUserAccess(user);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-10 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        {/* Hero */}
        <section className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            SHSAT Guide Pricing
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Start free. Upgrade when you want deeper insight.
            </h1>

            <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
              New students begin with full access for 7 days. After the trial,
              you can keep practicing for free or upgrade to continue using the
              dashboard, detailed review panels, and premium learning insights.
            </p>
          </div>

          {access.isTrialActive ? (
            <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              Your trial is active — {access.trialDaysLeft} day
              {access.trialDaysLeft === 1 ? "" : "s"} left
            </div>
          ) : access.isTrialExpired ? (
            <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              Your trial has ended — upgrade anytime to unlock premium features
            </div>
          ) : access.isPremium ? (
            <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              You are currently on Premium
            </div>
          ) : null}
        </section>

        {/* Pricing cards */}
        <section className="grid gap-6 xl:grid-cols-3">
          {/* Free practice */}
          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
            <CardContent className="flex h-full flex-col p-6">
              <div className="mb-6 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <GraduationCap className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Free</h2>
                  <p className="text-sm text-slate-500">
                    Keep practicing without losing access to the app.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-semibold text-slate-900">$0</p>
                <p className="mt-1 text-sm text-slate-500">Always available</p>
              </div>

              <ul className="mb-8 space-y-3 text-sm text-slate-600">
                <FeatureItem text="Practice sessions" />
                <FeatureItem text="Quick review after practice" />
                <FeatureItem text="Continue learning for free" />
                <FeatureItem text="Upgrade whenever ready" />
              </ul>

              <div className="mt-auto">
                <Button asChild className="h-11 w-full rounded-xl">
                  <Link href="/practice">Continue with Free</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Trial */}
          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
            <CardContent className="flex h-full flex-col p-6">
              <div className="mb-6 space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    7-Day Trial
                  </h2>
                  <p className="text-sm text-slate-500">
                    Full access for new students.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-semibold text-slate-900">$0</p>
                <p className="mt-1 text-sm text-slate-500">
                  Includes all premium features for 7 days
                </p>
              </div>

              <ul className="mb-8 space-y-3 text-sm text-slate-600">
                <FeatureItem text="Full dashboard access" />
                <FeatureItem text="Detailed review panels" />
                <FeatureItem text="Progress visibility" />
                <FeatureItem text="Premium-style learning experience" />
              </ul>

              <div className="mt-auto">
                <Button asChild className="h-11 w-full rounded-xl ">
                  <Link href="/sign-up">Start Free Trial</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card className="relative overflow-hidden rounded-3xl border-slate-200/70 bg-white shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-600 to-violet-600" />

            <CardContent className="flex h-full flex-col p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl app-icon-filled">
                    <Crown className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Premium
                    </h2>
                    <p className="text-sm text-slate-500">
                      For families who want the full SHSAT system.
                    </p>
                  </div>
                </div>

                <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Recommended
                </div>
              </div>

              <div className="mb-6">
                <p className="text-3xl font-semibold text-slate-900">
                  $99
                  <span className="text-base font-medium text-slate-500">
                    /year
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Full access to premium features
                </p>
              </div>

              <ul className="mb-8 space-y-3 text-sm text-slate-600">
                <FeatureItem text="Full dashboard analytics" />
                <FeatureItem text="Detailed review panels" />
                <FeatureItem text="Better progress visibility over time" />
                <FeatureItem text="Deeper learning insight for students and parents" />
              </ul>

              <div className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
                <div className="flex items-start gap-3">
                  <BarChart3 className="mt-0.5 h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Premium value
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Premium is where the app becomes a true study system, not
                      just a practice tool.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <Button className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:opacity-95">
                  Upgrade to Premium
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Comparison section */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <FileSearch className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    What stays free
                  </h3>
                  <p className="text-sm text-slate-500">
                    Useful practice without full premium insight
                  </p>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-slate-600">
                <FeatureItem text="Practice by topic or session" />
                <FeatureItem text="Quick review after completion" />
                <FeatureItem text="Core learning access remains available" />
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl app-icon-filled">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    What premium unlocks
                  </h3>
                  <p className="text-sm text-slate-500">
                    The deeper layer of the SHSAT learning system
                  </p>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-slate-600">
                <FeatureItem text="Dashboard and progress insights" />
                <FeatureItem text="Detailed review panels" />
                <FeatureItem text="Stronger visibility into mistakes and patterns" />
                <FeatureItem text="A more complete learning experience" />
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      </div>
      <span>{text}</span>
    </li>
  );
}
