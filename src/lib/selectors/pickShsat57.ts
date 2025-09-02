import type { Question } from "@/types";

type MixConfig = {
  total: number; // total per set
  gridIns: number; // exact number of grid-ins
  algebraPctRange: [number, number]; // 40–45%
  geometryPctRange: [number, number]; // 30–35%
  statsPctRange: [number, number]; // 15–20%
  strictGridIns?: boolean; // throw if not enough grid-ins available
};

const DEFAULT_CFG: MixConfig = {
  total: 57,
  gridIns: 5,
  algebraPctRange: [0.4, 0.45],
  geometryPctRange: [0.3, 0.35],
  statsPctRange: [0.15, 0.2],
  strictGridIns: false,
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/** Map your fine-grained categories into buckets. */
function bucketOf(q: Question): "algebra" | "geometry" | "statsprob" | "other" {
  const c = (q.category ?? "").toLowerCase();

  // Algebra / Proportional reasoning
  if (
    c.includes("algebra") ||
    c.includes("ratio") ||
    c.includes("ratios") ||
    c.includes("rate") ||
    c.includes("rates") ||
    c.includes("percent") ||
    c.includes("percents") ||
    c.includes("proportion") ||
    c.includes("proportional") ||
    c.includes("order of operations") ||
    c.includes("simplifying") ||
    c.includes("expressions") ||
    c.includes("equations") ||
    c.includes("inequalities") ||
    c.includes("number line") ||
    c.includes("absolute value")
  )
    return "algebra";

  // Geometry (incl. volume/surface area)
  if (c.includes("geometry") || c.includes("volume") || c.includes("surface"))
    return "geometry";

  // Statistics / Probability / Combinatorics
  if (
    c.includes("statistics") ||
    c.includes("mmmr") ||
    c.includes("probability") ||
    c.includes("combination") ||
    c.includes("combinations")
  )
    return "statsprob";

  return "other";
}

function pickN<T>(pool: T[], n: number): { picked: T[]; rest: T[] } {
  const s = shuffle(pool);
  return { picked: s.slice(0, n), rest: s.slice(n) };
}

export function pickShsat57(
  all: Question[],
  cfg: Partial<MixConfig> = {}
): Question[] {
  const C = { ...DEFAULT_CFG, ...cfg };

  // Deduplicate by id
  const seen = new Set<string>();
  const bank = all.filter((q) => {
    if (!q?.id || seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });

  // Pools by type
  const gridPool = bank.filter((q) => q.type === "GRID_IN");
  const mcPool = bank.filter((q) => q.type === "MULTIPLE_CHOICE");

  if (gridPool.length < C.gridIns && C.strictGridIns) {
    throw new Error(
      `Need ${C.gridIns} grid-ins but only found ${gridPool.length}.`
    );
  }
  const gridTarget = Math.min(C.gridIns, gridPool.length);
  const totalLeftAfterGrids = C.total - gridTarget;

  // Draw targets (random within ranges for variety)
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  let algebraTarget = clamp(
    Math.round(rnd(...C.algebraPctRange) * C.total),
    0,
    C.total
  );
  let geometryTarget = clamp(
    Math.round(rnd(...C.geometryPctRange) * C.total),
    0,
    C.total
  );
  let statsTarget = clamp(
    Math.round(rnd(...C.statsPctRange) * C.total),
    0,
    C.total
  );

  // If targets exceed total, scale them down proportionally
  let sumTargets = algebraTarget + geometryTarget + statsTarget;
  if (sumTargets > C.total) {
    const scale = C.total / sumTargets;
    algebraTarget = Math.floor(algebraTarget * scale);
    geometryTarget = Math.floor(geometryTarget * scale);
    statsTarget = Math.floor(statsTarget * scale);
    // Distribute any rounding leftovers
    let leftover = C.total - (algebraTarget + geometryTarget + statsTarget);
    const order: Array<"algebra" | "geometry" | "statsprob"> = [
      "algebra",
      "geometry",
      "statsprob",
    ];
    let i = 0;
    while (leftover > 0) {
      const which = order[i % order.length];
      if (which === "algebra") algebraTarget++;
      if (which === "geometry") geometryTarget++;
      if (which === "statsprob") statsTarget++;
      leftover--;
      i++;
    }
  }

  // Pick GRID-INS first, account for their categories
  const { picked: gridPicked } = pickN(gridPool, gridTarget);
  const gridCountByBucket = {
    algebra: 0,
    geometry: 0,
    statsprob: 0,
    other: 0 as number,
  };
  for (const q of gridPicked) gridCountByBucket[bucketOf(q)]++;

  // Remaining targets after counting grid-ins already placed
  let algebraLeft = Math.max(0, algebraTarget - gridCountByBucket.algebra);
  let geometryLeft = Math.max(0, geometryTarget - gridCountByBucket.geometry);
  let statsLeft = Math.max(0, statsTarget - gridCountByBucket.statsprob);

  // Ensure we don't try to place more MC than we have slots
  let remainingSlots = totalLeftAfterGrids;
  algebraLeft = Math.min(algebraLeft, remainingSlots);
  remainingSlots -= algebraLeft;
  geometryLeft = Math.min(geometryLeft, remainingSlots);
  remainingSlots -= geometryLeft;
  statsLeft = Math.min(statsLeft, remainingSlots);
  remainingSlots -= statsLeft;
  let otherLeft = remainingSlots; // whatever remains can be any category

  // Split MC pool by bucket
  const mcByBucket = {
    algebra: shuffle(mcPool.filter((q) => bucketOf(q) === "algebra")),
    geometry: shuffle(mcPool.filter((q) => bucketOf(q) === "geometry")),
    statsprob: shuffle(mcPool.filter((q) => bucketOf(q) === "statsprob")),
    other: shuffle(mcPool.filter((q) => bucketOf(q) === "other")),
  };

  const take = (bucket: keyof typeof mcByBucket, n: number) => {
    const arr = mcByBucket[bucket];
    const k = Math.min(n, arr.length);
    const items = arr.splice(0, k);
    return { items, short: n - k };
  };

  const algebraPick = take("algebra", algebraLeft);
  const geometryPick = take("geometry", geometryLeft);
  const statsPick = take("statsprob", statsLeft);
  const otherPick = take("other", otherLeft);

  // Borrow shortages from leftover MC across all buckets
  let shortage =
    algebraPick.short + geometryPick.short + statsPick.short + otherPick.short;
  if (shortage > 0) {
    const leftovers = [
      ...mcByBucket.algebra,
      ...mcByBucket.geometry,
      ...mcByBucket.statsprob,
      ...mcByBucket.other,
    ];
    const fill = leftovers.slice(0, shortage);
    otherPick.items.push(...fill);
    shortage -= fill.length;
  }

  // Combine to final length and re-index
  const combined = [
    ...gridPicked,
    ...algebraPick.items,
    ...geometryPick.items,
    ...statsPick.items,
    ...otherPick.items,
  ].slice(0, C.total);

  return combined.map((q, i) => ({ ...q, index: i + 1 }));
}
