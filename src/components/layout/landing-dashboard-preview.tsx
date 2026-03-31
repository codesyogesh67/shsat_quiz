import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, BarChart3, Clock3, Target } from "lucide-react";

export default function LandingDashboardPreview() {
  return (
    <section className="relative py-14 md:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55rem_28rem_at_50%_0%,theme(colors.indigo.500/.10),transparent)]"
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28">
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <Badge
              variant="secondary"
              className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-slate-700"
            >
              Student dashboard preview
            </Badge>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Give students a clear next step every time they log in
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Instead of leaving students with random practice, the dashboard
              should show weak topics, recent sessions, weekly goals, and the
              next best action.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: Target,
                  title: "Weak-topic focus",
                  desc:
                    "Direct attention to the categories that need the most improvement.",
                },
                {
                  icon: Clock3,
                  title: "Study plan direction",
                  desc:
                    "Turn report results into manageable daily and weekly practice.",
                },
                {
                  icon: BarChart3,
                  title: "Progress visibility",
                  desc:
                    "Make growth easy to see through scores, streaks, and session history.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_25px_80px_-30px_rgba(79,70,229,0.35)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Dashboard snapshot
                </p>
                <p className="text-xs text-slate-500">
                  Inspired by your app experience
                </p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Live feel
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                      Today’s focus
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">
                      Algebra + Ratios
                    </h3>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-white/70" />
                </div>

                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[64%] rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400" />
                </div>

                <p className="mt-3 text-xs text-white/70">
                  64% weekly goal progress
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs text-slate-500">Weakest topic</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    Algebra
                  </p>
                  <p className="mt-2 text-xs text-rose-600">Needs attention</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs text-slate-500">Recent sessions</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    3 this week
                  </p>
                  <p className="mt-2 text-xs text-emerald-600">
                    Study streak active
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">
                    Recommended next step
                  </p>
                  <span className="text-xs text-slate-500">Now</span>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Practice 10 algebra questions, then review your last 2 mistake
                  patterns before starting a mixed drill.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
