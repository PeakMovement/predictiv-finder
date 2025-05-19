
import { BudgetTier, LegacyPriceRange, PriceRange } from '../types';

/**
 * Adapters for converting between different versions of types
 * to maintain compatibility between modules
 */

/**
 * Converts a legacy price range to the new standardized format
 * @param legacyRange The legacy price range object
 * @returns Standardized price range object
 */
export function convertLegacyPriceRange(legacyRange: LegacyPriceRange): PriceRange {
  return {
    min: legacyRange.low,
    max: legacyRange.high
  };
}

/**
 * Creates a legacy price range object from min/max values
 * @param min Minimum price value
 * @param max Maximum price value
 * @returns Legacy price range format
 */
export function createLegacyPriceRange(min: number, max: number): LegacyPriceRange {
  return {
    low: min,
    high: max
  };
}

/**
 * Converts a string budget tier to a full BudgetTier object
 * @param tier String tier name
 * @returns BudgetTier object with appropriate values
 */
export function convertStringToBudgetTier(tier: string): BudgetTier {
  switch (tier.toLowerCase()) {
    case 'low':
      return {
        name: 'low',
        range: { min: 0, max: 1000 },
        maxSessions: 2,
        budget: 500
      };
    case 'medium':
      return {
        name: 'medium',
        range: { min: 1001, max: 2500 },
        maxSessions: 3,
        budget: 2250
      };
    case 'high':
      return {
        name: 'high',
        range: { min: 2501, max: 10000 },
        maxSessions: 4,
        budget: 5000
      };
    default:
      // Default to medium tier
      return {
        name: 'medium',
        range: { min: 1001, max: 2500 },
        maxSessions: 3,
        budget: 2250
      };
  }
}
