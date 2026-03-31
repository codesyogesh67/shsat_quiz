// src/components/review/DetailedReviewLockedState.tsx
import Link from "next/link";
import {
  ArrowRight,
  Crown,
  Lock,
  FileSearch,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UserAccess } from "@/lib/access";

type Props = {
  access: UserAccess;
  sessionTitle?: string;
};

export default function DetailedReviewLockedState({
  access,
  sessionTitle = "This session",
}: Props) {
  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-slate-200/70 bg-white shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                  <FileSearch className="h-6 w-6" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    <Lock className="h-3.5 w-3.5" />
                    Premium Review Panel
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    Detailed review is locked
                  </h1>

                  <p className="max-w-2xl text-sm leading-6 text-slate-500">
                    {sessionTitle} includes a premium review experience with
                    deeper mistake analysis, stronger learning feedback, and
                    more useful progress visibility.
                  </p>
                </div>
              </div>

              {access.isTrialExpired ? (
                <div className="inline-flex h-fit items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  Trial expired
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  What you can still do now
                </h2>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <p className="text-sm leading-6 text-slate-600">
                      Continue practicing questions normally
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <p className="text-sm leading-6 text-slate-600">
                      See quick review after your session
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <p className="text-sm leading-6 text-slate-600">
                      Return to free practice anytime
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                    <Crown className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Unlock full review
                    </p>
                    <p className="text-xs text-slate-500">
                      Premium feedback and analysis
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>• Detailed review panels</li>
                  <li>• Better mistake visibility</li>
                  <li>• Deeper performance insight</li>
                  <li>• Stronger progress tracking over time</li>
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
                <Link href="/practice">Back to Practice</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional blurred preview card */}
      <Card className="overflow-hidden rounded-3xl border-slate-200/70 bg-white shadow-sm">
        <CardContent className="relative p-0">
          <div className="grid gap-0 md:grid-cols-3">
            <div className="border-b border-slate-200/70 p-5 md:border-b-0 md:border-r">
              <div className="mb-3 h-4 w-24 rounded bg-slate-200" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-5/6 rounded bg-slate-100" />
                <div className="h-3 w-4/6 rounded bg-slate-100" />
              </div>
            </div>

            <div className="border-b border-slate-200/70 p-5 md:border-b-0 md:border-r">
              <div className="mb-3 h-4 w-28 rounded bg-slate-200" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-4/6 rounded bg-slate-100" />
                <div className="h-3 w-3/6 rounded bg-slate-100" />
              </div>
            </div>

            <div className="p-5">
              <div className="mb-3 h-4 w-20 rounded bg-slate-200" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-5/6 rounded bg-slate-100" />
                <div className="h-3 w-2/6 rounded bg-slate-100" />
              </div>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-sm font-medium text-slate-900">
                Upgrade to unlock full detailed review
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
