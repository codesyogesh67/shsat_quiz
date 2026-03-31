import { Badge } from "@/components/ui/badge";
import { FileBarChart2, BarChart3, PencilLine } from "lucide-react";

const steps = [
  {
    icon: FileBarChart2,
    step: "Step 1",
    title: "Take a diagnostic",
    desc:
      "Start with a focused SHSAT math diagnostic to measure current level.",
  },
  {
    icon: BarChart3,
    step: "Step 2",
    title: "Review the report",
    desc:
      "See strengths, weak areas, readiness level, and where to improve next.",
  },
  {
    icon: PencilLine,
    step: "Step 3",
    title: "Practice with purpose",
    desc:
      "Move into targeted topic drills instead of solving questions blindly.",
  },
];

export default function LandingHowItWorks() {
  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1 text-indigo-700"
          >
            How it works
          </Badge>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            A smarter SHSAT math workflow
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Built to help students know what to study, why it matters, and what
            to do next.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    0{index + 1}
                  </span>
                </div>

                <p className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-600">
                  {item.step}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
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
