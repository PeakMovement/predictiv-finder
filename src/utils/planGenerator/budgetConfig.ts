import { BudgetTier } from "./types";

export const DEFAULT_BUDGET_TIERS: BudgetTier[] = [
  {
    name: "low",
    range: { min: 0, max: 1000 },
    maxSessions: 2,
    budget: 1000
  },
  {
    name: "medium",
    range: { min: 1001, max: 2500 },
    maxSessions: 3,
    budget: 2500
  },
  {
    name: "high",
    range: { min: 2501, max: 10000 },
    maxSessions: 4,
    budget: 5000
  }
];

/**
 * Gets the budget tiers with custom adjustments if needed
 */
export function getBudgetTiers(
  userBudget?: number, 
  userPreferences?: Record<string, string>
): BudgetTier[] {
  const tiers = [...DEFAULT_BUDGET_TIERS];
  
  // If user has specified a budget, update the tier that contains it
  if (userBudget && userBudget > 0) {
    for (const tier of tiers) {
      if (userBudget >= tier.range.min && userBudget <= tier.range.max) {
        tier.budget = userBudget;
        break;
      }
    }
  }
  
  return tiers;
}

/**
 * Calculates a budget range based on user input
 */
export function calculateBudgetRange(
  explicitBudget?: number,
  budgetPreference?: string
): { min: number; max: number; recommended: number } {
  // If user specified an exact budget, use that
  if (explicitBudget && explicitBudget > 0) {
    // Give a range of ±15% around the specified budget
    const min = Math.floor(explicitBudget * 0.85);
    const max = Math.ceil(explicitBudget * 1.15);
    return { min, max, recommended: explicitBudget };
  }
  
  // Otherwise use budget preference to determine range
  switch (budgetPreference?.toLowerCase()) {
    case 'low':
      return { min: 500, max: 1500, recommended: 1000 };
    case 'medium':
      return { min: 1500, max: 3000, recommended: 2250 };
    case 'high':
      return { min: 3000, max: 8000, recommended: 5000 };
    case 'premium':
      return { min: 8000, max: 15000, recommended: 10000 };
    default:
      // Default to medium budget range
      return { min: 1500, max: 3000, recommended: 2250 };
  }
}

/**
 * Attempts to infer budget from user input text
 */
export function inferBudgetFromInput(inputText: string): number | undefined {
  if (!inputText) return undefined;
  
  // Look for budget mentions with currency symbols
  const currencyRegex = /(?:R\s*|ZAR\s*|budget\s*:?\s*R\s*)(\d[,\.\d]*)/i;
  const currencyMatch = inputText.match(currencyRegex);
  
  if (currencyMatch && currencyMatch[1]) {
    // Parse the matched number, handling commas and decimals
    const parsedValue = parseFloat(currencyMatch[1].replace(/,/g, ''));
    if (!isNaN(parsedValue)) {
      return parsedValue;
    }
  }
  
  // Look for budget mentions without currency symbols
  const budgetRegex = /budget\s*:?\s*(\d[,\.\d]*)/i;
  const budgetMatch = inputText.match(budgetRegex);
  
  if (budgetMatch && budgetMatch[1]) {
    const parsedValue = parseFloat(budgetMatch[1].replace(/,/g, ''));
    if (!isNaN(parsedValue)) {
      return parsedValue;
    }
  }
  
  // Check for budget qualifiers
  if (/low\s*(?:cost|budget)/i.test(inputText)) {
    return 1000;
  } else if (/high\s*(?:cost|budget|end)/i.test(inputText)) {
    return 5000;
  } else if (/medium\s*(?:cost|budget|range)/i.test(inputText)) {
    return 2500;
  }
  
  return undefined;
}
