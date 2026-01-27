import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

type Row = {
  id: string;
  category:
    | "Arithmetic"
    | "Algebra"
    | "Geometry"
    | "Probability and Statistics";
};

async function main() {
  // EITHER: read from JSON file
  const rows: Row[] = JSON.parse(
    fs.readFileSync("data/categoryUpdates.json", "utf8")
  );

  // OR: inline (uncomment to use inline mapping)
  // const rows: Row[] = [
  //   { id: "shsat_2018:Q58", category: "Geometry" },
  //   { id: "shsat_2018:Q59", category: "Arithmetic" },
  //   // ...
  // ];

  // Safety check: ensure all ids have the prefix
  const bad = rows.filter((r) => !r.id.startsWith("shsat_2018:"));
  if (bad.length) {
    console.error(
      "These ids don't start with shsat_2018:",
      bad.map((b) => b.id)
    );
    process.exit(1);
  }

  // Run in a single transaction for atomicity
  await prisma.$transaction(
    rows.map((r) =>
      prisma.question.update({
        where: { id: r.id },
        data: { category: r.category },
      })
    )
  );

  console.log(`Updated ${rows.length} rows.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
