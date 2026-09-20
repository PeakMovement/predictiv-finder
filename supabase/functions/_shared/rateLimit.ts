/**
 * Per-isolate sliding-window limiter. Supabase Edge isolates are not a
 * global Redis — this stops naive loops from a single worker, not a
 * distributed botnet. Pair with platform rate limits (see ARCHITECTURE.md).
 */
const hits = new Map<string, number[]>();

export function allowRequest(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export function clientKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim()
    || req.headers.get("cf-connecting-ip")
    || req.headers.get("x-real-ip")
    || "unknown";
  return ip;
}
