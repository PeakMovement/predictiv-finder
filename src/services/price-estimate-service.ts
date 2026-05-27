import { loadPhysicianData } from './physician-recommendation-service';

export interface PriceEstimate {
  min: number;
  max: number;
  currency: 'R';
  sampleSize: number;
  formatted: string;
}

/**
 * Estimate a per-session price range (in Rand) for a list of candidate
 * specialties using the existing practitioner CSV data.
 *
 * No practitioner identities are exposed — only aggregate min/max.
 */
export const estimatePriceRange = async (
  specialties: string[]
): Promise<PriceEstimate | null> => {
  const physicians = await loadPhysicianData();
  if (!physicians.length) return null;

  const pool = specialties.length
    ? physicians.filter((p) => specialties.includes(p.Title))
    : physicians;

  if (!pool.length) return null;

  const prices = pool.map((p) => p.Price).filter((n) => Number.isFinite(n) && n > 0);
  if (!prices.length) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const fmt = (n: number) => `R${Math.round(n).toLocaleString('en-ZA')}`;

  return {
    min,
    max,
    currency: 'R',
    sampleSize: pool.length,
    formatted: min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`,
  };
};
