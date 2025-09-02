import type { Question } from "@/types";
import { useMemo } from "react";

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

export { gcd, parseToNumber, pickQuestions, isGridCorrect };
