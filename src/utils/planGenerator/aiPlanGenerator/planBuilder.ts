
import { AIHealthPlan, UserCriteria } from '@/types';
import { BASELINE_COSTS, ServiceCategory } from '../types';
import { generatePlan } from '../planGenerator/generatePlan';

/**
 * Generates multiple AI health plans based on user criteria and complexity level
 * @param criteria User criteria for plan generation
 * @param complexityLevel Estimated complexity of user health needs
 * @returns Array of AI health plans
 */
export function generateAIHealthPlans(criteria: Partial<UserCriteria>, complexityLevel: number): AIHealthPlan[] {
  console.log("Generating AI health plans with complexity:", complexityLevel);
  
  const plans: AIHealthPlan[] = [];
  
  // Convert criteria to context for plan generation
  const planContext = {
    medicalConditions: criteria.medicalConditions || [],
    goal: criteria.goal,
    budget: criteria.budget?.monthly,
    location: criteria.location,
    preferOnline: criteria.preferOnline
  };
  
  // Generate a standard "best fit" plan
  try {
    const standardPlan = generatePlan({
      ...planContext,
      planType: 'best-fit'
    });
    plans.push(standardPlan);
  } catch (error) {
    console.error("Error generating standard plan:", error);
  }
  
  // For higher complexity, generate additional specialized plans
  if (complexityLevel > 0.6) {
    try {
      // Generate a specialized high-impact plan
      const highImpactPlan = generatePlan({
        ...planContext,
        planType: 'high-impact',
        budget: planContext.budget ? planContext.budget * 1.2 : undefined // Higher budget option
      });
      
      // Only add if sufficiently different from standard plan
      if (isPlanUnique(highImpactPlan, plans)) {
        plans.push(highImpactPlan);
      }
    } catch (error) {
      console.error("Error generating high-impact plan:", error);
    }
    
    try {
      // Generate a progressive plan
      const progressivePlan = generatePlan({
        ...planContext,
        planType: 'progressive',
        timeFrame: 'long-term'
      });
      
      // Only add if sufficiently different from other plans
      if (isPlanUnique(progressivePlan, plans)) {
        plans.push(progressivePlan);
      }
    } catch (error) {
      console.error("Error generating progressive plan:", error);
    }
  }
  
  // Ensure we return at least one plan
  if (plans.length === 0) {
    // Generate a fallback basic plan
    return [createFallbackPlan(criteria)];
  }
  
  return plans;
}

/**
 * Check if a plan is substantially different from existing plans
 */
function isPlanUnique(plan: AIHealthPlan, existingPlans: AIHealthPlan[]): boolean {
  for (const existingPlan of existingPlans) {
    // If total costs are within 20% of each other
    const costSimilarity = Math.abs(plan.totalCost - existingPlan.totalCost) / existingPlan.totalCost;
    if (costSimilarity < 0.2) {
      // Check if service types are mostly the same
      const planServices = new Set(plan.services.map(s => s.type));
      const existingServices = new Set(existingPlan.services.map(s => s.type));
      
      // Find common services
      let commonCount = 0;
      planServices.forEach(service => {
        if (existingServices.has(service)) commonCount++;
      });
      
      // If more than 70% of services are the same, consider the plan not unique
      if (commonCount / planServices.size > 0.7) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Creates a fallback plan when normal generation fails
 */
function createFallbackPlan(criteria: Partial<UserCriteria>): AIHealthPlan {
  return {
    id: `fallback-${Date.now()}`,
    name: "Basic Health Plan",
    description: "A simple health plan covering essential services based on your needs.",
    services: [
      {
        type: 'family-medicine',
        price: 700,
        sessions: 1,
        description: "General medical consultation to assess your health needs"
      },
      {
        type: 'personal-trainer',
        price: 500, 
        sessions: 2,
        description: "Exercise guidance to improve general fitness and wellbeing"
      }
    ],
    totalCost: 1700,
    planType: 'best-fit',
    timeFrame: '4 weeks'
  };
}
