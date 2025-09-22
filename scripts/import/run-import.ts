// scripts/import/run-import.ts
import "dotenv/config";
import fs from "fs";
import path from "path";
import { execSync } from "node:child_process";

/** ---------------- Config ---------------- **/
const CANDIDATE_DIRS = [
  path.resolve(process.cwd(), "src", "lib", "database"),
  path.resolve(process.cwd(), "lib", "database"),
];
const DATA_DIR = CANDIDATE_DIRS.find((p) => fs.existsSync(p));
const DB_URL = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const BATCH_SIZE = Number(process.env.BATCH_SIZE ?? 500);

/** ---------------- Guards ---------------- **/
if (!DATA_DIR) {
  console.error(
    "❌ Could not find data directory. Checked:\n" +
      CANDIDATE_DIRS.map((p) => "  - " + p).join("\n")
  );
  process.exit(1);
}
if (!DB_URL) {
  console.error("❌ Missing DIRECT_URL or DATABASE_URL in .env");
  process.exit(1);
}

console.log("Using data directory:", DATA_DIR);
console.log("DB_URL present:", !!DB_URL);

/** Ensure Prisma Client is generated BEFORE importing it */
function ensureClientGenerated() {
  const generatedIdx = path.join(
    process.cwd(),
    "node_modules",
    ".prisma",
    "client",
    "index.js"
  );
  if (!fs.existsSync(generatedIdx)) {
    console.warn(
      "ℹ️  Prisma Client not generated. Running `npx prisma generate` …"
    );
    execSync("npx prisma generate", { stdio: "inherit" });
  }
}

/** Lazy-load Prisma Client without top-level await */
async function getPrismaClient() {
  ensureClientGenerated();
  const mod = await import("@prisma/client");
  const { PrismaClient } = mod as any;
  return new PrismaClient({
    datasources: { db: { url: DB_URL } },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

/** ---------------- Helpers ---------------- **/

/** Discover JSON files.
 *  Supports subfolders like:
 *    src/lib/database/
 *      ├─ random_questions/*.json
 *      ├─ shsat_2018/*.json
 *      └─ shsat_2018_B/*.json
 *  If no subfolders, falls back to top-level files and infers examKey from filename (shsat_YYYY(_X)?.json) or "default".
 */
type FileWithExam = { file: string; examKey: string };

function listJsonFilesWithExam(dir: string): FileWithExam[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out: FileWithExam[] = [];

  // Subfolders become examKeys
  for (const e of entries) {
    if (e.isDirectory()) {
      const examKey = e.name; // e.g. "shsat_2018", "shsat_2018_B", "random_questions"
      const folderPath = path.join(dir, e.name);
      for (const f of fs.readdirSync(folderPath)) {
        if (f.toLowerCase().endsWith(".json")) {
          out.push({ file: path.join(folderPath, f), examKey });
        }
      }
    }
  }

  // If there were no subfolders or there are also top-level files, include top-level JSONs too
  const topLevelJsons = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".json"))
    .map((e) => e.name);

  if (topLevelJsons.length > 0) {
    const RE_SHSAT = /^shsat_(\d{4})(?:_([A-Za-z]+))?\.json$/i;
    for (const fname of topLevelJsons) {
      const m = fname.match(RE_SHSAT);
      const examKey = m
        ? `shsat_${m[1]}${m[2] ? `_${m[2].toUpperCase()}` : ""}`
        : "default";
      out.push({ file: path.join(dir, fname), examKey });
    }
  }

  // Stable sort: examKey asc, then filename asc
  out.sort(
    (a, b) =>
      a.examKey.localeCompare(b.examKey) ||
      path.basename(a.file).localeCompare(path.basename(b.file))
  );

  if (out.length === 0) {
    console.error(`❌ No JSON files found under ${dir}`);
  } else {
    console.log(
      "Found files:",
      out.map((x) => `${x.examKey}/${path.basename(x.file)}`).join(", ")
    );
  }
  return out;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Raw input shape (kept minimal to avoid TS path alias issues) */
type RawQuestion = {
  id: string;
  index: number;
  type: string;
  stem: string;
  answer: string;
  category?: string;
  choices?: unknown;
  media?: unknown;
};

/** Normalize + namespacing; add exam metadata only if the table has those columns */
function normalizeOne(
  q: RawQuestion,
  examKey: string,
  hasExamMetadata: boolean
) {
  if (!q || typeof q !== "object") return null;
  if (typeof q.id !== "string") return null;
  if (typeof q.index !== "number") return null;
  if (typeof q.type !== "string") return null;
  if (typeof q.stem !== "string") return null;
  if (typeof q.answer !== "string") return null;

  const cleanJson = (v: unknown) => {
    if (v == null) return undefined;
    if (typeof v === "string") {
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    }
    return v;
  };

  const externalId = q.id; // original JSON id (e.g., "Q58")
  const namespacedId = `${examKey}:${externalId}`; // primary key (unique per exam)

  const base: any = {
    id: namespacedId,
    index: q.index,
    type: q.type.trim(),
    stem: q.stem,
    answer: q.answer,
    category: typeof q.category === "string" ? q.category.trim() : q.category,
    choices: cleanJson(q.choices),
    media: cleanJson(q.media),
  };

  if (hasExamMetadata) {
    base.externalId = externalId;
    base.examKey = examKey;
  }

  return base;
}

/** Import one file */
async function importFile(
  prisma: any,
  file: string,
  examKey: string,
  hasExamMetadata: boolean
) {
  const raw = fs.readFileSync(file, "utf8");
  let arr: unknown;
  try {
    arr = JSON.parse(raw);
  } catch (e) {
    console.error(`✖ JSON parse error in ${path.basename(file)}:`, e.message);
    return { file, inserted: 0, skipped: 0, batches: 0 };
  }
  if (!Array.isArray(arr)) {
    console.error(`✖ Expected array in ${path.basename(file)}`);
    return { file, inserted: 0, skipped: 0, batches: 0 };
  }

  const seen = new Set<string>();
  const prepared: any[] = [];
  for (const item of arr as RawQuestion[]) {
    const norm = normalizeOne(item, examKey, hasExamMetadata);
    if (!norm) continue;
    if (seen.has(norm.id)) continue;
    seen.add(norm.id);
    prepared.push(norm);
  }

  if (prepared.length === 0) {
    console.log(`• ${examKey}/${path.basename(file)} → nothing to insert`);
    return { file, inserted: 0, skipped: 0, batches: 0 };
  }

  let inserted = 0;
  const batches = chunk(prepared, BATCH_SIZE);

  await prisma.$transaction(async (tx: any) => {
    for (const batch of batches) {
      const res = await tx.question.createMany({
        data: batch,
        skipDuplicates: true,
      });
      inserted += res.count;
    }
  });

  const skipped = prepared.length - inserted;
  console.log(
    `• ${examKey}/${path.basename(
      file
    )} → inserted ${inserted}, skipped ${skipped}, batches ${batches.length}`
  );
  return { file, inserted, skipped, batches: batches.length };
}

/** ---------------- Main ---------------- **/
async function main() {
  const files = listJsonFilesWithExam(DATA_DIR!);
  if (files.length === 0) process.exit(1);

  const prisma = await getPrismaClient();
  console.log(
    `Connecting with ${DB_URL?.includes("neon") ? "Neon URL" : "custom URL"} …`
  );
  await prisma.$connect();

  // Detect if Question has examKey/externalId columns
  const cols = (
    await prisma.$queryRaw<any[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (table_name = 'Question' OR table_name = 'question');
  `
  ).map((r) => String(r.column_name).toLowerCase());

  const hasExamMetadata =
    cols.includes("examkey") && cols.includes("externalid");

  if (!hasExamMetadata) {
    console.log(
      "ℹ️  Column(s) examKey/externalId not found on Question — proceeding without them (only namespaced id will be inserted)."
    );
  }

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const { file, examKey } of files) {
    try {
      const r = await importFile(prisma, file, examKey, hasExamMetadata);
      totalInserted += r.inserted;
      totalSkipped += r.skipped;
    } catch (e) {
      console.error(
        `✖ Failed on ${examKey}/${path.basename(file)}:`,
        e.message
      );
    }
  }

  await prisma.$disconnect();
  console.log(
    `\nDone. Inserted ${totalInserted} total, skipped (duplicates) ${totalSkipped}.`
  );
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
