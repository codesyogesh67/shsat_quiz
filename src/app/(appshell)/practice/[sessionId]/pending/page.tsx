import PendingResultsRedirect from "@/components/session/PendingResultsRedirect";

export default async function PracticePendingPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <PendingResultsRedirect
      title="Preparing your results"
      message="We’re building your performance summary, strengths, and next-step recommendations."
      target={`/practice/${sessionId}/results`}
    />
  );
}
