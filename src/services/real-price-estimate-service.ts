import { supabase } from '@/integrations/supabase/client';

export interface RealPriceEstimate {
  min: number;
  max: number;
  sampleSize: number;
  formatted: string;
}

// The AI analyzer and the legacy keyword detector don't always use the exact
// same label the professionals table stores -- normalise before querying so
// "General Physician" (legacy) and "General Practitioner" (AI, DB) match.
function normaliseProfession(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (key === 'general physician' || key === 'general practitioner') return 'General Practitioner';
  if (key === 'biokineticist' || key === 'biokinetist') return 'Biokineticist';
  if (key === 'physiotherapist') return 'Physiotherapist';
  if (key === 'chiropractor') return 'Chiropractor';
  return raw;
}

/**
 * Real per-session price estimate sourced from the live, approved
 * practitioners in Supabase (price_min/price_max on `professionals`).
 *
 * Returns null whenever there isn't enough real pricing data yet for that
 * profession -- callers should fall back to a clearly-labelled AI estimate
 * in that case, never fabricate a number or borrow from a mock dataset.
 */
export const getRealPriceEstimate = async (
  profession: string | null
): Promise<RealPriceEstimate | null> => {
  if (!profession) return null;

  const { data, error } = await supabase
    .from('professionals')
    .select('price_min, price_max')
    .eq('is_approved', true)
    .eq('profession', normaliseProfession(profession))
    .not('price_min', 'is', null);

  if (error || !data || data.length === 0) return null;

  const mins = data.map((p) => p.price_min).filter((n): n is number => n != null);
  const maxes = data
    .map((p) => p.price_max ?? p.price_min)
    .filter((n): n is number => n != null);
  if (!mins.length) return null;

  const min = Math.min(...mins);
  const max = Math.max(...maxes);
  const fmt = (n: number) => `R${Math.round(n).toLocaleString('en-ZA')}`;

  return {
    min,
    max,
    sampleSize: data.length,
    formatted: min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`,
  };
};
