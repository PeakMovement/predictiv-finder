/**
 * Browser CORS allow-list for Predictiv edge functions.
 * Wildcard origins are not allowed — the anon key is public, so origin
 * restriction is one of the few abuse brakes we can apply at the function.
 *
 * Lovable preview hosts are included so the editor can still invoke
 * analyze-health-concern; create-practitioner still requires admin JWT or
 * an invite token regardless of origin.
 */
const STATIC_ALLOWED = new Set([
  "https://predictiv.co.za",
  "https://www.predictiv.co.za",
]);

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== "http:" && protocol !== "https:") return false;
    if (STATIC_ALLOWED.has(origin)) return true;
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (hostname.endsWith(".lovable.app") || hostname.endsWith(".lovable.dev")) {
      return protocol === "https:";
    }
    return false;
  } catch {
    return false;
  }
}

export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin");
  const allowOrigin = origin && isAllowedOrigin(origin) ? origin : "https://predictiv.co.za";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Client-Info, apikey, Apikey, Authorization",
    Vary: "Origin",
  };
}
