
/**
 * Main recommendation generator module
 * Refactored from the original large file
 */

import { ServiceCategory } from "../types";
import { ProfessionalRecommendation, CategoryRecommendation } from "./types";
import { matchPractitionersToNeeds } from "../categoryMatcher";
import { validateUserInput } from "./validators";
import { analyzeUserHealth } from "./analysis";
import { calculateBudget, calculateIdealSessions } from "./budget";
import { determineIdealTiming, generateRecommendationNotes, generatePreferredTraits } from "./utils";
import { enhancedMemoize, logger } from "@/utils/cache";

/**
 * Generates comprehensive professional recommendations based on user input
 * @param userInput Text input from the user describing their needs
 * @returns Array of professional recommendations with scores and details
 * @throws Error if processing fails
 */
export function generateProfessionalRecommendations(
  userInput: string
): ProfessionalRecommendation[] {
  try {
    logger.debug("Generating professional recommendations for input:", userInput);
    
    // Validate user input
    const validation = validateUserInput(userInput);
    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }
    
    // Analyze user input to get health information
    const analysis = analyzeUserHealth(userInput);
    
    // Handle specific health scenario if detected
    if (analysis.isSpecificScenario && analysis.scenarioResult) {
      logger.debug("Processing specific health scenario");
      
      // Convert the scenario recommendation to our standard format
      const { recommendations, mainIssue } = analysis.scenarioResult;
      
      // Calculate severity and sessions based on the scenario
      const severity = 0.7; // Default to moderately high severity
      const sessionCount = calculateIdealSessions(recommendations.primaryProfessional, severity);
      
      // Generate recommendations array starting with primary professional
      const result: ProfessionalRecommendation[] = [{
        category: recommendations.primaryProfessional,
        score: 0.9,
        primaryCondition: mainIssue,
        idealSessions: sessionCount,
        estimatedBudget: calculateBudget(recommendations.primaryProfessional, sessionCount),
        idealTiming: determineIdealTiming(recommendations.primaryProfessional, severity),
        severity,
        notes: [recommendations.rationale],
        preferredTraits: []
      }];
      
      // Add secondary professional if present
      if (recommendations.secondaryProfessional) {
        const secondarySessionCount = Math.max(2, Math.floor(sessionCount * 0.7));
        result.push({
          category: recommendations.secondaryProfessional,
          score: 0.8,
          primaryCondition: mainIssue,
          idealSessions: secondarySessionCount,
          estimatedBudget: calculateBudget(recommendations.secondaryProfessional, secondarySessionCount),
          idealTiming: determineIdealTiming(recommendations.secondaryProfessional, severity),
          severity,
          notes: [recommendations.rationale],
          preferredTraits: []
        });
      }
      
      // Add supporting professionals
      recommendations.supportingProfessionals.forEach((category, index) => {
        const supportSessionCount = Math.max(2, Math.floor(sessionCount * 0.5));
        result.push({
          category,
          score: 0.7 - (index * 0.1), // Decreasing score for each additional professional
          primaryCondition: mainIssue,
          idealSessions: supportSessionCount,
          estimatedBudget: calculateBudget(category, supportSessionCount),
          idealTiming: determineIdealTiming(category, severity),
          severity,
          notes: [recommendations.rationale],
          preferredTraits: []
        });
      });
      
      return result;
    }
    
    // If no specific scenario, process with standard flow
    const {
      symptoms,
      contraindications,
      goals,
      severityScores,
      locationInfo,
      hasBudgetConstraint
    } = analysis;
    
    // Match practitioners to needs with enhanced caching
    let rankedCategories: CategoryRecommendation[];
    try {
      // Use enhanced memoization wrapper for expensive calculations
      rankedCategories = cachedMatchPractitioners(
        symptoms,
        severityScores,
        goals,
        locationInfo.location,
        locationInfo.isRemote,
        hasBudgetConstraint
      );
    } catch (error) {
      logger.error("Error matching practitioners to needs:", error);
      throw new Error("Failed to match health professionals to your needs. Please try different wording.");
    }
    
    logger.debug("Ranked professional categories:", rankedCategories);
    
    if (rankedCategories.length === 0) {
      logger.warn("No professional categories matched to user needs");
      return [];
    }
    
    // Convert to detailed recommendations
    const recommendations: ProfessionalRecommendation[] = rankedCategories
      .filter(rc => !contraindications.includes(rc.category)) // Filter out contraindicated services
      .map(rankedCategory => {
        try {
          const { category, score, primaryCondition } = rankedCategory;
          
          // Calculate severity and session count
          const conditionSeverity = primaryCondition && severityScores[primaryCondition] !== undefined ? 
            severityScores[primaryCondition] : 0.5;
          const idealSessions = calculateIdealSessions(category, conditionSeverity);
          
          // Calculate budget and timing
          const estimatedBudget = calculateBudget(category, idealSessions);
          const idealTiming = determineIdealTiming(category, conditionSeverity);
          
          // Generate notes and preferred traits
          const notes = generateRecommendationNotes(
            category,
            primaryCondition,
            conditionSeverity,
            goals,
            hasBudgetConstraint
          );
          
          const preferredTraits = generatePreferredTraits(primaryCondition || "", goals);
          
          return {
            category,
            score,
            primaryCondition,
            idealSessions,
            estimatedBudget,
            idealTiming,
            severity: conditionSeverity,
            notes,
            preferredTraits
          };
        } catch (error) {
          logger.error(`Error generating recommendation for ${rankedCategory.category}:`, error);
          // Return a minimal valid recommendation to prevent complete failure
          return {
            category: rankedCategory.category,
            score: rankedCategory.score,
            primaryCondition: rankedCategory.primaryCondition,
            idealSessions: 4,
            estimatedBudget: 2400,
            idealTiming: "Weekly sessions for 1 month",
            severity: 0.5,
            notes: ["Unable to generate detailed recommendations."],
            preferredTraits: []
          };
        }
      });
    
    return recommendations;
  } catch (error) {
    logger.error("Error in generateProfessionalRecommendations:", error);
    throw error;
  }
}

// Replace the simple memoization cache with enhanced caching
// Configure with a 10 minute TTL and max 50 items cache size
const cachedMatchPractitioners = enhancedMemoize(
  (
    symptoms: string[],
    severityScores: Record<string, number>,
    goals: any[],
    location?: string,
    isRemote?: boolean,
    hasBudgetConstraint?: boolean
  ): CategoryRecommendation[] => {
    logger.debug("Cache miss - computing practitioner matches");
    return matchPractitionersToNeeds(
      symptoms,
      severityScores,
      goals,
      location,
      isRemote,
      hasBudgetConstraint
    );
  },
  // Custom key generator
  (symptoms, severityScores, goals, location, isRemote, hasBudgetConstraint) => 
    JSON.stringify({ symptoms, severityScores, goals, location, isRemote, hasBudgetConstraint }),
  // Cache options
  { maxSize: 50, ttl: 10 * 60 * 1000 } // 10 minutes TTL, max 50 items
);
