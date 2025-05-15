
import { AIHealthPlan, UserCriteria } from '@/types';
import { analyzeUserQuery } from './userAnalysis';
import { enhancedAnalyzeUserInput } from '../enhancedInputAnalyzer';
import { generateAIHealthPlans } from './planBuilder';
import { estimateComplexityLevel } from './complexity';
import { checkCoMorbidities } from '../enhancedInputAnalyzer';
import { extractGoals } from '../professionalRecommendation/goalExtractor';

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
  } = {}
): Promise<AIHealthPlan[]> {
  console.log(`Generating enhanced AI plan for query: "${query}"`);
  
  // Default options
  const {
    useMachineLearning = true,
    preferComprehensiveAnalysis = true,
    adaptToUserContext = true
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
        medicalConditions: enhancedAnalysis.medicalConditions,
        goal: enhancedAnalysis.primaryIssue || standardAnalysis.goal,
        categories: enhancedAnalysis.suggestedCategories,
        location: enhancedAnalysis.location,
        preferOnline: enhancedAnalysis.preferOnline
      } : {})
    };
    
    console.log("Combined user criteria:", combinedCriteria);
    
    // Look for co-morbidities if there are multiple medical conditions
    if (combinedCriteria.medicalConditions && combinedCriteria.medicalConditions.length > 1) {
      const additionalServices = checkCoMorbidities(combinedCriteria.medicalConditions);
      
      if (additionalServices.length > 0) {
        console.log("Detected co-morbidities, adding services:", additionalServices);
        combinedCriteria.categories = [
          ...(combinedCriteria.categories || []),
          ...additionalServices
        ];
      }
    }
    
    // Extract specific goals for better plan customization
    const specificGoals = extractGoals(query);
    if (specificGoals.length > 0 && !combinedCriteria.goal) {
      combinedCriteria.goal = specificGoals[0];
      console.log("Setting primary goal from extracted goals:", combinedCriteria.goal);
    }
    
    // Check for urgency indicators in the text
    const urgencyTerms = ['urgent', 'immediately', 'asap', 'emergency', 'critical'];
    const isUrgent = urgencyTerms.some(term => query.toLowerCase().includes(term));
    
    // Adapt plan generation based on urgency
    if (isUrgent && adaptToUserContext) {
      console.log("Detected urgency in user request");
      combinedCriteria.isUrgent = true;
    }
    
    // Estimate the complexity level of the user's needs
    const complexityLevel = estimateComplexityLevel(combinedCriteria);
    console.log(`Estimated complexity level: ${complexityLevel}`);
    
    // Generate multiple AI health plans based on the analysis
    const generatedPlans = generateAIHealthPlans(combinedCriteria, complexityLevel);
    
    console.log(`Generated ${generatedPlans.length} health plans`);
    return generatedPlans;
  } catch (error) {
    console.error("Error in generateEnhancedAIPlan:", error);
    throw new Error(`Failed to generate health plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
