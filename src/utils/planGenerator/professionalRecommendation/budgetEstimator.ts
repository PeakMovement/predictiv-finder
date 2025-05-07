
import { ServiceCategory } from "../types";

// Base costs for each professional type
export const baseCosts: Partial<Record<ServiceCategory, number>> = {
  'dietician': 500,
  'personal-trainer': 350,
  'physiotherapist': 600,
  'coaching': 450,
  'family-medicine': 500,
  'biokineticist': 550,
  'psychiatry': 900,
  'cardiology': 1000,
  'gastroenterology': 900,
  'orthopedics': 900,
  'neurology': 1000,
  'pain-management': 750,
  'endocrinology': 800,
  'dermatology': 700
};

/**
 * Calculate the estimated budget for a professional service
 * 
 * @param category The professional service category
 * @param sessions Number of sessions recommended
 * @returns Estimated total budget
 */
export function calculateBudget(category: ServiceCategory, sessions: number): number {
  // Use base cost or default to 600
  const sessionCost = baseCosts[category] || 600;
  return sessionCost * sessions;
}

/**
 * Determines if there's a budget constraint based on user input
 * 
 * @param userInput User's input text
 * @param budget Optional explicit budget amount
 * @returns Boolean indicating if there's a budget constraint
 */
export function detectBudgetConstraint(userInput: string, budget?: number): boolean {
  return userInput.toLowerCase().includes('tight budget') || 
    userInput.toLowerCase().includes("can't afford") ||
    userInput.toLowerCase().includes('affordable') ||
    (budget !== undefined && budget < 1500);
}
