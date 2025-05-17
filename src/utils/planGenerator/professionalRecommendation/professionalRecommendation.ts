
import { ServiceCategory } from "../types";
import { 
  ProfessionalRecommendationResult,
  ProfessionalRecommendation,
  CategoryRecommendation
} from "./types";
import { analyzeUserHealth } from "./analysis";
import { validateUserInput } from "./validators";
import { processHealthScenario } from "./scenarioHandler";
import { cachedMatchPractitioners } from "./matcher";
import { calculateIdealSessions, calculateBudget } from "./budget";
import { logger } from "@/utils/cache";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";

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
    const analysisResult = analyzeUserHealth(userInput);
    
    // Check if analysis returned a specific scenario
    if (analysisResult.isSpecificScenario && analysisResult.scenarioResult) {
      const { scenarioResult } = analysisResult;
      
      // Build the response structure for a specific scenario
      const result: ProfessionalRecommendationResult = {
        primaryRecommendations: [{
          category: scenarioResult.recommendations.primaryProfessional,
          sessions: 4,
          priority: 'high',
          reasoning: scenarioResult.recommendations.rationale
        }]
      };
      
      // Add secondary professional if present
      if (scenarioResult.recommendations.secondaryProfessional) {
        result.primaryRecommendations.push({
          category: scenarioResult.recommendations.secondaryProfessional,
          sessions: 3,
          priority: 'medium',
          reasoning: scenarioResult.recommendations.rationale
        });
      }
      
      // Add complementary recommendations
      if (scenarioResult.recommendations.supportingProfessionals && 
          scenarioResult.recommendations.supportingProfessionals.length > 0) {
        result.complementaryRecommendations = scenarioResult.recommendations.supportingProfessionals.map(category => ({
          category,
          sessions: 2,
          priority: 'low',
          reasoning: "Supporting professional for your condition"
        }));
      }
      
      return result;
    }
    
    // If no specific scenario, process with standard flow
    const {
      symptoms,
      contraindications,
      goals,
      severityScores,
      locationInfo,
      budget,
      hasBudgetConstraint
    } = analysisResult;
    
    // Match practitioners to needs
    let rankedCategories: CategoryRecommendation[];
    try {
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
      .filter(rc => !contraindications.includes(rc.category))
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
        breakdown: createServiceCategoryRecord(0) // Initialize with zero for all categories
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
