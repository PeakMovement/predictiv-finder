
/**
 * Professional recommendation main module
 */

import { ServiceCategory } from "../types";
import { 
  ProfessionalRecommendation, 
  CategoryRecommendation,
  ProfessionalRecommendationResult,
  ScenarioResult
} from "./types";
import { matchPractitionersToNeeds } from "./matcher";
import { analyzeUserHealth } from "./analysis";
import { calculateBudget, calculateIdealSessions, optimizePlanForBudget } from "./budget";
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
            priority: 'low',
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
      rankedCategories = matchPractitionersToNeeds(
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
    const unoptimizedRecommendations = rankedCategories
      .filter(rc => !contraindications.includes(rc.category as ServiceCategory))
      .slice(0, 5) // Take top 5 initially, we'll optimize later
      .map((rankedCategory, index) => {
        const { category, score, primaryCondition } = rankedCategory;
        
        // Calculate severity and session count
        const conditionSeverity = primaryCondition && severityScores[primaryCondition] !== undefined ? 
          severityScores[primaryCondition] : 0.5;
        
        const idealSessions = calculateIdealSessions(category, conditionSeverity);
        
        // Create recommendation
        return {
          category,
          sessions: idealSessions,
          priority: index === 0 ? 'high' : (index === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
          reasoning: rankedCategory.reasoning || `Recommended for ${primaryCondition || 'your condition'}`
        };
      });
    
    // If we have a budget, apply budget optimization
    if (budget) {
      const optimized = optimizePlanForBudget(unoptimizedRecommendations, budget);
      
      result.primaryRecommendations = optimized.optimizedRecommendations
        .filter((_, index) => index < 2); // Top 2 are primary
      
      result.complementaryRecommendations = optimized.optimizedRecommendations
        .filter((_, index) => index >= 2); // Rest are complementary
      
      result.budgetAllocation = {
        total: optimized.totalCost,
        breakdown: optimized.budgetAllocation
      };
      
      result.notes = optimized.notes;
    } else {
      // Without budget constraints, use the top 2 as primary and others as complementary
      result.primaryRecommendations = unoptimizedRecommendations
        .filter((_, index) => index < 2); // Top 2 are primary
      
      result.complementaryRecommendations = unoptimizedRecommendations
        .filter((_, index) => index >= 2); // Rest are complementary
    }
    
    return result;
  } catch (error) {
    logger.error("Error in generateProfessionalRecommendations:", error);
    throw error;
  }
}

/**
 * Analyze user health from input text
 * This is a placeholder - in a real implementation, this would use NLP or LLM to analyze user text
 */
function analyzeUserHealth(userInput: string) {
  // This would normally be more sophisticated - placeholder implementation
  const lowerInput = userInput.toLowerCase();
  
  // Extract symptoms (simple keyword matching)
  const symptoms = [];
  if (lowerInput.includes('pain')) symptoms.push('pain');
  if (lowerInput.includes('stress')) symptoms.push('stress');
  if (lowerInput.includes('anxiety')) symptoms.push('anxiety');
  if (lowerInput.includes('weight')) symptoms.push('weight concerns');
  
  // Extract goals (simple keyword matching)
  const goals = [];
  if (lowerInput.includes('lose weight')) goals.push('weight loss');
  if (lowerInput.includes('run') || lowerInput.includes('marathon')) goals.push('running');
  if (lowerInput.includes('strength') || lowerInput.includes('stronger')) goals.push('strength');
  
  // Simple severity scores
  const severityScores: Record<string, number> = {};
  symptoms.forEach(symptom => {
    if (lowerInput.includes('severe ' + symptom)) {
      severityScores[symptom] = 0.9;
    } else if (lowerInput.includes('mild ' + symptom)) {
      severityScores[symptom] = 0.3;
    } else {
      severityScores[symptom] = 0.6; // Default moderate
    }
  });
  
  // Extract budget information
  let budget: number | undefined = undefined;
  let hasBudgetConstraint = false;
  
  const budgetMatches = lowerInput.match(/budget.*?(\d+)/i) || 
                        lowerInput.match(/afford.*?(\d+)/i) ||
                        lowerInput.match(/spend.*?(\d+)/i);
  
  if (budgetMatches && budgetMatches[1]) {
    budget = parseInt(budgetMatches[1]);
    hasBudgetConstraint = true;
  }
  
  // Extract location information
  const locationMatches = lowerInput.match(/in\s+([a-z\s]+)(?:,|\.|$)/i);
  const isRemote = lowerInput.includes('remote') || 
                  lowerInput.includes('online') || 
                  lowerInput.includes('virtual');
  
  return {
    symptoms,
    contraindications: [] as ServiceCategory[], // Not implemented in this simple version
    goals,
    severityScores,
    locationInfo: {
      location: locationMatches ? locationMatches[1].trim() : undefined,
      isRemote
    },
    hasBudgetConstraint,
    budget
  };
}
