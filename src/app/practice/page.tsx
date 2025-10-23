// app/practice/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Timer as TimerIcon,
  Shuffle as ShuffleIcon,
  ListChecks,
} from "lucide-react";

import RandomConfigurator from "@/components/practice/RandomConfigurator";

export const dynamic = "force-dynamic";

// ✅ Hardcoded categories
const CATEGORIES = [
  "Algebra",
  "Arithmetic",
  "Geometry",
  "Data & Probability",
  "Word Problems",
];

// (Optional) Show available counts per category to help users choose
async function getCategoryCounts() {
  const results = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const count = await prisma.question.count({ where: { category: cat } });
      return [cat, count] as const;
    })
  );
  return Object.fromEntries(results) as Record<string, number>;
}

export default async function PracticeHubPage() {
  const counts = await getCategoryCounts();

  // Server action for Category Practice
  async function startCategoryPractice(formData: FormData) {
    "use server";

    const category = String(formData.get("category") || "");
    const count = Math.max(1, Number(formData.get("count") || 20));
    const minutes = Math.max(1, Number(formData.get("minutes") || 45));

    // Map Clerk user → local DB user (or guest)
    const { userId: clerkUserId } = await auth();
    const dbUserId = clerkUserId
      ? (
          await prisma.user.findUnique({
            where: { externalAuthId: clerkUserId },
            select: { id: true },
          })
        )?.id ?? null
      : null;

    // Fetch pool by category (randomized)
    const qs = await prisma.question.findMany({
      where: { category },
      select: { id: true },
    });

    const pool = qs.map((q) => q.id).sort(() => Math.random() - 0.5);
    const questionIds = pool.slice(0, Math.min(count, pool.length));

    if (!questionIds.length) {
      redirect("/practice");
    }

    const session = await prisma.session.create({
      data: {
        userId: dbUserId,
        examKey: "custom",
        label: `${category} Practice`,
        mode: "full",
        minutes,
        scoreTotal: questionIds.length,
        questionIds,
      },
    });

    redirect(`/exam/${session.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-10 lg:px-16 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Practice</h1>
        <p className="text-muted-foreground mt-2">
          Choose how you want to practice: a quick randomized set, or focused
          drills by category.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Random (Configurable) */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <ShuffleIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Quick Random</CardTitle>
                <CardDescription>
                  Configure a randomized set and start instantly.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-6">
            <RandomConfigurator />
          </CardContent>

          <CardFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TimerIcon className="h-4 w-4" />
              <span>Timed session</span>
            </div>
          </CardFooter>
        </Card>

        {/* Practice by Category – now embedded here */}
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Practice by Category</CardTitle>
                <CardDescription>
                  Target a topic (Algebra, Geometry, Data & Probability, …).
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <form action={startCategoryPractice}>
            <CardContent className="grid gap-6">
              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Choose a category…" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem
                        key={c}
                        value={c}
                        // Disable if no questions available
                        disabled={(counts[c] ?? 0) === 0}
                      >
                        {c}
                        {(counts[c] ?? 0) > 0
                          ? `  ·  ${counts[c]} Qs`
                          : "  ·  None"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Count & Minutes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="count">Question count</Label>
                  <Input
                    id="count"
                    name="count"
                    type="number"
                    min={1}
                    defaultValue={20}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minutes">Minutes</Label>
                  <Input
                    id="minutes"
                    name="minutes"
                    type="number"
                    min={1}
                    defaultValue={45}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="mt-8 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Pick category, set count & time
              </div>
              <Button type="submit">Start Practice</Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Separator className="my-8" />

      <div className="text-xs text-muted-foreground">
        Tip: Categories with “None” are disabled until you add questions for
        them.
      </div>
    </div>
  );
}
