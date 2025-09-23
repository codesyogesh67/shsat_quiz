import fs from "fs";
import path from "path";
import { normalizeOne } from "./normalize";
import type { RawQuestion } from "@/types";

const DATA_DIR = path.resolve(process.cwd(), "src", "lib", "database");
const OUT_DIR = path.resolve(process.cwd(), ".tmp");
const PREVIEW_FILE = path.join(OUT_DIR, "import-preview.json");

// same matcher as before
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

type FilePreview = {
  file: string;
  valid: number;
  invalid: number;
};

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = listJsonFiles(DATA_DIR);
  if (files.length === 0) {
    console.log(`No files like sample_*.json found in ${DATA_DIR}`);
    process.exit(1);
  }

  const allRecords: any[] = [];
  const perFile: FilePreview[] = [];
  const seenIds = new Set<string>(); // early dedupe across files

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const arr = JSON.parse(raw) as RawQuestion[];

    let valid = 0;
    let invalid = 0;

    for (const item of arr) {
      const norm = normalizeOne(item);
      if (!norm) {
        invalid++;
        continue;
      }
      if (seenIds.has(norm.id)) {
        // duplicate across files -> skip here, DB has PK anyway
        continue;
      }
      seenIds.add(norm.id);
      allRecords.push(norm);
      valid++;
    }

    perFile.push({
      file: path.basename(file),
      valid,
      invalid,
    });
  }

  // for the preview, we store: counts, first 3 samples, and everything in a separate array
  const preview = {
    totalPrepared: allRecords.length,
    files: perFile,
    sample: allRecords.slice(0, 3), // small peek
  };

  fs.writeFileSync(PREVIEW_FILE, JSON.stringify(preview, null, 2), "utf8");

  console.log(
    `Prepared ${allRecords.length} records. File-by-file summary:\n` +
      perFile
        .map((f) => `• ${f.file}: ${f.valid} valid, ${f.invalid} invalid`)
        .join("\n")
  );
  console.log(
    `\nWrote preview → ${path.relative(process.cwd(), PREVIEW_FILE)}`
  );
  console.log(`(Next step will actually insert in batches with createMany.)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
