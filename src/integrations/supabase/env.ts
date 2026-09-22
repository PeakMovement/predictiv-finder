/**
 * Public Supabase URL + anon JWT for the Vite app and the SEO prerender.
 *
 * Prefer VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY so the Lovable
 * Cloud cutover is an env change (or a Lovable rewrite of client.ts), not a
 * hunt through hardcoded project refs. Fallbacks keep the currently linked
 * supabase.com project (zpddlphtoeluytrejioj) working until Cloud is live.
 *
 * The anon key is public by design. Never put the service role key here.
 * See docs/MIGRATION_TO_LOVABLE_CLOUD.md.
 */

export const LINKED_SUPABASE_PROJECT_REF = 'zpddlphtoeluytrejioj';
export const LINKED_SUPABASE_URL = `https://${LINKED_SUPABASE_PROJECT_REF}.supabase.co`;
export const LINKED_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZGRscGh0b2VsdXl0cmVqaW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzMzMzMsImV4cCI6MjA2Mzk0OTMzM30.jwTdmEafWDvL-k54o9-q-hpeeqvTJPUZDI_Pp2g3nlU';

type PublicEnvName =
  | 'VITE_SUPABASE_URL'
  | 'VITE_SUPABASE_PUBLISHABLE_KEY'
  | 'VITE_SUPABASE_ANON_KEY';

function readPublicEnv(name: PublicEnvName): string | undefined {
  try {
    // Typed locally so this module also compiles in Node-based contexts
    // (SEO prerender) where vite/client ambient types are not loaded.
    const meta = import.meta as { env?: Record<string, string | undefined> };
    const fromVite = meta.env?.[name];
    if (typeof fromVite === 'string' && fromVite.length > 0) return fromVite;
  } catch {
    /* import.meta.env is not always defined when this module is loaded from Node */
  }

  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const fromProcess = proc?.env?.[name];
  if (typeof fromProcess === 'string' && fromProcess.length > 0) return fromProcess;
  return undefined;
}

export const SUPABASE_URL = readPublicEnv('VITE_SUPABASE_URL') ?? LINKED_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY =
  readPublicEnv('VITE_SUPABASE_PUBLISHABLE_KEY') ??
  readPublicEnv('VITE_SUPABASE_ANON_KEY') ??
  LINKED_SUPABASE_ANON_KEY;

export const BLOG_SITEMAP_URL = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/blog-sitemap`;
