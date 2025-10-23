import type { Question, QuestionType, Choice, Media } from "@/types";
import { fetchJsonSafe } from "@/lib/fetchJsonSafe";

type ExamMeta = { label?: string; minutes?: number };
type ExamPayload = { meta?: ExamMeta; questions: Question[] };

function gcd(a: number, b: number): number {
  if (!b) return Math.abs(a);
  return gcd(b, a % b);
}

// --- Helpers (grid-in numeric compare)
function parseToNumber(value: string): number | null {
  const v = value.trim().replace(/\s+/g, "");
  if (!v) return null;
  if (/^-?\d+\/-?\d+$/.test(v)) {
    const [nStr, dStr] = v.split("/");
    const n = parseInt(nStr, 10);
    const d = parseInt(dStr, 10);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
    return n / d;
  }
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

function isGridCorrect(input: string, answer: string): boolean {
  const a = parseToNumber(input);
  const b = parseToNumber(answer);
  if (a === null || b === null) return false;
  return Math.abs(a - b) < 1e-9;
}

// --- Random pick or first N
function pickQuestions(
  bank: Question[],
  count: number,
  randomize: boolean
): Question[] {
  const n = Math.max(1, Math.min(count, bank.length));
  if (!randomize) return bank.slice(0, n);
  const arr = bank.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n).map((q, idx) => ({ ...q, index: idx + 1 }));
}

function normalizeQuestionType(t: unknown): QuestionType {
  if (typeof t !== "string") throw new Error("Invalid QuestionType");
  const v = t
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (v === "MULTIPLE_CHOICE") return "MULTIPLE_CHOICE";
  if (v === "FREE_RESPONSE" || v === "FR") return "FREE_RESPONSE";
  throw new Error(`Unknown QuestionType: ${t}`);
}

function safeParseJSON(x: unknown): unknown {
  if (typeof x !== "string") return x;
  try {
    return JSON.parse(x);
  } catch {
    return undefined;
  }
}

function coerceChoices(x: unknown): Choice[] | undefined {
  const v = safeParseJSON(x);
  if (!Array.isArray(v)) return undefined;
  return v.every(
    (c) =>
      c &&
      typeof c === "object" &&
      typeof c.key === "string" &&
      typeof c.text === "string"
  )
    ? (v as Choice[])
    : undefined;
}

const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null;

function isMedia(v: unknown): v is Media {
  if (!isObject(v)) return false;
  if (!("type" in v)) return false;
  const t = (v as { type?: unknown }).type;
  return t === "image" || t === "graph";
}

function coerceMedia(x: unknown): Media | undefined {
  const v = safeParseJSON(x); // returns unknown
  return isMedia(v) ? v : undefined; // ✅ no any needed
}

async function startExamByKey(
  examKey: string,
  setQuestions: (q: Question[]) => void,
  setAnswers: (a: Record<string, string>) => void,
  setCount: (c: number) => void,
  setMinutes: (m: number) => void,
  setPresetLabel: (l: string | null) => void,
  setMode: (m: "CONFIG" | "TEST" | "RESULTS") => void,
  setTimeRunning: (r: boolean) => void,
  setCurrentExamKey: (k: string | null) => void
) {
  try {
    const data = await fetchJsonSafe<ExamPayload>(
      `/api/questions?exam=${examKey}`
    );
    if (!data?.questions?.length) throw new Error("No questions returned.");

    const minutes = Math.max(1, Math.round(data.meta?.minutes ?? 90));
    setQuestions(data.questions);
    setAnswers({});
    setCount(data.questions.length);
    setMinutes(minutes);
    setPresetLabel(
      data.meta?.label ?? examKey.replace(/_/g, " ").toUpperCase()
    );
    setMode("TEST");
    setTimeRunning(true);
    setCurrentExamKey(examKey);
  } catch (err) {
    console.error("startExamByKey error:", err);
    alert(
      `Could not start exam: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

export {
  gcd,
  parseToNumber,
  pickQuestions,
  isGridCorrect,
  normalizeQuestionType,
  coerceChoices,
  coerceMedia,
  startExamByKey,
};
