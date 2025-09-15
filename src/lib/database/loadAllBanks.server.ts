// src/lib/database/loadAllBanks.server.ts
import "server-only";

import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { fileURLToPath } from "url"; // <-- add
import type { RawQuestion, Question } from "@/types";

type AnswerEntry = { index: number; answer: string };

function answersFilenameForExamKey(examKey: string) {
  const m = /^shsat_(\d{4})(?:_(\w+))?$/i.exec(examKey);
  if (!m) return null;
  const year = m[1];
  const suffix = m[2] ? `_${m[2]}` : "";
  return `answers_${year}${suffix}.json`;
}

/** Load answers JSON for an exam key and return a map { index -> answer } */
export async function loadAnswersForExam(
  examKey: string,
  dir?: string
): Promise<Record<number, string>> {
  const base = dir ?? resolveDatabaseDir();
  const fileBase = path.join(base, "answers"); // lib/database/answers

  const fileName = answersFilenameForExamKey(examKey);
  if (!fileName) return {};

  const candidates = [
    path.join(fileBase, fileName),
    path.join(base, fileName), // fallback if not in /answers subfolder
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        const raw = await fsp.readFile(p, "utf8");
        const parsed = JSON.parse(raw) as AnswerEntry[] | Record<string, any>;
        // Support either an array [{index, answer}] or { answers: [...] }
        const arr: AnswerEntry[] = Array.isArray(parsed)
          ? parsed
          : Array.isArray((parsed as any).answers)
          ? (parsed as any).answers
          : [];
        const map: Record<number, string> = {};
        for (const row of arr) {
          if (
            row &&
            typeof row.index === "number" &&
            (typeof row.answer === "string" || typeof row.answer === "number")
          ) {
            map[row.index] = String(row.answer);
          }
        }
        return map;
      }
    } catch (e) {
      console.warn("Skipping invalid answers file:", p, e);
    }
  }
  return {};
}

export function resolveDatabaseDir(): string {
  // 1) Prefer the folder where THIS module lives (your JSONs are here)
  const byModule = path.dirname(fileURLToPath(import.meta.url));
  try {
    if (
      fs.existsSync(byModule) &&
      fs.statSync(byModule).isDirectory() &&
      fs.readdirSync(byModule).some((f) => f.endsWith(".json"))
    ) {
      return byModule;
    }
  } catch {}

  // 2) Fall back to CWD-based guesses (useful locally)
  const cwd = process.cwd();
  const candidates = [
    process.env.DATABASE_DIR, // optional override
    path.join(cwd, "src", "lib", "database"),
    path.join(cwd, "lib", "database"),
    path.join(cwd, "app", "lib", "database"),
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
    } catch {}
  }

  throw new Error(
    `Database dir not found. Tried (module & cwd):\n${byModule}\n${candidates.join(
      "\n"
    )}`
  );
}

export async function loadAllQuestionsFromDir(
  dir?: string
): Promise<RawQuestion[]> {
  const base = dir ?? resolveDatabaseDir();
  const entries = await fsp.readdir(base, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith(".json"))
    .map((e) => path.join(base, e.name));

  const seen = new Set<string>();
  const out: RawQuestion[] = [];

  for (const file of files) {
    try {
      const raw = await fsp.readFile(file, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const q of parsed as Question[]) {
          if (
            q &&
            typeof q.id === "string" &&
            typeof q.type === "string" &&
            typeof q.stem === "string" &&
            typeof q.answer === "string" &&
            !seen.has(q.id)
          ) {
            out.push({ ...q });
            seen.add(q.id);
          }
        }
      }
    } catch (e) {
      console.warn("Skipping invalid JSON:", file, e);
    }
  }

  return out;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function pickFromAllBanks(count: number, randomize = true) {
  const all = await loadAllQuestionsFromDir();
  if (all.length === 0) return [];
  const n = Math.max(1, Math.min(count, all.length));
  const base = randomize ? shuffle(all) : all.slice();
  return base.slice(0, n).map((q, i) => ({ ...q, index: i + 1 }));
}

/** Load exactly one exam file by key (e.g., "shsat_2018") and normalize shape. */
export async function loadExamByKey(
  examKey: string,
  dir?: string
): Promise<{ meta?: Record<string, any>; questions: Question[] }> {
  const dbBase = dir ?? resolveDatabaseDir();

  // Prefer a subfolder "exams" if you organize them there; otherwise fall back to dbBase.
  const candidates = [
    path.join(dbBase, "exams", `${examKey}.json`),
    path.join(dbBase, `${examKey}.json`),
  ];

  let filePath: string | null = null;
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }
  // 🔥 fallback to shsat_2018.json if not found
  if (!filePath) {
    console.warn(
      `Exam file not found for "${examKey}". Falling back to shsat_2018.json`
    );
    const fallback = [
      path.join(dbBase, "exams", `shsat_2018.json`),
      path.join(dbBase, `shsat_2018.json`),
    ];
    for (const p of fallback) {
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }
  }

  if (!filePath) {
    throw new Error(
      `Neither exam "${examKey}" nor fallback "shsat_2018" found. Looked in:\n${candidates.join(
        "\n"
      )}`
    );
  }

  const raw = await fsp.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  // Support both shapes:
  // 1) { meta, questions: Question[] }
  // 2) Question[] (legacy)
  const questions: Question[] = Array.isArray(parsed)
    ? parsed
    : parsed?.questions ?? [];
  const meta = Array.isArray(parsed) ? undefined : parsed?.meta;

  // Re-index for UI
  const withIndex = questions.map((q, i) => ({ ...q, index: i + 1 }));

  // 🔗 NEW: load answers and merge into each question by index
  const answersByIndex = await loadAnswersForExam(examKey, dbBase);
  const merged: Question[] = withIndex.map((q) => {
    const ans = answersByIndex[q.index];
    // only fill if empty; if your JSON already has answer values, we won't overwrite them
    return ans && (q.answer == null || q.answer === "")
      ? { ...q, answer: ans }
      : q;
  });

  return { meta, questions: merged };
}
