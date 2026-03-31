import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const points = [
  "Understand student strengths and weak areas clearly",
  "Give practice direction instead of random question solving",
  "Build confidence with visible progress and structured next steps",
];

export default function LandingParentSection() {
  return (
    <section className="relative py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_.95fr]">
          <div className="rounded-[30px] border border-slate-200/80 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-xl shadow-indigo-500/20">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
              For students and parents
            </Badge>

            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Make SHSAT prep feel focused, serious, and easy to follow
            </h2>

            <p className="mt-4 max-w-xl text-white/80">
              Students need clarity. Parents want confidence that study time is
              being used well. Your platform can give both.
            </p>
          </div>

          <div className="rounded-[30px] border border-slate-200/80 bg-white/85 p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900">
              Why this approach works
            </h3>

            <div className="mt-6 space-y-5">
              {points.map((point) => (
                <div key={point} className="flex gap-3">
                  <div className="mt-0.5 rounded-full p-1 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
