
import { Practitioner } from "@/types";

export interface LocationPreference {
  location: string;
  radius: 'exact' | 'nearby' | 'anywhere';
}

export const filterByLocation = (
  practitioners: Practitioner[],
  preference: LocationPreference
): Practitioner[] => {
  if (preference.radius === 'anywhere') {
    return practitioners;
  }

  const exactMatches = practitioners.filter(p => 
    p.location.toLowerCase() === preference.location.toLowerCase()
  );

  if (preference.radius === 'exact' || exactMatches.length > 0) {
    return exactMatches;
  }

  // For 'nearby', implement fuzzy matching using areas that are close to each other
  const nearbyAreas: Record<string, string[]> = {
    'rondebosch': ['claremont', 'newlands', 'observatory', 'mowbray'],
    'claremont': ['rondebosch', 'newlands', 'kenilworth'],
    'city bowl': ['gardens', 'woodstock', 'sea point'],
    // Add more area mappings as needed
  };

  const nearbyLocations = nearbyAreas[preference.location.toLowerCase()] || [];
  
  return practitioners.filter(p => 
    nearbyLocations.includes(p.location.toLowerCase())
  );
};
