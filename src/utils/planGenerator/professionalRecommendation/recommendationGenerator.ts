
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
    console.log("Generating professional recommendations for input:", userInput);
    
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
      console.error("Error identifying symptoms:", error);
      throw new Error("Failed to analyze health symptoms. Please try different wording.");
    }
    
    const { symptoms, priorities, contraindications } = symptomAnalysisResult;
    console.log("Identified symptoms:", symptoms);
    console.log("Contraindicated services:", contraindications);
    
    if (symptoms.length === 0) {
      console.warn("No symptoms identified from input");
    }
    
    // Extract goals with error handling
    let goals;
    try {
      goals = extractGoals(userInput);
    } catch (error) {
      console.error("Error extracting goals:", error);
      goals = [];
    }
    console.log("Extracted goals:", goals);
    
    // Calculate severity scores for each condition with error handling
    let severityScores;
    try {
      severityScores = calculateSeverityScores(symptoms, userInput);
    } catch (error) {
      console.error("Error calculating severity scores:", error);
      severityScores = symptoms.reduce((acc, symptom) => {
        acc[symptom] = 0.5; // Default medium severity
        return acc;
      }, {} as Record<string, number>);
    }
    console.log("Severity scores:", severityScores);
    
    // Extract location and online preference with error handling
    let locationInfo: LocationAnalysis;
    try {
      locationInfo = extractLocationDetails(userInput);
    } catch (error) {
      console.error("Error extracting location details:", error);
      locationInfo = { location: undefined, isRemote: false };
    }
    console.log("Location info:", locationInfo);
    
    // Extract budget information with error handling
    let budget;
    let hasBudgetConstraint;
    try {
      budget = extractBudget(userInput);
      hasBudgetConstraint = detectBudgetConstraint(userInput, budget);
    } catch (error) {
      console.error("Error extracting budget information:", error);
      budget = undefined;
      hasBudgetConstraint = false;
    }
    console.log("Budget info:", { budget, hasBudgetConstraint });
    
    // Match practitioners to needs with error handling and performance optimization
    let rankedCategories: CategoryRecommendation[];
    try {
      // Use memoization wrapper for expensive calculations
      rankedCategories = memoizedMatchPractitioners(
        symptoms,
        severityScores,
        goals,
        locationInfo.location,
        locationInfo.isRemote,
        hasBudgetConstraint
      );
    } catch (error) {
      console.error("Error matching practitioners to needs:", error);
      throw new Error("Failed to match health professionals to your needs. Please try different wording.");
    }
    
    console.log("Ranked professional categories:", rankedCategories);
    
    if (rankedCategories.length === 0) {
      console.warn("No professional categories matched to user needs");
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
            console.error(`Error calculating ideal sessions for ${category}:`, error);
            idealSessions = 4; // Default value
          }
          
          // Use base cost or default to 600
          const sessionCost = baseCosts[category] || 600;
          
          let estimatedBudget;
          try {
            estimatedBudget = calculateBudget(category, idealSessions);
          } catch (error) {
            console.error(`Error calculating budget for ${category}:`, error);
            estimatedBudget = sessionCost * idealSessions;
          }
          
          // Determine ideal timing
          let idealTiming;
          try {
            idealTiming = determineIdealTiming(category, conditionSeverity);
          } catch (error) {
            console.error(`Error determining ideal timing for ${category}:`, error);
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
            console.error(`Error generating recommendation notes for ${category}:`, error);
            notes = [`Consider working with a ${category.replace('-', ' ')} professional.`];
          }
          
          // Preferred traits for professionals
          let preferredTraits;
          try {
            preferredTraits = generatePreferredTraits(primaryCondition || "", goals);
          } catch (error) {
            console.error(`Error generating preferred traits for ${category}:`, error);
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
          console.error(`Error generating recommendation for ${rankedCategory.category}:`, error);
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
    console.error("Error in generateProfessionalRecommendations:", error);
    throw error;
  }
}

// Create a simple memoization cache for performance optimization
const memoCache = new Map<string, CategoryRecommendation[]>();

/**
 * Memoized wrapper for matchPractitionersToNeeds to improve performance
 * @param symptoms Array of identified symptoms
 * @param severityScores Severity scores for each symptom
 * @param goals User goals
 * @param location User location
 * @param isRemote Whether user prefers remote sessions
 * @param hasBudgetConstraint Whether user has budget constraints
 * @returns Ranked professional categories
 */
function memoizedMatchPractitioners(
  symptoms: string[],
  severityScores: Record<string, number>,
  goals: any[],
  location?: string,
  isRemote?: boolean,
  hasBudgetConstraint?: boolean
): CategoryRecommendation[] {
  // Create a cache key based on function arguments
  const cacheKey = JSON.stringify({
    symptoms,
    severityScores,
    goals,
    location,
    isRemote,
    hasBudgetConstraint
  });
  
  // Check if we have a cached result
  if (memoCache.has(cacheKey)) {
    console.log("Using cached practitioner matches");
    return memoCache.get(cacheKey)!;
  }
  
  // If not, perform the calculation and cache the result
  const result = matchPractitionersToNeeds(
    symptoms,
    severityScores,
    goals,
    location,
    isRemote,
    hasBudgetConstraint
  );
  
  // Store result in cache (limit cache size to prevent memory leaks)
  if (memoCache.size > 100) {
    // Clear oldest entries if cache gets too large
    const oldestKey = memoCache.keys().next().value;
    memoCache.delete(oldestKey);
  }
  
  memoCache.set(cacheKey, result);
  return result;
}
