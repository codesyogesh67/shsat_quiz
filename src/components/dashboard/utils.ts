export function pct(n: number) {
  return Math.round(n * 100);
}

export function fmtDate(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function minutesToHMM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function fmtLocalDate(d: string) {
  const parts = d.split("-").map(Number);
  const local = new Date(parts[0], parts[1] - 1, parts[2]); // no UTC shift
  return local.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
