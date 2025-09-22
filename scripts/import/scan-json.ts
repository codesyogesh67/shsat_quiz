import fs from "fs";
import path from "path";

// Where your files live (adjust if needed)
const DATA_DIR = path.resolve(process.cwd(), "src", "lib", "database");

// Match sample_1.json, sample_2.json, etc.
function listJsonFiles(dir: string): string[] {
  const SHSAT_RE = /^shsat_(\d{4})(?:_([A-Za-z]))?\.json$/i;
  const SAMPLE_RE = /^sample_(\d+)\.json$/i;

  const all = fs.readdirSync(dir);

  const shsat = all
    .filter((f) => SHSAT_RE.test(f))
    .map((f) => {
      const m = f.match(SHSAT_RE)!;
      return {
        file: path.join(dir, f),
        sortKey: `y${m[1].padStart(4, "0")}-${
          (m[2] ?? "").toUpperCase() || "_"
        }`, // year + suffix
      };
    });

  const sample = all
    .filter((f) => SAMPLE_RE.test(f))
    .map((f) => {
      const n = Number(f.match(SAMPLE_RE)![1]);
      return {
        file: path.join(dir, f),
        sortKey: `s${String(n).padStart(6, "0")}`,
      };
    });

  return [...shsat, ...sample]
    .sort((a, b) =>
      a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0
    )
    .map((x) => x.file);
}

type RawQuestion = {
  id: string;
  index: number;
  type: string;
  category?: string;
  stem: string;
  answer: string;
  choices?: unknown;
  media?: unknown;
};

// quick, lightweight validator (no zod yet)
function isQuestion(x: any): x is RawQuestion {
  return (
    x &&
    typeof x.id === "string" &&
    typeof x.index === "number" &&
    typeof x.type === "string" &&
    typeof x.stem === "string" &&
    typeof x.answer === "string"
  );
}

async function main() {
  const files = listJsonFiles(DATA_DIR);
  if (files.length === 0) {
    console.log(`No files like sample_*.json found in ${DATA_DIR}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} file(s):`);
  files.forEach((f, i) => console.log(`  ${i + 1}. ${path.basename(f)}`));

  let total = 0;
  let bad = 0;

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error(
        `✖ JSON parse error in ${path.basename(file)}:`,
        (e as Error).message
      );
      continue;
    }

    if (!Array.isArray(parsed)) {
      console.error(
        `✖ Expected array in ${path.basename(file)}, got ${typeof parsed}`
      );
      continue;
    }

    let validCount = 0;
    let invalidCount = 0;

    for (const item of parsed) {
      if (isQuestion(item)) validCount++;
      else invalidCount++;
    }

    total += validCount;
    bad += invalidCount;

    console.log(
      `• ${path.basename(file)} → ${validCount} valid, ${invalidCount} invalid`
    );
  }

  console.log(
    `\nSummary: ${total} valid questions, ${bad} invalid across ${files.length} file(s).`
  );
  if (bad > 0) {
    console.log(
      "Tip: Invalid rows are missing one of: id (string), index (number), type (string), stem (string), answer (string)."
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
