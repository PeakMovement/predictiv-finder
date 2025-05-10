
import { BudgetTier, PriceRange } from "../types";

/**
 * Calculates appropriate budget tiers based on user input and context
 */
export function calculateBudgetTiers(
  userBudget?: number,
  userQuery?: string,
  preferences: Record<string, string> = {},
  userType?: string,
  contextualFactors: string[] = []
): BudgetTier[] {
  // Default budget tiers
  const defaultTiers: BudgetTier[] = [
    {
      name: 'low',
      range: { min: 500, max: 2000 },
      maxSessions: 4,
      budget: 1500
    },
    {
      name: 'medium',
      range: { min: 2001, max: 5000 },
      maxSessions: 8,
      budget: 3500
    },
    {
      name: 'high',
      range: { min: 5001, max: 10000 },
      maxSessions: 12,
      budget: 7500
    }
  ];
  
  // If no budget specified, return default tiers
  if (!userBudget) {
    return defaultTiers;
  }
  
  // Determine which tier the user's budget falls into
  let tierName = 'medium'; // Default tier
  
  if (userBudget <= 2000) {
    tierName = 'low';
  } else if (userBudget <= 5000) {
    tierName = 'medium';
  } else {
    tierName = 'high';
  }
  
  // Apply user type adjustments if applicable
  if (userType === 'student') {
    // Students might have lower budgets but need more sessions
    return [
      {
        name: tierName,
        range: { min: Math.max(500, userBudget * 0.8), max: userBudget * 1.2 },
        maxSessions: getTierSessionCount(tierName) + 2, // Extra sessions for students
        budget: userBudget
      }
    ];
  }
  
  // For premium users, offer more options
  if (userType === 'premium') {
    // Calculate budget range based on user's budget
    return [
      {
        name: 'affordable',
        range: { min: userBudget * 0.7, max: userBudget * 0.9 },
        maxSessions: getTierSessionCount(tierName),
        budget: userBudget * 0.8
      },
      {
        name: tierName,
        range: { min: userBudget * 0.9, max: userBudget * 1.1 },
        maxSessions: getTierSessionCount(tierName) + 1,
        budget: userBudget
      },
      {
        name: 'premium',
        range: { min: userBudget * 1.1, max: userBudget * 1.3 },
        maxSessions: getTierSessionCount(tierName) + 2,
        budget: userBudget * 1.2
      }
    ];
  }
  
  // Standard users get their tier plus one adjacent tier if available
  const userTierIndex = defaultTiers.findIndex(tier => tier.name === tierName);
  
  if (userTierIndex === 0) {
    // Low budget - offer low and medium tiers
    return [
      {
        name: 'low',
        range: { min: userBudget * 0.8, max: userBudget * 1.1 },
        maxSessions: getTierSessionCount('low'),
        budget: userBudget
      },
      {
        name: 'medium',
        range: { min: userBudget * 1.1, max: userBudget * 1.4 },
        maxSessions: getTierSessionCount('medium'),
        budget: userBudget * 1.25
      }
    ];
  } else if (userTierIndex === defaultTiers.length - 1) {
    // High budget - offer medium and high tiers
    return [
      {
        name: 'medium',
        range: { min: userBudget * 0.6, max: userBudget * 0.9 },
        maxSessions: getTierSessionCount('medium'),
        budget: userBudget * 0.75
      },
      {
        name: 'high',
        range: { min: userBudget * 0.9, max: userBudget * 1.2 },
        maxSessions: getTierSessionCount('high'),
        budget: userBudget
      }
    ];
  } else {
    // Medium budget - offer low, medium and high tiers
    return [
      {
        name: 'low',
        range: { min: userBudget * 0.6, max: userBudget * 0.8 },
        maxSessions: getTierSessionCount('low'),
        budget: userBudget * 0.7
      },
      {
        name: 'medium',
        range: { min: userBudget * 0.8, max: userBudget * 1.1 },
        maxSessions: getTierSessionCount('medium'),
        budget: userBudget
      },
      {
        name: 'high',
        range: { min: userBudget * 1.1, max: userBudget * 1.3 },
        maxSessions: getTierSessionCount('high'),
        budget: userBudget * 1.2
      }
    ];
  }
}

/**
 * Helper function to get default session count for each tier
 */
function getTierSessionCount(tierName: string): number {
  switch (tierName) {
    case 'low': return 4;
    case 'medium': return 8;
    case 'high': return 12;
    case 'affordable': return 5;
    case 'premium': return 10;
    default: return 6;
  }
}
