
import { AIHealthPlan, UserCriteria, ServiceCategory } from '@/types';
import { analyzeUserQuery } from './userAnalysis';
import { enhancedAnalyzeUserInput } from '../enhancedInputAnalyzer';
import { generateAIHealthPlans } from './planBuilder';
import { estimateComplexityLevel } from './complexity';
import { checkCoMorbidities } from '../enhancedInputAnalyzer';
import { extractGoals } from '../professionalRecommendation/goalExtractor';
import { detectHealthScenarios } from '../detectors/healthScenarioDetector';
import { analyzeSentiment } from '../inputAnalyzer/synonymExpansion';
import { enhancePlansWithFeedbackInsights } from '../feedbackSystem';

/**
 * Enhanced AI Plan Generator with improved learning capabilities
 * This version extracts more context and adapts better to user requests
 * 
 * @param query User's input text describing their health needs
 * @param options Optional configuration parameters
 * @returns Array of AI health plans customized to the user's needs
 */
export async function generateEnhancedAIPlan(
  query: string, 
  options: {
    useMachineLearning?: boolean; 
    preferComprehensiveAnalysis?: boolean;
    adaptToUserContext?: boolean;
    applyFeedbackInsights?: boolean;
  } = {}
): Promise<AIHealthPlan[]> {
  console.log(`Generating enhanced AI plan for query: "${query}"`);
  
  // Default options
  const {
    useMachineLearning = true,
    preferComprehensiveAnalysis = true,
    adaptToUserContext = true,
    applyFeedbackInsights = true
  } = options;
  
  try {
    // Use the enhanced input analyzer for better context extraction
    const enhancedAnalysis = preferComprehensiveAnalysis ? 
      enhancedAnalyzeUserInput(query) : 
      null;
    
    // Also run the standard analyzer as a fallback
    const standardAnalysis = analyzeUserQuery(query);
    
    // Combine the analyses, preferring the enhanced version when available
    const combinedCriteria: Partial<UserCriteria> = {
      ...standardAnalysis,
      ...(enhancedAnalysis ? {
        conditions: enhancedAnalysis.medicalConditions,
        goal: enhancedAnalysis.primaryIssue || standardAnalysis.goal,
        categories: enhancedAnalysis.suggestedCategories as ServiceCategory[],
        location: enhancedAnalysis.location,
        preferOnline: enhancedAnalysis.preferOnline
      } : {})
    };
    
    console.log("Combined user criteria:", combinedCriteria);
    
    // Look for co-morbidities if there are multiple medical conditions
    if (combinedCriteria.conditions && combinedCriteria.conditions.length > 1) {
      const additionalServices = checkCoMorbidities(combinedCriteria.conditions);
      
      if (additionalServices.length > 0) {
        console.log("Detected co-morbidities, adding services:", additionalServices);
        combinedCriteria.categories = [
          ...(combinedCriteria.categories || []),
          ...additionalServices as ServiceCategory[]
        ];
      }
    }
    
    // Extract specific goals for better plan customization
    const specificGoals = extractGoals(query);
    if (specificGoals.length > 0 && !combinedCriteria.goal) {
      combinedCriteria.goal = specificGoals[0];
      console.log("Setting primary goal from extracted goals:", combinedCriteria.goal);
    }
    
    // NEW: Run sentiment analysis
    const sentimentResults = analyzeSentiment(query);
    console.log("Sentiment analysis results:", sentimentResults);
    
    // NEW: Detect health scenarios
    const healthScenarios = detectHealthScenarios(query);
    if (healthScenarios.length > 0) {
      console.log("Detected health scenarios:", 
        healthScenarios.map(s => `${s.scenarioName} (${s.confidence.toFixed(2)})`));
      
      // Use the highest confidence scenario to augment our criteria
      const primaryScenario = healthScenarios[0];
      if (primaryScenario.confidence > 0.7) {
        console.log("Applying primary scenario:", primaryScenario.scenarioName);
        
        // Add recommended services from the scenario
        if (primaryScenario.recommendedServices && primaryScenario.recommendedServices.length > 0) {
          combinedCriteria.categories = [
            ...(combinedCriteria.categories || []),
            ...primaryScenario.recommendedServices as ServiceCategory[]
          ];
          
          // Remove duplicates
          if (combinedCriteria.categories) {
            combinedCriteria.categories = [...new Set(combinedCriteria.categories)];
          }
        }
        
        // Set goal from scenario if no goal is set
        if (!combinedCriteria.goal && primaryScenario.scenarioName) {
          combinedCriteria.goal = primaryScenario.scenarioName;
        }
      }
    }
    
    // Set urgency based on sentiment analysis
    const isUrgent = sentimentResults.urgencyLevel === 'high';
    
    // Adapt plan generation based on urgency
    if (isUrgent && adaptToUserContext) {
      console.log("Detected urgency in user request");
      combinedCriteria.isUrgent = true;
    }
    
    // Ensure categories is always of type ServiceCategory[]
    if (combinedCriteria.categories && combinedCriteria.categories.length > 0) {
      combinedCriteria.categories = combinedCriteria.categories.map(
        category => category as ServiceCategory
      );
    }
    
    // Estimate the complexity level of the user's needs
    const complexityLevel = estimateComplexityLevel(combinedCriteria);
    console.log(`Estimated complexity level: ${complexityLevel}`);
    
    // Generate multiple AI health plans based on the analysis
    let generatedPlans = generateAIHealthPlans(combinedCriteria, complexityLevel);
    
    // Apply feedback insights if enabled
    if (applyFeedbackInsights) {
      generatedPlans = enhancePlansWithFeedbackInsights(generatedPlans, query);
    }
    
    console.log(`Generated ${generatedPlans.length} health plans`);
    return generatedPlans;
  } catch (error) {
    console.error("Error in generateEnhancedAIPlan:", error);
    throw new Error(`Failed to generate health plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
