
import { ServiceCategory } from "../types";
import { CategoryRecommendation } from "./types";
import { matchPractitionersToNeeds as originalMatchPractitioners } from "../categoryMatcher";
import { enhancedMemoize } from "@/utils/cache";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";

/**
 * Cached version of the matchPractitionersToNeeds function
 * Uses memoization to avoid recalculating results for the same inputs
 */
export const cachedMatchPractitioners = enhancedMemoize(
  (
    symptoms: string[],
    severityScores: Record<string, number>,
    goals: any[],
    location?: string,
    isRemote?: boolean,
    hasBudgetConstraint?: boolean
  ): CategoryRecommendation[] => {
    return originalMatchPractitioners(
      symptoms,
      severityScores,
      goals,
      location,
      isRemote,
      hasBudgetConstraint
    );
  },
  // Custom key generator for better cache performance
  (symptoms, severityScores, goals, location, isRemote, hasBudgetConstraint) => {
    return JSON.stringify({
      s: symptoms.sort().join(','),
      ss: Object.entries(severityScores)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join(','),
      g: Array.isArray(goals) ? goals.length : 0,
      l: location || '',
      r: isRemote ? 1 : 0,
      b: hasBudgetConstraint ? 1 : 0
    });
  },
  { maxSize: 50, ttl: 10 * 60 * 1000 } // 10 minutes TTL, max 50 items
);

/**
 * Public function that matches practitioners to user needs
 * This wrapper allows for consistent typing across the application
 */
export const matchPractitionersToNeeds = (
  symptoms: string[],
  severityScores: Record<string, number>,
  goals: any[],
  location?: string,
  isRemote?: boolean,
  hasBudgetConstraint?: boolean
): CategoryRecommendation[] => {
  return cachedMatchPractitioners(
    symptoms,
    severityScores,
    goals,
    location,
    isRemote,
    hasBudgetConstraint
  );
};
