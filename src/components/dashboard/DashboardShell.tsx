"use client";

import React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart3,
  Target as TargetIcon,
  Timer as TimerIcon,
  LineChart as LineChartIcon,
} from "lucide-react";

import type { DashboardData } from "./types";
import { pct, minutesToHMM } from "./utils";
import { KPI } from "./KPI";
// import { AccuracyByCategory } from "./AccuracyByCategory";
// import { ScoresOverTime } from "./ScoresOverTime";
import { RecentExamsTable } from "./RecentExamsTable";
import { QuickActions } from "./QuickActions";
import { DashboardSkeleton } from "./DashboardSkeleteon";

/** ---- small helper to show an active (not submitted) session banner ---- */
function ContinueActiveCard() {
  const [state, setState] = React.useState<
    | { kind: "loading" }
    | { kind: "none" }
    | {
        kind: "some";
        sessionId: string;
        minutes?: number | null;
        startedAt?: string | null;
        questionCount?: number | null;
        answeredCount?: number | null;
      }
  >({ kind: "loading" });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/exams/active", { cache: "no-store" });
        if (!alive) return;
        if (r.status === 204) {
          setState({ kind: "none" });
          return;
        }
        if (!r.ok) {
          setState({ kind: "none" });
          return;
        }
        const j = await r.json();
        const answeredCount = j?.responses
          ? Object.keys(j.responses).length
          : null;
        setState({
          kind: "some",
          sessionId: j.sessionId,
          minutes: j.minutes,
          startedAt: j.startedAt,
          questionCount: Array.isArray(j.questionIds)
            ? j.questionIds.length
            : null,
          answeredCount,
        });
      } catch {
        setState({ kind: "none" });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (state.kind !== "some") return null;

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Continue your active exam</CardTitle>
        <CardDescription>
          {state.answeredCount ?? 0}/{state.questionCount ?? "—"} answered ·{" "}
          {state.minutes ?? "—"} min session
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">
          You have an in-progress exam. Pick up where you left off or discard it
          and start a new one.
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild>
          <Link href={`/exam/${state.sessionId}`}>Resume</Link>
        </Button>
        <Button asChild variant="outline">
          {/* Change this link to your preferred new-exam entry */}
          <Link href="/practice?exam=random&count=57&minutes=90">
            Discard & start new
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function DashboardShell({
  data,
  isLoading = false,
}: {
  data: DashboardData;
  isLoading?: boolean;
}) {
  if (isLoading) return <DashboardSkeleton />;
  console.log("data from Dashboard",data)

  return (
    <TooltipProvider>
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Your SHSAT Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Track practice, spot weak areas, and keep your streak alive.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search exams or tags…" className="w-[220px]" />
            <Button asChild>
              {/* point this to your session-creating route */}
              <Link href="/practice?exam=random&count=57&minutes=90">
                New Exam
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* <KPI
            label="Questions Answered"
            value={`${data.totals.questionsAnswered}`}
            icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          /> */}
          <KPI
            label="Overall Accuracy"
            value={`${pct(data.totals.accuracy)}%`}
            sub="Across all categories"
            icon={<LineChartIcon className="h-4 w-4 text-muted-foreground" />}
          />
          <KPI
            label="Total Time"
            value={minutesToHMM(data.totals.minutes)}
            sub="Last 3 sessions"
            icon={<TimerIcon className="h-4 w-4 text-muted-foreground" />}
          />
          {/* <KPI
            label="Streak"
            value={`${data.totals.streakDays} days`}
            sub="Keep it going!"
            icon={<TargetIcon className="h-4 w-4 text-muted-foreground" />}
          /> */}
        </div>

        {/* Breakdown */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Breakdown</CardTitle>
            <CardDescription>
              Dive deeper into your practice history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="exams" className="w-full">
              <TabsList>
                <TabsTrigger value="exams">Exam History</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>

              <TabsContent value="exams" className="space-y-4 pt-4">
                {/* 👇 NEW: Only appears when there is an unfinished session */}
                <ContinueActiveCard />

                {/* Your existing table of submitted sessions */}
                <RecentExamsTable exams={data.recentExams} />
              </TabsContent>

              <TabsContent value="categories" className="pt-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.categoryStats.map((c) => (
                    <Card key={c.category}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {c.category}
                          </CardTitle>
                          <Badge
                            variant={
                              c.accuracy >= 0.75
                                ? "default"
                                : c.accuracy >= 0.6
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {pct(c.accuracy)}%
                          </Badge>
                        </div>
                        <CardDescription>
                          {c.correct}/{c.attempted} correct
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Progress
                          value={Math.round(c.accuracy * 100)}
                          className="h-2"
                        />
                        <div className="mt-3 flex gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/practice?category=${encodeURIComponent(
                                c.category
                              )}&count=20`}
                            >
                              Practice 20
                            </Link>
                          </Button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="ghost">
                                Focus plan
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Coming soon: adaptive set based on your errors.
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* CTA Row */}
        <div className="grid gap-4 md:grid-cols-2">
          <QuickActions />
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Upgrade for AI Insights</CardTitle>
              <CardDescription>
                Step-by-step solutions and adaptive drills.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• 💡 Explain my mistakes with detailed reasoning</p>
              <p>• 🎯 Generate similar questions for weak topics</p>
              <p>• 📈 Personalized weekly study plan</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/pricing">See plans</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Separator />
        <p className="text-xs text-muted-foreground">
          v1 modular scaffold — backed by Prisma models. Unsubmitted exams
          appear in the banner above Exam History.
        </p>
      </div>
    </TooltipProvider>
  );
}
