/**
 * Fetch JSON safely (works on client & server).
 * - Forces no-store (can be overridden)
 * - Reads as text first to avoid HTML error pages breaking JSON.parse
 * - Throws helpful errors on non-200 or bad JSON
 */
export async function fetchJsonSafe<T = unknown>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(raw || `HTTP ${res.status}`);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error("Server did not return valid JSON.");
  }
}
