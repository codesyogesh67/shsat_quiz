// src/lib/exams-client.ts
export type StartResponse = {
  sessionId: string;
  questionIds: string[];
  minutes: number;
  startedAt: string;
};

export async function startExam(examKey?: string) {
  const r = await fetch("/api/exams/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examKey }),
  });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as StartResponse;
}

export async function saveAnswer(
  sessionId: string,
  payload: {
    questionId: string;
    answer?: string | null;
    flagged?: boolean;
    timeSpentDeltaSec?: number;
  }
) {
  const r = await fetch(`/api/exams/${sessionId}/answer`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function submitExam(sessionId: string) {
  const r = await fetch(`/api/exams/${sessionId}/submit`, { method: "POST" });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function getActive() {
  const r = await fetch("/api/exams/active", { cache: "no-store" });
  if (r.status === 204) return null;
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}
