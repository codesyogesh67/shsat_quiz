import { Brain, Target, BarChart3 } from "lucide-react";

const stats = [
  {
    icon: Brain,
    title: "Diagnostic-first workflow",
    desc: "Students begin with clarity instead of random practice.",
  },
  {
    icon: Target,
    title: "Target weak topics",
    desc: "Focus time on the categories that matter most.",
  },
  {
    icon: BarChart3,
    title: "Track real progress",
    desc: "See growth through report cards and guided review.",
  },
];

export default function LandingStatsStrip() {
  return (
    <section className="relative py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur"
              >
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
