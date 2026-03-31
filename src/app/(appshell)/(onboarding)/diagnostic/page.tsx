"use client";

import {
  CheckCircle2,
  Clock3,
  FileText,
  Layers3,
  Sparkles,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

import StartDiagnosticButton from "@/components/diagnostic/StartDiagnosticButton";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const includes = [
  "Balanced category coverage",
  "Timed diagnostic experience",
  "Score and category breakdown",
  "Weak-area identification",
  "Next-step study direction",
];

const topics = [
  "Number sense",
  "Algebra",
  "Geometry",
  "Word problems",
  "Percents, ratios, and proportions",
];

const studentTips = [
  "Work steadily instead of rushing.",
  "Skip and return if a question feels too long.",
  "Use the result to learn, not to judge.",
];

const quickStats = [
  {
    icon: Clock3,
    label: "Estimated time",
    value: "20–30 min",
  },
  {
    icon: Layers3,
    label: "Coverage",
    value: "Mixed math topics",
  },
  {
    icon: FileText,
    label: "Results",
    value: "Instant report",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.45,
      ease: "easeOut" as const,
    },
  }),
};

export default function DiagnosticLandingPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="">
            <div className="relative">
              <div className="absolute inset-0" />

              <div className="relative">
                <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                  {/* Left hero content */}
                  <div>
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      custom={0}
                    >
                      <Badge className="rounded-full border border-slate-200/70 bg-white text-slate-600 shadow-sm hover:bg-white">
                        <Sparkles className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
                        SHSAT Diagnostic
                      </Badge>
                    </motion.div>

                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      custom={1}
                      className="mt-6"
                    >
                      <div className="flex items-center gap-3">
                        <Target className="h-8 w-8 text-indigo-600" />
                        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Focused starting point
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      custom={2}
                    >
                      <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                        Start with a diagnostic,
                        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                          {" "}
                          then study smarter
                        </span>
                        .
                      </h1>
                    </motion.div>

                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      custom={3}
                    >
                      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
                        Answer a short set of mixed SHSAT math questions to
                        identify strengths, weak categories, and the best next
                        steps for practice. The goal is not only a score — it is
                        a clearer and more focused study direction.
                      </p>
                    </motion.div>

                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      custom={4}
                      className="mt-8"
                    >
                      <div className="[&>button]:rounded-full [&>button]:border-0 [&>button]:bg-gradient-to-r [&>button]:from-indigo-600 [&>button]:to-violet-600 [&>button]:text-white [&>button]:shadow-md [&>button]:shadow-indigo-500/20 [&>button]:transition-all [&>button]:duration-200 [&>button]:hover:opacity-95">
                        <StartDiagnosticButton />
                      </div>
                    </motion.div>
                  </div>

                  {/* Right summary card */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    custom={5}
                  >
                    <Card className="rounded-[28px] border border-slate-200/70 bg-white/95 shadow-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                            <Layers3 className="h-5 w-5" />
                          </div>

                          <div>
                            <CardTitle className="text-xl text-slate-900">
                              Quick overview
                            </CardTitle>
                            <CardDescription className="mt-1 text-slate-500">
                              This diagnostic is a short entry point into the
                              platform. It helps the student begin with
                              direction instead of guessing, and it gives an
                              early academic snapshot that makes later practice
                              more intentional and more efficient.
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {quickStats.map((item) => {
                          const Icon = item.icon;

                          return (
                            <div
                              key={item.label}
                              className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 transition-all duration-200 hover:bg-white"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                  <Icon className="h-4 w-4" />
                                </div>

                                <div>
                                  <p className="text-sm text-slate-500">
                                    {item.label}
                                  </p>
                                  <p className="mt-0.5 font-medium text-slate-900">
                                    {item.value}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-4">
                          <p className="text-sm font-semibold text-slate-900">
                            What students get from it
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Instead of studying everything at once, students can
                            begin with a clearer view of where they are already
                            doing well and which areas need more focused
                            attention first.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
