// scripts/import/apply-answers.ts
import "dotenv/config";
import fs from "fs";
import path from "path";
import { execSync } from "node:child_process";

/** ---------- Config ---------- **/
const CANDIDATE_DIRS = [
  path.resolve(process.cwd(), "src", "lib", "database"),
  path.resolve(process.cwd(), "lib", "database"),
];
const DATA_DIR = CANDIDATE_DIRS.find((p) => fs.existsSync(p));
const DB_URL = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const OVERWRITE =
  (process.env.OVERWRITE_ANSWERS ?? "false").toLowerCase() === "true";

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

type PgColumnRow = { column_name: string };

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

type AnswerEntry = { index: number; answer: string | number };
function parseAnswersJson(raw: string): AnswerEntry[] {
  const data = JSON.parse(raw);
  if (Array.isArray(data)) return data.filter(isAnswerEntry);
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as any).answers)
  ) {
    return (data as any).answers.filter(isAnswerEntry);
  }
  return [];
}
function isAnswerEntry(x: any): x is AnswerEntry {
  return (
    x &&
    typeof x.index === "number" &&
    (typeof x.answer === "string" || typeof x.answer === "number")
  );
}

/** Map examKey -> answers filename */
function answersFilenameForExamKey(examKey: string): string | null {
  const m = /^shsat_(\d{4})(?:_(\w+))?$/i.exec(examKey);
  if (!m) return null;
  const year = m[1];
  const suffix = m[2] ? `_${m[2]}` : "";
  return `answers_${year}${suffix}.json`;
}

async function readAnswersForExam(
  examKey: string
): Promise<Map<number, string>> {
  const answersDir = path.join(DATA_DIR!, "answers");
  const fileName = answersFilenameForExamKey(examKey);
  const candidates = fileName
    ? [path.join(answersDir, fileName), path.join(DATA_DIR!, fileName)]
    : [];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf8");
      const entries = parseAnswersJson(raw);
      const map = new Map<number, string>();
      for (const { index, answer } of entries) map.set(index, String(answer));
      return map;
    }
  }
  return new Map();
}

async function getPrisma() {
  ensureClientGenerated();
  const mod = await import("@prisma/client");
  const { PrismaClient } = mod as any;
  return new PrismaClient({
    datasources: { db: { url: DB_URL } },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

async function detectExamKeys(prisma: any): Promise<string[]> {
  // Prefer examKey column if it exists; else infer from id prefix before ':'
  const cols = (
    await prisma.$queryRaw<PgColumnRow[]>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema='public' AND (table_name='Question' OR table_name='question');
  `
  ).map((r: { column_name: string }) => String(r.column_name).toLowerCase());

  if (cols.includes("examkey")) {
    const rows = await prisma.question.groupBy({
      by: ["examKey"],
      where: { examKey: { not: null } },
      _count: { _all: true },
    });
    return rows
      .map((r: { examKey: string }) => r.examKey as string)
      .filter(Boolean)
      .sort();
  } else {
    // namespaced id pattern "examKey:externalId"
    const rows = await prisma.$queryRaw<{ ek: string }[]>`
      SELECT DISTINCT split_part(id, ':', 1) AS ek FROM "Question"
    `;
    return rows
      .map((r: { ek: string }) => r.ek)
      .filter(Boolean)
      .sort();
  }
}

async function applyAnswersForExam(prisma: any, examKey: string) {
  const answers = await readAnswersForExam(examKey);
  if (answers.size === 0) {
    console.warn(`• ${examKey}: no answers file found (skipping)`);
    return { examKey, matched: 0, updated: 0, skipped: 0 };
  }

  // Fetch questions for this exam
  const where: any = {
    OR: [
      // using column if it exists
      { examKey },
      // fallback via namespaced id prefix
      { id: { startsWith: `${examKey}:` } },
    ],
  };

  const rows: Array<{
    id: string;
    index: number;
    answer: string | null;
  }> = await prisma.question.findMany({
    where,
    select: { id: true, index: true, answer: true },
  });

  let updated = 0;
  let skipped = 0;
  let matched = 0;

  // Per-row updates (57-ish rows — fine)
  for (const row of rows) {
    const ans = answers.get(row.index);
    if (!ans) {
      continue;
    }
    matched++;
    const has = row.answer && row.answer.trim() !== "";
    if (has && !OVERWRITE) {
      skipped++;
      continue;
    }

    await prisma.question.update({
      where: { id: row.id },
      data: { answer: ans },
    });
    updated++;
  }

  console.log(
    `• ${examKey}: matched ${matched}, updated ${updated}, skipped ${skipped}`
  );
  return { examKey, matched, updated, skipped };
}

async function main() {
  console.log("Using data directory:", DATA_DIR);
  console.log("Overwrite existing answers:", OVERWRITE);
  const prisma = await getPrisma();
  await prisma.$connect();

  const examKeys = await detectExamKeys(prisma);
  if (examKeys.length === 0) {
    console.log("No exam keys detected in DB. Nothing to do.");
    await prisma.$disconnect();
    return;
  }

  let totalMatched = 0,
    totalUpdated = 0,
    totalSkipped = 0;
  for (const ek of examKeys) {
    const r = await applyAnswersForExam(prisma, ek);
    totalMatched += r.matched;
    totalUpdated += r.updated;
    totalSkipped += r.skipped;
  }

  await prisma.$disconnect();
  console.log(
    `\nDone. Matched ${totalMatched}, updated ${totalUpdated}, skipped ${totalSkipped}.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
