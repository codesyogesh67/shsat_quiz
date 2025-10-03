// components/category-grid.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  Sigma,
  Ruler,
  BarChart3,
  BookOpen,
  Lock,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

type Counts = Record<string, number>;

// Map each display card to your backend slug(s)

const CATEGORY_DEFS = [
  {
    label: "Algebra",
    icon: Sigma,
    blurb: "Equations, expressions, exponents",
    slugs: ["Algebra"] as const,
    primary: "algebra" as const,
  },
  {
    label: "Arithmetic",
    icon: Calculator,
    blurb: "Integers, fractions, percent",
    slugs: ["Arithmetic"] as const,
    primary: "arithmetic" as const,
  },
  {
    label: "Geometry",
    icon: Ruler,
    blurb: "Angles, area, volume",
    slugs: ["Geometry"] as const,
    primary: "geometry" as const,
  },
  {
    label: "Data & Probability",
    icon: BarChart3,
    blurb: "Tables, graphs, chance",
    // combine two backend buckets for the badge
    slugs: ["Statistics", "Probability"] as const,
    // choose one slug to open by default (you can swap to "probability")
    primary: "statistics" as const,
  },
  {
    label: "Word Problems",
    icon: BookOpen,
    blurb: "Translate & solve",
    // if you later add a real 'word_problems' bucket, update this:
    slugs: [
      "Arithmetic",
      "Algebra",
      "Geometry",
      "Statistics",
      "Probability",
    ] as const,
    // pick a sensible default for now (or change to a dedicated slug later)
    primary: "arithmetic" as const,
  },
] as const;

export default function CategoryGrid() {
  const router = useRouter();
  const [counts, setCounts] = React.useState<Counts | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // NEW: per-card desired count (string so empty = “all”)
  const [desired, setDesired] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    let ignore = false;
    fetch("/api/category-counts")
      .then((r) => r.json())
      .then((j) => !ignore && setCounts(j?.counts ?? {}))
      .catch(() => !ignore && setError("Could not load counts."));
    return () => {
      ignore = true;
    };
  }, []);

  // helpers
  const sum = (slugs: readonly string[]) =>
    (counts && slugs.reduce((acc, s) => acc + (counts[s] ?? 0), 0)) ?? null;

  const sanitizeCount = (val: string, total: number) => {
    // empty means “all”
    if (!val.trim()) return total;
    const n = Number(val);
    if (!Number.isFinite(n)) return total;
    return Math.max(1, Math.min(total, Math.floor(n)));
  };

  const buildHref = (primarySlug: string, total: number, inputVal: string) => {
    const finalCount = sanitizeCount(inputVal, total);
    const qs = new URLSearchParams({
      mode: "topic",
      category: primarySlug,
      count: String(finalCount),
    });
    return `/practice?${qs.toString()}`;
  };

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Practice by Category
          </h2>
          <p className="text-sm text-muted-foreground">
            Target weaknesses with focused drills.
          </p>
        </div>
        <SignedOut>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Sign in to save progress</span>
          </div>
        </SignedOut>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_DEFS.map(({ label, slugs, icon: Icon, blurb }) => {
          const primary = slugs[0];
          const total = sum(slugs);
          const inputVal = desired[primary] ?? "";

          const href =
            total && total > 0 ? buildHref(primary, total, inputVal) : "#";

          const badgeText = counts == null ? "…" : `${total ?? 0} Qs`;

          return (
            <Card key={label} className="transition hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {label}
                </CardTitle>
                <Badge variant="secondary" className="font-normal">
                  {badgeText}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{blurb}</p>

                {/* NEW: # of questions input */}
                <div className="grid gap-1.5">
                  <label className="text-xs text-neutral-600">
                    Number of questions
                  </label>
                  <input
                    type="number"
                    min={1}
                    // max shown if we know it; not strictly required
                    max={Math.max(1, total ?? 1)}
                    value={inputVal}
                    onChange={(e) =>
                      setDesired((s) => ({ ...s, [primary]: e.target.value }))
                    }
                    placeholder={total != null ? `All (${total})` : "All"}
                    className="w-36 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                  <p className="text-[11px] text-neutral-500">
                    Leave blank to use all available questions.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <SignedIn>
                  <Button
                    size="sm"
                    disabled={!total}
                    onClick={() => {
                      if (!total) return;
                      router.push(href);
                    }}
                  >
                    Start
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!total}
                    onClick={() => {
                      if (!total) return;
                      const u = new URL(href, window.location.origin);
                      u.searchParams.set("difficulty", "adaptive");
                      router.push(u.pathname + u.search);
                    }}
                  >
                    Adaptive
                  </Button>
                </SignedIn>

                <SignedOut>
                  {/* pass the computed redirect so count is preserved after sign-in */}
                  <SignInButton mode="modal" redirectUrl={href}>
                    <Button size="sm" disabled={!total}>
                      Start
                    </Button>
                  </SignInButton>
                  <SignInButton
                    mode="modal"
                    redirectUrl={`${href}&difficulty=adaptive`}
                  >
                    <Button size="sm" variant="outline" disabled={!total}>
                      Adaptive
                    </Button>
                  </SignInButton>
                </SignedOut>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </section>
  );
}
