// app/(onboarding)/diagnostic/results/[sessionId]/parent/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function DiagnosticParentResultsPage({
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
      scoreCorrect: true,
      scoreTotal: true,
      minutes: true,
    },
  });

  if (!session || session.mode !== "DIAGNOSTIC") return notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Parent Summary</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Clear, calm summary of where the student is strong, where to focus next,
        and what it means.
      </p>

      <div className="mt-6 rounded-lg border p-4">
        <div className="text-sm text-muted-foreground">Diagnostic score</div>
        <div className="mt-1 text-3xl font-semibold">
          {session.scoreCorrect} / {session.scoreTotal}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Time limit: {session.minutes ?? 90} minutes
        </div>
      </div>

      <div className="mt-6 rounded-lg border p-4 text-sm">
        Next: we’ll generate “Week 1 focus” automatically based on category
        accuracy + pacing.
      </div>
    </div>
  );
}
