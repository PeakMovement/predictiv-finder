import { AIHealthPlan, UserCriteria, ServiceCategory } from '@/types';
import { analyzeUserQuery } from './userAnalysis';
import { enhancedAnalyzeUserInput } from '../enhancedInputAnalyzer';
import { generateAIHealthPlans } from './planBuilder';
import { estimateComplexityLevel } from './complexity';
import { checkCoMorbidities } from '../enhancedInputAnalyzer';
import { extractGoals } from '../professionalRecommendation/goalExtractor';
import { detectHealthScenarios } from '../detectors/healthScenarioDetector';
import { analyzeSentiment } from '../inputAnalyzer/synonymExpansion';
import { PlanGenerationError, PlanGenerationErrorType } from '../errorHandling/planGenerationError';

// Define a function to convert between AIHealthPlan types if needed
function convertAIHealthPlan(plan: AIHealthPlan): AIHealthPlan {
  return {
    ...plan,
    planType: plan.planType as 'best-fit' | 'high-impact' | 'progressive'
  };
}

/**
 * Enhanced AI Plan Generator with improved learning capabilities and error handling
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
    // Enhanced input analysis with better error context preservation
    let enhancedAnalysis = null;
    let standardAnalysis = null;
    
    try {
      enhancedAnalysis = preferComprehensiveAnalysis ? 
        enhancedAnalyzeUserInput(query) : 
        null;
    } catch (error) {
      console.warn('Enhanced analysis failed, falling back to standard analysis:', error);
      throw new PlanGenerationError(
        `Enhanced input analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        PlanGenerationErrorType.INPUT_VALIDATION,
        "We had trouble understanding your detailed health needs. Please try being more specific about your symptoms or goals.",
        { 
          originalError: error instanceof Error ? error.message : String(error),
          query,
          analysisType: 'enhanced'
        },
        [
          "Try describing your symptoms in simpler terms",
          "Focus on one main health concern at a time",
          "Include specific details about your goals"
        ]
      );
    }
    
    try {
      standardAnalysis = analyzeUserQuery(query);
    } catch (error) {
      console.error('Standard analysis failed:', error);
      throw new PlanGenerationError(
        `Standard input analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        PlanGenerationErrorType.INPUT_VALIDATION,
        "We couldn't process your health query. Please try rephrasing your request.",
        { 
          originalError: error instanceof Error ? error.message : String(error),
          query,
          analysisType: 'standard'
        },
        [
          "Use simple, clear language to describe your needs",
          "Mention specific health goals or symptoms",
          "Try shorter, more focused requests"
        ]
      );
    }
    
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
      try {
        const additionalServices = checkCoMorbidities(combinedCriteria.conditions);
        
        if (additionalServices.length > 0) {
          console.log("Detected co-morbidities, adding services:", additionalServices);
          combinedCriteria.categories = [
            ...(combinedCriteria.categories || []),
            ...additionalServices as ServiceCategory[]
          ];
        }
      } catch (error) {
        console.warn('Co-morbidity analysis failed:', error);
        // Don't throw here, just continue without co-morbidity analysis
      }
    }
    
    // Extract specific goals for better plan customization
    try {
      const specificGoals = extractGoals(query);
      if (specificGoals.length > 0 && !combinedCriteria.goal) {
        combinedCriteria.goal = specificGoals[0];
        console.log("Setting primary goal from extracted goals:", combinedCriteria.goal);
      }
    } catch (error) {
      console.warn('Goal extraction failed:', error);
      // Continue without extracted goals
    }
    
    // Run sentiment analysis with error handling
    let sentimentResults = null;
    try {
      sentimentResults = analyzeSentiment(query);
      console.log("Sentiment analysis results:", sentimentResults);
    } catch (error) {
      console.warn('Sentiment analysis failed:', error);
      // Continue without sentiment analysis
    }
    
    // Detect health scenarios with error handling
    let healthScenarios = [];
    try {
      healthScenarios = detectHealthScenarios(query);
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
    } catch (error) {
      console.warn('Health scenario detection failed:', error);
      // Continue without scenario detection
    }
    
    // Set urgency based on sentiment analysis
    const isUrgent = sentimentResults?.urgencyLevel === 'high';
    
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
    let complexityLevel;
    try {
      complexityLevel = estimateComplexityLevel(combinedCriteria);
      console.log(`Estimated complexity level: ${complexityLevel}`);
    } catch (error) {
      console.warn('Complexity estimation failed, using default:', error);
      complexityLevel = 'medium'; // Default fallback
    }
    
    // Generate multiple AI health plans based on the analysis
    let generatedPlans;
    try {
      generatedPlans = generateAIHealthPlans(combinedCriteria, complexityLevel);
    } catch (error) {
      console.error('Plan generation failed:', error);
      throw new PlanGenerationError(
        `Plan generation failed: ${error instanceof Error ? error.message : String(error)}`,
        PlanGenerationErrorType.PLAN_CREATION,
        "We couldn't create health plans for your request. Please try adjusting your criteria or being more specific.",
        { 
          originalError: error instanceof Error ? error.message : String(error),
          criteria: combinedCriteria,
          complexityLevel,
          query
        },
        [
          "Try describing fewer health concerns at once",
          "Be more specific about your budget or location",
          "Simplify your health goals"
        ]
      );
    }
    
    // Apply feedback insights if enabled (but type-safe now)
    if (applyFeedbackInsights) {
      try {
        // Ensure we're using compatible types by manually converting
        const convertedPlans = generatedPlans.map(plan => convertAIHealthPlan(plan));
        generatedPlans = convertedPlans;
      } catch (error) {
        console.warn('Feedback insights application failed:', error);
        // Continue with original plans
      }
    }
    
    console.log(`Generated ${generatedPlans.length} health plans`);
    return generatedPlans;
  } catch (error) {
    console.error("Error in generateEnhancedAIPlan:", error);
    
    // If it's already a PlanGenerationError, re-throw with preserved context
    if (error instanceof PlanGenerationError) {
      throw error;
    }
    
    // Otherwise, wrap in a new PlanGenerationError with full context
    throw new PlanGenerationError(
      `Enhanced plan generation failed: ${error instanceof Error ? error.message : String(error)}`,
      PlanGenerationErrorType.UNEXPECTED,
      "We encountered an unexpected error while creating your health plans. Please try again or contact support if the problem persists.",
      { 
        originalError: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        query,
        timestamp: new Date().toISOString()
      },
      [
        "Try refreshing the page and submitting your request again",
        "Simplify your health query and try again",
        "Contact support if the problem continues"
      ]
    );
  }
}
