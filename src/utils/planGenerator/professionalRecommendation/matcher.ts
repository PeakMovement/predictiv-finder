
/**
 * Professional category matching module
 * Handles the logic for matching health professionals to user needs
 */

import { ServiceCategory } from "../types";
import { CategoryRecommendation } from "./types";
import { matchPractitionersToNeeds } from "../categoryMatcher";
import { enhancedMemoize, logger } from "@/utils/cache";

/**
 * Enhanced matcher for practitioners with caching
 * This function matches health practitioners to user needs and caches the results
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
    logger.debug("Cache miss - computing practitioner matches");
    const matches = matchPractitionersToNeeds(
      symptoms,
      severityScores,
      goals,
      location,
      isRemote,
      hasBudgetConstraint
    );
    
    // Convert matches to CategoryRecommendation objects
    return matches.map(match => ({
      category: match.category,
      score: match.score || 0, // Keep for internal use
      importance: match.score || 0.5, // Map score to importance for type compatibility
      reasoning: match.reasoning || `Match for your health needs`,
      primaryCondition: match.primaryCondition // Keep for internal use
    }));
  },
  // Custom key generator
  (symptoms, severityScores, goals, location, isRemote, hasBudgetConstraint) => 
    JSON.stringify({ symptoms, severityScores, goals, location, isRemote, hasBudgetConstraint }),
  // Cache options
  { maxSize: 50, ttl: 10 * 60 * 1000 } // 10 minutes TTL, max 50 items
);

/**
 * Get recommended practitioners for specific health conditions
 * @param condition The health condition to match
 * @returns Array of recommended professional categories
 */
export function getRecommendedPractitionersForCondition(condition: string): ServiceCategory[] {
  const conditionMap: Record<string, ServiceCategory[]> = {
    'back pain': ['physiotherapist', 'orthopedics', 'pain-management'],
    'knee pain': ['physiotherapist', 'orthopedics'],
    'weight loss': ['dietician', 'personal-trainer'],
    'anxiety': ['psychiatry', 'coaching'],
    'depression': ['psychiatry', 'coaching'],
    'digestive issues': ['gastroenterology', 'dietician'],
    'sleep problems': ['psychiatry', 'family-medicine']
  };
  
  return conditionMap[condition.toLowerCase()] || ['family-medicine'];
}

/**
 * Determines if the user's needs are complex and require specialists
 * @param symptoms User's symptoms
 * @param severity Severity of symptoms
 * @returns Whether specialist care is recommended
 */
export function needsSpecialistCare(symptoms: string[], severity: number): boolean {
  const highRiskSymptoms = ['chest pain', 'shortness of breath', 'severe pain'];
  const hasHighRiskSymptom = symptoms.some(s => 
    highRiskSymptoms.some(risk => s.toLowerCase().includes(risk)));
  
  return hasHighRiskSymptom || severity > 0.8;
}
