// src/lib/database/loadAllBanks.server.ts
import "server-only";

import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { fileURLToPath } from "url"; // <-- add
import type { RawQuestion, Question } from "@/types";

function resolveDatabaseDir(): string {
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
  return out;
}
