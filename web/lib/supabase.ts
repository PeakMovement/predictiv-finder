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

export async function getProfessionalBySlug(slug: string) {
  const { data, error } = await supabase
    .from("professionals")
    .select("*")
    .eq("slug", slug)
    .eq("is_approved", true)
    .maybeSingle();
  if (error) throw error;
  return data as Professional | null;
}
