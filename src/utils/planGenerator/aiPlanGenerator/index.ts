
import { AIHealthPlan, ServiceCategory } from '@/types';
import { analyzeUserQuery, estimateComplexityLevel } from './userAnalysis';
import { generatePlan } from '../planGenerator/generatePlan';
import { BASELINE_COSTS } from '../types';
import { matchPractitionersToNeeds } from '../professionalRecommendation/matcher';
import { detectComprehensiveSymptoms } from '../detectors/comprehensiveSymptomDetector';

/**
 * Generate AI health plans using comprehensive analysis and existing sophisticated algorithms
 */
export async function generateAIHealthPlans(userInput: string): Promise<AIHealthPlan[]> {
  console.log("Generating AI health plans with comprehensive analysis:", userInput);
  
  try {
    // Use comprehensive user analysis
    const analysis = analyzeUserQuery(userInput);
    console.log("User analysis complete:", analysis);
    
    // Get symptom analysis for service matching
    const symptomAnalysis = detectComprehensiveSymptoms(userInput);
    
    // Use existing service matching algorithm
    const matchedServices = matchPractitionersToNeeds(
      analysis.detectedSymptoms || [],
      analysis.severityScores || {},
      analysis.goal ? [analysis.goal] : [],
      analysis.location,
      userInput.toLowerCase().includes('online') || userInput.toLowerCase().includes('remote'),
      !!analysis.budget
    );
    
    console.log("Matched services:", matchedServices);
    
    // Create plan context with comprehensive data
    const planContext = {
      medicalConditions: analysis.detectedSymptoms || [],
      goal: analysis.goal,
      budget: analysis.budget?.monthly,
      budgetTier: analysis.budgetOptimized ? 'budget-conscious' : 'standard',
      location: analysis.location,
      isUrgent: analysis.complexityLevel > 0.7,
      timeAvailability: 8, // Default hours per week
      preferOnline: userInput.toLowerCase().includes('online') || userInput.toLowerCase().includes('remote'),
      isRemote: userInput.toLowerCase().includes('remote'),
      serviceCount: Math.min(matchedServices.length, 4), // Limit to 4 services max
      intensity: analysis.complexityLevel > 0.6 ? 'intensive' : 'standard' as 'intensive' | 'standard'
    };
    
    // Generate plan using existing sophisticated plan generator
    const generatedPlan = generatePlan(planContext);
    console.log("Generated plan:", generatedPlan);
    
    // Ensure prices use baseline costs instead of random values
    const optimizedPlan: AIHealthPlan = {
      ...generatedPlan,
      services: generatedPlan.services.map(service => ({
        ...service,
        price: BASELINE_COSTS[service.type] || 500, // Use existing baseline costs
        sessions: service.sessions || 1
      }))
    };
    
    // Recalculate total cost with proper baseline pricing
    optimizedPlan.totalCost = optimizedPlan.services.reduce(
      (total, service) => total + (service.price * service.sessions), 
      0
    );
    
    console.log("Final optimized plan:", optimizedPlan);
    return [optimizedPlan];
    
  } catch (error) {
    console.error("Error in comprehensive AI plan generation:", error);
    throw error;
  }
}

/**
 * Generate a single AI plan (backward compatibility)
 */
export async function generateAIPlan(userInput: string): Promise<AIHealthPlan> {
  const plans = await generateAIHealthPlans(userInput);
  return plans[0];
}

// Re-export analysis functions
export { analyzeUserQuery, estimateComplexityLevel };
