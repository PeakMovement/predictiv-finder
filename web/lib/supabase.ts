import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public, read-only usage throughout the directory: RLS on `professionals`
// should only expose rows where is_approved = true to the anon role.
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export type Professional = {
  id: string;
  name: string;
  profession: string;
  specialities: string[];
  price_min: number | null;
  price_max: number | null;
  location: string | null;
  suburb: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  review_count: number;
  is_featured: boolean;
  is_approved: boolean;
  slug: string | null;
  practice_name: string | null;
  bio: string | null;
  years_experience: number | null;
  photo_url: string | null;
  calendly_url: string;
  expertise_areas: string[];
};

export async function getApprovedProfessionals(filters?: {
  suburb?: string;
  profession?: string;
}) {
  let query = supabase.from("professionals").select("*").eq("is_approved", true);
  if (filters?.suburb) query = query.ilike("suburb", filters.suburb);
  if (filters?.profession) query = query.ilike("profession", filters.profession);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Professional[];
}

// Cards and the sitemap link to `/practitioner/${slug ?? id}`, since most
// rows don't have a slug set yet. Accept either here so that fallback
// actually resolves instead of 404ing.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getProfessionalBySlug(slugOrId: string) {
  const query = supabase.from("professionals").select("*").eq("is_approved", true);
  const { data, error } = await (
    UUID_RE.test(slugOrId)
      ? query.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
      : query.eq("slug", slugOrId)
  ).maybeSingle();
  if (error) throw error;
  return data as Professional | null;
}
