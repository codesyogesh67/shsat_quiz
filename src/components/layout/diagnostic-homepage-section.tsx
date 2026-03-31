"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Target, BarChart3, ArrowRight, Sparkles } from "lucide-react";

const items = [
  {
    icon: Brain,
    title: "Find weak topics fast",
    desc: "See where the student struggles most across core SHSAT math areas.",
  },
  {
    icon: BarChart3,
    title: "Get a real report card",
    desc:
      "Receive a clear performance breakdown with strengths, gaps, and readiness level.",
  },
  {
    icon: Target,
    title: "Follow a smart plan",
    desc:
      "Turn diagnostic results into focused practice instead of random question solving.",
  },
];

export default function DiagnosticHomepageSection() {
  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_30rem_at_50%_0%,theme(colors.indigo.500/.10),transparent),radial-gradient(50rem_24rem_at_100%_100%,theme(colors.fuchsia.500/.08),transparent)]"
      />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28">
        <Card className="overflow-hidden rounded-3xl border-indigo-200 bg-background/90 shadow-sm">
          <CardContent className="grid gap-10 p-6 md:grid-cols-[1.2fr_.8fr] md:p-10">
            <div>
              <Badge variant="secondary" className="mb-4">
                Start Here
              </Badge>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Begin with a diagnostic, not a guess.
              </h2>

              <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Let students take a focused SHSAT math diagnostic first. Then
                show a report card with weak areas, confidence level, and a
                suggested path forward.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="rounded-2xl border bg-background/70 p-4"
                    >
                      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-xl">
                  <Link href="/diagnostic">
                    Take Diagnostic
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-xl"
                >
                  <Link href="/practice">Practice by Topic</Link>
                </Button>
              </div>
            </div>

            <div className="flex">
              <div className="w-full rounded-3xl border bg-gradient-to-br from-indigo-50 via-background to-fuchsia-50 p-6">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  Diagnostic Outcome
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="text-xs text-muted-foreground">
                      Estimated Readiness
                    </div>
                    <div className="mt-1 text-2xl font-bold">Developing</div>
                    <div className="mt-2 h-2 rounded-full bg-muted">
                      <div className="h-2 w-[58%] rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold">Top weak areas</div>
                    <div className="mt-3 space-y-3">
                      {[
                        ["Algebra", "62% need work"],
                        ["Ratios & Percent", "55% need work"],
                        ["Geometry", "48% need work"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span>{label}</span>
                            <span className="text-muted-foreground">
                              {value}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-indigo-500"
                              style={{ width: value }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="text-sm font-semibold">
                      Recommended next step
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Complete 3 weak-topic practice sets this week, then retake
                      a mini diagnostic.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
