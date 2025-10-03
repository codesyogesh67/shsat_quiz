// app/practice/page.tsx
import PracticeShell from "@/components/practice/PracticeShell";
import { headers } from "next/headers";

// Types matching your Question shape in PracticeShell
type Choice = { key: string; text: string };
type Media = { type: "image"; url: string; alt?: string } | null;
type Question = {
  id: string;
  index?: number;
  type: "MULTIPLE_CHOICE" | "FREE_RESPONSE";
  category?: string | null;
  stem: string;
  media?: Media;
  choices?: Choice[];
  answer?: string;
};

type ExamMeta = { label?: string; minutes?: number };
type ExamPayload = { meta?: ExamMeta; questions: Question[] };

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const mode = (searchParams.mode as string) ?? "diagnostic";
  const count = Number(searchParams.count ?? 20);

  // --- NEW: server-side preload if exam/preset/custom present ---
  const exam =
    typeof searchParams.exam === "string" ? searchParams.exam : undefined;
  const preset =
    typeof searchParams.preset === "string" ? searchParams.preset : undefined;
  const customCount =
    typeof searchParams.count === "string"
      ? Number(searchParams.count)
      : undefined;
  const category =
    typeof searchParams.category === "string"
      ? searchParams.category
      : undefined;
  const randomize =
    typeof searchParams.randomize === "string"
      ? searchParams.randomize !== "false"
      : true;

  let initialData: {
    mode: "TEST";
    questions: Question[];
    minutes: number;
    presetLabel: string | null;
    currentExamKey: string | null;
  } | null = null;

  // Build absolute URL to call your own API from RSC
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = `${proto}://${host}`;

  if (exam) {
    const res = await fetch(
      `${base}/api/questions?exam=${encodeURIComponent(exam)}`,
      {
        cache: "no-store",
      }
    );
    if (res.ok) {
      const data = (await res.json()) as ExamPayload;
      initialData = {
        mode: "TEST",
        questions: data?.questions ?? [],
        minutes: Math.max(1, Math.round(data?.meta?.minutes ?? 90)),
        presetLabel: data?.meta?.label ?? exam.replace(/_/g, " ").toUpperCase(),
        currentExamKey: exam,
      };
    }
  } else if (preset === "shsat57") {
    const res = await fetch(`${base}/api/questions?preset=shsat57`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { questions: Question[] };
      initialData = {
        mode: "TEST",
        questions: data?.questions ?? [],
        minutes: 90,
        presetLabel: "SHSAT Math Exam — 57 Questions • 90 min",
        currentExamKey: null,
      };
    }
  } else if (customCount) {
    // Optional: server-preload custom too, to avoid any flash
    const qs = new URLSearchParams({
      count: String(Math.max(1, customCount)),
      randomize: String(!!randomize),
    });
    if (category && category !== "all") qs.set("category", category);
    const res = await fetch(`${base}/api/questions?${qs.toString()}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { questions: Question[] };
      initialData = {
        mode: "TEST",
        questions: data?.questions ?? [],
        minutes: Number(searchParams.minutes ?? 15) || 15,
        presetLabel: null,
        currentExamKey: null,
      };
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 md:px-10 lg:px-20 xl:px-28 py-6">
      <PracticeShell
        initialMode={mode}
        initialCount={count}
        // NEW:
        initialData={initialData}
      />
    </div>
  );
}
