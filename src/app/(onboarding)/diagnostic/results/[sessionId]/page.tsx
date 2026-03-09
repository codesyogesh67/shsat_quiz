// app/(onboarding)/diagnostic/results/[sessionId]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function DiagnosticResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      mode: true,
      submittedAt: true,
      scoreCorrect: true,
      scoreTotal: true,
      minutes: true,
      attempts: {
        select: {
          questionId: true,
          isCorrect: true,
          timeSpentSec: true,
          question: { select: { category: true } },
        },
      },
    },
  });

  if (!session || session.mode !== "DIAGNOSTIC") return notFound();

  // We'll compute full byCategory + pacing next.
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Diagnostic Results</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This is a starting point — not a grade. We’ll turn this into a weekly
        plan.
      </p>

      <div className="mt-6 rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">Score</div>
        <div className="mt-1 text-3xl font-semibold">
          {session.scoreCorrect} / {session.scoreTotal}
        </div>
      </div>

      <div className="mt-6 rounded-lg border p-4">
        <div className="font-medium">Next</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
          <li>We’ll add strengths/weaknesses by category.</li>
          <li>We’ll add time-per-question and pacing warnings.</li>
          <li>We’ll generate your Week 1 focus plan automatically.</li>
        </ul>
      </div>
    </div>
  );
}
