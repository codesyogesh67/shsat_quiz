"use client";

import { useRouter } from "next/navigation";
import SessionResults from "@/components/session/SessionResults";
import type { SessionResultsData } from "@/types/exam";

type Props = {
  sessionId: string;
  results: SessionResultsData;
};

export default function PracticeResultsClient({ sessionId, results }: Props) {
  const router = useRouter();

  return (
    <SessionResults
      title="Practice Session Complete"
      subtitle="Review your performance, revisit mistakes, and continue practicing with focus."
      mode="exam"
      results={results}
      flags={{}}
      onReview={(filter) => {
        router.push(`/practice?reviewSession=${sessionId}&filter=${filter}`);
      }}
      onRetake={() => router.push("/practice")}
      onPickAnother={() => router.push("/practice")}
    />
  );
}
