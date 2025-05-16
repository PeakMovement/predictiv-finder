/**
 * Main recommendation generator module
 * Refactored from the original large file
 */

import { ServiceCategory } from "../types";
import { 
  ProfessionalRecommendation, 
  CategoryRecommendation,
  ProfessionalRecommendationResult,
  ScenarioResult // Import the appropriate type
} from "./types";
import { matchPractitionersToNeeds } from "../categoryMatcher";
import { validateUserInput } from "./validators";
import { analyzeUserHealth } from "./analysis";
import { calculateBudget, calculateIdealSessions } from "./budget";
import { determineIdealTiming, generateRecommendationNotes, generatePreferredTraits } from "./utils";
import { enhancedMemoize, logger } from "@/utils/cache";
import { processHealthScenario } from "./scenarioHandler";

/**
 * Generates comprehensive professional recommendations based on user input
 * @param userInput Text input from the user describing their needs
 * @returns Array of professional recommendations with scores and details
 * @throws Error if processing fails
 */
export function generateProfessionalRecommendations(
  userInput: string
): ProfessionalRecommendationResult {
  try {
    logger.debug("Generating professional recommendations for input:", userInput);
    
    // Validate user input
    const validation = validateUserInput(userInput);
    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }
    
    // Analyze user input to get health information
    const analysis = analyzeUserHealth(userInput);
    
    // Check if this matches a specific health scenario
    const scenarioResult = processHealthScenario(userInput);
    
    // Handle specific health scenario if detected
    if (scenarioResult && scenarioResult.confidence > 0.7) {
      logger.debug("Processing specific health scenario");
      
      // Make sure we're accessing properties that exist on ScenarioResult
      if (scenarioResult.recommendations && scenarioResult.mainIssue) {
        // Access the scenario recommendations
        const { recommendations, mainIssue } = scenarioResult;
        
        // Build the response structure
        const result: ProfessionalRecommendationResult = {
          primaryRecommendations: [{
            category: recommendations.primaryProfessional,
            sessions: 4,
            priority: 'high',
            reasoning: recommendations.rationale
          }],
          notes: [recommendations.rationale]
        };
        
        // Add secondary professional if present
        if (recommendations.secondaryProfessional) {
          result.primaryRecommendations.push({
            category: recommendations.secondaryProfessional,
            sessions: 3,
            priority: 'medium',
            reasoning: recommendations.rationale
          });
        }
        
        // Add complementary recommendations
        if (recommendations.supportingProfessionals && recommendations.supportingProfessionals.length > 0) {
          result.complementaryRecommendations = recommendations.supportingProfessionals.map(category => ({
            category,
            sessions: 2,
            priority: 'low', // Add the missing priority field
            reasoning: "Supporting professional for your condition"
          }));
        }
        
        return result;
      }
    }
    
    // If no specific scenario, process with standard flow
    const {
      symptoms,
      contraindications,
      goals,
      severityScores,
      locationInfo,
      hasBudgetConstraint,
      budget
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
      return {
        primaryRecommendations: []
      };
    }
    
    // Format the result for the API contract
    const result: ProfessionalRecommendationResult = {
      primaryRecommendations: []
    };
    
    // Convert to detailed recommendations
    rankedCategories
      .filter(rc => !contraindications.includes(rc.category as ServiceCategory))
      .slice(0, 3) // Take top 3
      .forEach((rankedCategory, index) => {
        try {
          const { category, score, primaryCondition } = rankedCategory;
          
          // Calculate severity and session count
          const conditionSeverity = primaryCondition && severityScores[primaryCondition] !== undefined ? 
            severityScores[primaryCondition] : 0.5;
          const idealSessions = calculateIdealSessions(category, conditionSeverity);
          
          // Add to primary recommendations
          result.primaryRecommendations.push({
            category,
            sessions: idealSessions,
            priority: index === 0 ? 'high' : (index === 1 ? 'medium' : 'low'),
            reasoning: rankedCategory.reasoning || `Recommended for ${primaryCondition || 'your condition'}`
          });
        } catch (error) {
          logger.error(`Error generating recommendation for ${rankedCategory.category}:`, error);
        }
      });
    
    // If we have budget info, add budget allocation
    if (budget) {
      result.budgetAllocation = {
        total: budget,
        breakdown: {}
      };
      
      result.primaryRecommendations.forEach(rec => {
        const sessionCost = calculateBudget(rec.category, 1); 
        result.budgetAllocation!.breakdown[rec.category] = sessionCost * rec.sessions;
      });
    }
    
    // Add notes if we have any useful context
    const notes = [];
    if (goals && goals.length > 0) {
      notes.push(`Recommendations are aligned with your goals: ${goals.join(', ')}`);
    }
    if (locationInfo.location) {
      notes.push(`Considered your location: ${locationInfo.location}`);
    }
    if (locationInfo.isRemote) {
      notes.push('Prioritized professionals who offer remote services');
    }
    
    if (notes.length > 0) {
      result.notes = notes;
    }
    
    return result;
  } catch (error) {
    logger.error("Error in generateProfessionalRecommendations:", error);
    throw error;
  }
}

// Import the cachedMatchPractitioners function
import { cachedMatchPractitioners } from "./matcher";
