import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeadersFor, isAllowedOrigin } from "../_shared/cors.ts";

/**
 * Admin / invite-only Auth user creation.
 *
 * The public anon key is a valid JWT, so gateway verify_jwt is NOT enough
 * to stop auth.admin.createUser. Callers must be either:
 *   1. A signed-in Predictiv admin (public.is_blog_admin()), or
 *   2. A request that includes invite_token matching env PRACTITIONER_INVITE_TOKEN
 *      (only if that env var is set — we never ship a default secret).
 *
 * Public practitioner signup should use supabase.auth.signUp on the client
 * instead of this function.
 */
Deno.serve(async (req: Request) => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(corsHeaders, 405, { error: "method_not_allowed" });
  }

  const origin = req.headers.get("Origin");
  if (origin && !isAllowedOrigin(origin)) {
    return json(corsHeaders, 403, { error: "origin_not_allowed" });
  }

  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const inviteToken = typeof body?.invite_token === "string" ? body.invite_token : "";

    if (!email || !password) {
      return json(corsHeaders, 400, { error: "Email and password are required" });
    }

    const authorized = await authorizeCaller(req, inviteToken);
    if (!authorized.ok) {
      return json(corsHeaders, 403, { error: authorized.error });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return json(corsHeaders, 400, { error: createError.message });
    }

    return json(corsHeaders, 200, { userId: data.user.id });
  } catch (err) {
    return json(corsHeaders, 500, {
      error: err instanceof Error ? err.message : "An unexpected server error occurred",
    });
  }
});

async function authorizeCaller(
  req: Request,
  inviteToken: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const expectedInvite = Deno.env.get("PRACTITIONER_INVITE_TOKEN") ?? "";
  if (expectedInvite.length >= 16 && inviteToken && inviteToken === expectedInvite) {
    return { ok: true };
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return { ok: false, error: "admin_or_invite_required" };
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) {
    return { ok: false, error: "admin_or_invite_required" };
  }

  const { data: isAdmin, error: rpcError } = await userClient.rpc("is_blog_admin");
  if (rpcError || isAdmin !== true) {
    return { ok: false, error: "admin_or_invite_required" };
  }

  return { ok: true };
}

function json(corsHeaders: Record<string, string>, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
