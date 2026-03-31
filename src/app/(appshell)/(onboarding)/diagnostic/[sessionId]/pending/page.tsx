import PendingResultsRedirect from "@/components/session/PendingResultsRedirect";

export default async function DiagnosticPendingPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <PendingResultsRedirect
      title="Preparing your diagnostic report"
      message="We’re organizing your category performance and study recommendations."
      target={`/diagnostic/${sessionId}/results`}
    />
  );
}
