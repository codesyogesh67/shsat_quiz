// components/feature-strip.tsx
"use client";

import React from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { examKeys } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Brain, LineChart, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Feature = {
  title: string;
  desc: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tag?: "Pro" | "New";
  requiresAuth?: boolean;
};

const FEATURES: Feature[] = [
  {
    title: "AI Explanations",
    desc: "Understand mistakes and learn faster.",
    href: "/explanations",
    icon: Brain,
    tag: "Pro",
    requiresAuth: true,
  },
  {
    title: "Progress Dashboard",
    desc: "Accuracy, timing, and weak-topic heatmap.",
    href: "/dashboard",
    icon: LineChart,
    requiresAuth: true,
  },
  {
    title: "Custom Practice Sets",
    desc: "Build drills by topic & difficulty.",
    href: "/practice?mode=custom",
    icon: Puzzle,
  },
];

export default function FeatureStrip() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const goExam = (key: string) => {
    // Route to practice; server will preload and render TEST immediately.
    router.push(`/practice?exam=${encodeURIComponent(key)}`);
  };

  const goStartShsat57 = () => {
    const qs = new URLSearchParams({
      preset: "shsat57",
      minutes: "90", // ✅ fixed to 90 minutes
    });
    router.push(`/practice?${qs.toString()}`); // keep as-is (change to /practice if you prefer)
  };

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 py-10">
      <div className="mb-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Train smarter
        </h2>
        <p className="text-sm text-muted-foreground">
          Jump into full exams, learn with explanations, and track your
          progress.
        </p>
      </div>

      {/* Exam sets — full width */}
      <div className="mb-6">
        <div className="inline-block w-auto rounded-2xl border bg-white px-4 py-3 sm:px-5 sm:py-4 shadow-sm">
          <h3 className="text-sm sm:text-base font-semibold mb-1.5">
            Full Exam Sets
          </h3>
          <p className="text-xs text-neutral-600 mb-2">
            Jump into a specific past exam.
          </p>
          <div className="flex flex-wrap gap-2">
            {examKeys.map((key) => (
              <button
                key={key}
                onClick={() => goExam(key)}
                className="rounded-xl border px-3 py-1.5 text-xs sm:text-sm hover:bg-neutral-100"
                title={`Load ${key}`}
              >
                {key.replace("shsat_", "SHSAT ").toUpperCase()}
              </button>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={goStartShsat57}
              className="rounded-xl"
              title="57 questions • 90 minutes"
            >
              Custom SHSAT Math Exam (57 • 90)
            </Button>
          </div>
        </div>
      </div>

      {/* Compact, fully-clickable feature cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} feature={f} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ feature: f }: { feature: Feature }) {
  // Card is fully clickable; swap behavior based on auth requirement.
  const Inner = (
    <Card className="h-full transition hover:shadow-md hover:border-neutral-300 focus-visible:ring-2 focus-visible:ring-black cursor-pointer">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <f.icon className="h-5 w-5" />
            {f.title}
          </CardTitle>
          {f.tag && <Badge variant="secondary">{f.tag}</Badge>}
        </div>
        <CardDescription className="text-sm">{f.desc}</CardDescription>
      </CardHeader>
      {/* <CardContent className="pb-4" /> */}
    </Card>
  );

  if (f.requiresAuth) {
    return (
      <>
        <SignedIn>
          <Link
            href={f.href}
            className="block outline-none rounded-2xl"
            aria-label={f.title}
          >
            {Inner}
          </Link>
        </SignedIn>

        <SignedOut>
          {/* Make the whole card trigger SignIn modal */}
          <SignInButton mode="modal">
            <div
              role="button"
              tabIndex={0}
              className="block outline-none rounded-2xl"
              aria-label={`${f.title} (Sign in required)`}
            >
              {Inner}
            </div>
          </SignInButton>
        </SignedOut>
      </>
    );
  }

  return (
    <Link
      href={f.href}
      className="block outline-none rounded-2xl"
      aria-label={f.title}
    >
      {Inner}
    </Link>
  );
}
