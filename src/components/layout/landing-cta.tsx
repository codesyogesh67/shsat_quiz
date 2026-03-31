import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileBarChart2 } from "lucide-react";

export default function LandingCta() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-3 sm:px-6 md:px-10">
        <div className="rounded-[32px] border border-slate-200/80 bg-white/85 p-8 text-center shadow-[0_24px_80px_-30px_rgba(79,70,229,0.30)] backdrop-blur md:p-12">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            Start smarter
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Begin with the diagnostic and turn results into action
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Build a clearer SHSAT math path with diagnostic analysis, targeted
            practice, and a stronger dashboard experience.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-white shadow-lg shadow-indigo-500/20"
            >
              <Link href="/diagnostic">
                <FileBarChart2 className="mr-2 h-4 w-4" />
                Start Diagnostic
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-xl border-slate-300 bg-white px-6 text-slate-700"
            >
              <Link href="/practice">
                Explore Practice
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
