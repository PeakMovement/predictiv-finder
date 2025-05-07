
import { ServiceCategory } from "../types";
import { ProfessionalRecommendation, CategoryRecommendation } from "./types";
import { identifySymptoms } from "../symptomDetector";
import { matchPractitionersToNeeds } from "../categoryMatcher";
import { calculateSeverityScores, extractLocationDetails } from "../inputAnalyzer/weightingSystem";
import { extractBudget } from "../inputAnalyzer/budgetExtractor";
import { extractGoals } from "./goalExtractor";
import { calculateIdealSessions } from "./sessionCalculator";
import { calculateBudget, detectBudgetConstraint, baseCosts } from "./budgetEstimator";
import { determineIdealTiming } from "./timingRecommender";
import { generateRecommendationNotes, generatePreferredTraits } from "./notesGenerator";
import { enhancedMemoize, logger } from "@/utils/cache";

export interface SymptomAnalysisResult {
  symptoms: string[];
  priorities: Record<string, number>;
  contraindications: ServiceCategory[];
}

// Fix the TypeScript error by making location optional in the interface
export interface LocationAnalysis {
  location?: string;
  isRemote: boolean;
}

export interface BudgetAnalysis {
  budget: number | undefined;
  hasBudgetConstraint: boolean;
}

/**
 * Validates the user input for professional recommendation generation
 * @param userInput Text input from the user
 * @returns Object with validation result and error message if any
 */
export function validateUserInput(userInput: string): { isValid: boolean; errorMessage?: string } {
  if (!userInput || userInput.trim() === '') {
    return { isValid: false, errorMessage: "Please provide some information about your health needs." };
  }
  
  if (userInput.length < 10) {
    return { isValid: false, errorMessage: "Please provide more details for better recommendations." };
  }
  
  if (userInput.length > 2000) {
    return { isValid: false, errorMessage: "Input exceeds maximum length (2000 characters)." };
  }
  
  return { isValid: true };
}

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
    
    // Extract conditions and symptoms with error handling
    let symptomAnalysisResult: SymptomAnalysisResult;
    try {
      symptomAnalysisResult = identifySymptoms(userInput);
    } catch (error) {
      logger.error("Error identifying symptoms:", error);
      throw new Error("Failed to analyze health symptoms. Please try different wording.");
    }
    
    const { symptoms, priorities, contraindications } = symptomAnalysisResult;
    logger.debug("Identified symptoms:", symptoms);
    logger.debug("Contraindicated services:", contraindications);
    
    if (symptoms.length === 0) {
      logger.warn("No symptoms identified from input");
    }
    
    // Extract goals with error handling
    let goals;
    try {
      goals = extractGoals(userInput);
    } catch (error) {
      logger.error("Error extracting goals:", error);
      goals = [];
    }
    logger.debug("Extracted goals:", goals);
    
    // Calculate severity scores for each condition with error handling
    let severityScores;
    try {
      severityScores = calculateSeverityScores(symptoms, userInput);
    } catch (error) {
      logger.error("Error calculating severity scores:", error);
      severityScores = symptoms.reduce((acc, symptom) => {
        acc[symptom] = 0.5; // Default medium severity
        return acc;
      }, {} as Record<string, number>);
    }
    logger.debug("Severity scores:", severityScores);
    
    // Extract location and online preference with error handling
    let locationInfo: LocationAnalysis;
    try {
      locationInfo = extractLocationDetails(userInput);
    } catch (error) {
      logger.error("Error extracting location details:", error);
      locationInfo = { location: undefined, isRemote: false };
    }
    logger.debug("Location info:", locationInfo);
    
    // Extract budget information with error handling
    let budget;
    let hasBudgetConstraint;
    try {
      budget = extractBudget(userInput);
      hasBudgetConstraint = detectBudgetConstraint(userInput, budget);
    } catch (error) {
      logger.error("Error extracting budget information:", error);
      budget = undefined;
      hasBudgetConstraint = false;
    }
    logger.debug("Budget info:", { budget, hasBudgetConstraint });
    
    // Match practitioners to needs with error handling and enhanced caching
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
    
    // Convert to detailed recommendations with error handling
    const recommendations: ProfessionalRecommendation[] = rankedCategories
      .filter(rc => !contraindications.includes(rc.category)) // Filter out contraindicated services
      .map(rankedCategory => {
        try {
          const { category, score, primaryCondition } = rankedCategory;
          
          // Calculate ideal number of sessions based on severity and professional type
          const conditionSeverity = primaryCondition && severityScores[primaryCondition] !== undefined ? 
            severityScores[primaryCondition] : 0.5;
          
          // Use try/catch blocks for each calculation to prevent cascading failures
          let idealSessions;
          try {
            idealSessions = calculateIdealSessions(category, conditionSeverity);
          } catch (error) {
            logger.error(`Error calculating ideal sessions for ${category}:`, error);
            idealSessions = 4; // Default value
          }
          
          // Use base cost or default to 600
          const sessionCost = baseCosts[category] || 600;
          
          let estimatedBudget;
          try {
            estimatedBudget = calculateBudget(category, idealSessions);
          } catch (error) {
            logger.error(`Error calculating budget for ${category}:`, error);
            estimatedBudget = sessionCost * idealSessions;
          }
          
          // Determine ideal timing
          let idealTiming;
          try {
            idealTiming = determineIdealTiming(category, conditionSeverity);
          } catch (error) {
            logger.error(`Error determining ideal timing for ${category}:`, error);
            idealTiming = "Weekly sessions for 1 month";
          }
          
          // Generate recommendation notes
          let notes;
          try {
            notes = generateRecommendationNotes(
              category,
              primaryCondition,
              conditionSeverity,
              goals,
              hasBudgetConstraint,
              sessionCost
            );
          } catch (error) {
            logger.error(`Error generating recommendation notes for ${category}:`, error);
            notes = [`Consider working with a ${category.replace('-', ' ')} professional.`];
          }
          
          // Preferred traits for professionals
          let preferredTraits;
          try {
            preferredTraits = generatePreferredTraits(primaryCondition || "", goals);
          } catch (error) {
            logger.error(`Error generating preferred traits for ${category}:`, error);
            preferredTraits = [];
          }
          
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
