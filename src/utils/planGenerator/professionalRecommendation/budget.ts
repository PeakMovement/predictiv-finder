
/**
 * Budget calculation functions for professional recommendations
 */

import { ServiceCategory } from "../types";
import { logger } from "@/utils/cache";

// Base costs for different service categories
export const baseCosts: Record<string, number> = {
  'physiotherapist': 850,
  'biokineticist': 700,
  'dietician': 650,
  'personal-trainer': 550,
  'pain-management': 900,
  'coaching': 600,
  'psychology': 1200,
  'psychiatry': 1500,
  'podiatrist': 750,
  'general-practitioner': 800,
  'sport-physician': 1200,
  'orthopedic-surgeon': 2000,
  'family-medicine': 750,
  'gastroenterology': 1400,
  'massage-therapy': 500,
  'nutrition-coach': 550
};

/**
 * Calculates the estimated budget for a service based on session count
 */
export function calculateBudget(serviceType: ServiceCategory, sessionCount: number): number {
  try {
    // Get the base cost for this service type, default to 600 if not found
    const cost = baseCosts[serviceType] || 600;
    return cost * sessionCount;
  } catch (error) {
    logger.error(`Error calculating budget for ${serviceType}:`, error);
    // Return a reasonable fallback value
    return 600 * sessionCount;
  }
}

/**
 * Detects if user has a budget constraint from their input
 */
export function detectBudgetConstraint(userInput: string, extractedBudget?: number): boolean {
  // Budget is explicitly mentioned
  if (extractedBudget !== undefined) {
    return true;
  }
  
  // Look for budget constraint language
  const budgetConstraintPhrases = [
    'budget', 'afford', 'cost', 'expensive', 'cheap', 'price',
    'spend', 'money', 'financial', 'economical', 'affordable',
    'low cost', 'high cost', 'save money', 'tight budget'
  ];
  
  const inputLower = userInput.toLowerCase();
  return budgetConstraintPhrases.some(phrase => inputLower.includes(phrase));
}

/**
 * Calculates the ideal number of sessions based on service type and severity
 */
export function calculateIdealSessions(
  serviceType: ServiceCategory, 
  conditionSeverity: number
): number {
  // Base sessions by service type
  const baseSessionsByType: Record<string, number> = {
    'physiotherapist': 6,
    'biokineticist': 8,
    'dietician': 4,
    'personal-trainer': 8,
    'pain-management': 6,
    'coaching': 6,
    'psychology': 8,
    'psychiatry': 6,
    'podiatrist': 3,
    'general-practitioner': 2,
    'massage-therapy': 6
  };
  
  // Get base sessions for this service, default to 4 if not found
  const baseSessions = baseSessionsByType[serviceType] || 4;
  
  // Adjust sessions based on severity (0-1 scale)
  if (conditionSeverity > 0.8) { // High severity
    return Math.ceil(baseSessions * 1.5);
  } else if (conditionSeverity > 0.4) { // Medium severity
    return baseSessions;
  } else { // Low severity
    return Math.max(2, Math.floor(baseSessions * 0.75));
  }
}
