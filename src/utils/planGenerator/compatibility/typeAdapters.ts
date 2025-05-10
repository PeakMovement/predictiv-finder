
/**
 * Type adapters for compatibility between different interfaces
 * This module helps maintain backwards compatibility while we transition
 * to more consistent and organized types
 */

import { PriceRange, LegacyPriceRange, BudgetTier } from '../types';

/**
 * Converts a legacy price range to the new standard format
 */
export function adaptLegacyPriceRange(legacyRange: LegacyPriceRange): PriceRange {
  return {
    min: legacyRange.affordable,
    max: legacyRange.highEnd
  };
}

/**
 * Converts a standard price range to the legacy format
 * (Used for backwards compatibility with older modules)
 */
export function adaptToPriceRange(standardRange: PriceRange): LegacyPriceRange {
  return {
    affordable: standardRange.min,
    highEnd: standardRange.max
  };
}

/**
 * Convert string-based budget tier to full BudgetTier object
 */
export function adaptBudgetTierString(tierName: string, budget: number): BudgetTier {
  const tiers: Record<string, BudgetTier> = {
    'low': {
      name: 'low',
      range: { min: 0, max: 2000 },
      maxSessions: 4,
      budget
    },
    'medium': {
      name: 'medium',
      range: { min: 2001, max: 5000 },
      maxSessions: 8,
      budget
    },
    'high': {
      name: 'high',
      range: { min: 5001, max: 10000 },
      maxSessions: 12,
      budget
    }
  };
  
  return tiers[tierName] || {
    name: 'medium',
    range: { min: 2001, max: 5000 },
    maxSessions: 6,
    budget
  };
}
