// Haversine distance in kilometres between two lat/lng points.
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Known launch suburbs, geocoded once so we don't need a live geocoding call
// on every page render. Add more as the directory expands beyond Rondebosch.
export const SUBURB_COORDS: Record<string, { lat: number; lng: number }> = {
  rondebosch: { lat: -33.9578, lng: 18.4747 },
  "cape-town-cbd": { lat: -33.9249, lng: 18.4241 },
  claremont: { lat: -33.9814, lng: 18.4642 },
  newlands: { lat: -33.9736, lng: 18.4589 },
};

// Ranking score for the listing: real review signal weighted highest,
// then proximity, then the manually controlled featured flag as a tiebreaker
// boost, in line with "free basic listing, paid featured placement" pricing.
export function rankScore(p: {
  rating: number | null;
  review_count: number;
  is_featured: boolean;
  distanceKm: number | null;
}): number {
  const reviewScore = (p.rating ?? 0) * Math.log10((p.review_count ?? 0) + 1);
  const proximityScore = p.distanceKm != null ? Math.max(0, 10 - p.distanceKm) : 0;
  const featuredBoost = p.is_featured ? 5 : 0;
  return reviewScore * 2 + proximityScore + featuredBoost;
}
