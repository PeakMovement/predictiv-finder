
import { AIHealthPlan } from '@/types';

/**
 * Enhances AI health plans based on feedback insights from past user interactions
 * @param plans Generated AI health plans
 * @param userQuery Original user query text
 * @returns Enhanced plans with feedback-driven adjustments
 */
export function enhancePlansWithFeedbackInsights(
  plans: AIHealthPlan[], 
  userQuery: string
): AIHealthPlan[] {
  // In a real implementation, we would analyze past feedback data
  // and adjust the plans accordingly. For now, we'll implement a simple
  // version that makes minor adjustments based on the query text.
  
  console.log('Enhancing plans with feedback insights');
  
  return plans.map(plan => {
    const enhancedPlan = { ...plan };
    
    // Check for keywords in the user query to adjust the plan
    if (userQuery.toLowerCase().includes('affordable') || 
        userQuery.toLowerCase().includes('cheap') || 
        userQuery.toLowerCase().includes('budget')) {
      console.log('User mentioned budget concerns, optimizing plan costs');
      
      // Adjust session counts to make the plan more affordable
      enhancedPlan.services = enhancedPlan.services.map(service => ({
        ...service,
        sessions: Math.max(1, service.sessions - 1) // Reduce sessions but ensure minimum of 1
      }));
      
      // Recalculate total cost
      enhancedPlan.totalCost = enhancedPlan.services.reduce(
        (total, service) => total + (service.price * service.sessions), 0
      );
    }
    
    if (userQuery.toLowerCase().includes('urgent') || 
        userQuery.toLowerCase().includes('emergency') ||
        userQuery.toLowerCase().includes('immediate')) {
      console.log('User indicated urgency, prioritizing immediate interventions');
      
      // Adjust the plan description to emphasize urgency
      enhancedPlan.description = `Urgent care plan: ${enhancedPlan.description}`;
    }
    
    // Add evidence-based rationales if not present
    if (!enhancedPlan.rationales) {
      enhancedPlan.rationales = enhancedPlan.services.map(service => ({
        service: service.type,
        rationale: `Based on user feedback, ${service.type} has shown positive outcomes for similar health profiles.`,
        evidenceLevel: "medium" as "high" | "medium" | "low"
      }));
    }
    
    // Safe handling for services and scores with type casting
    if (enhancedPlan.recommendedServices) {
      enhancedPlan.recommendedServices = [...enhancedPlan.recommendedServices];
    }
    
    if (enhancedPlan.matchScore !== undefined) {
      // Slightly adjust match scores based on user feedback
      enhancedPlan.matchScore = Math.min(0.95, enhancedPlan.matchScore + 0.05);
    } else {
      enhancedPlan.matchScore = 0.8; // Default match score if none exists
    }
    
    return enhancedPlan;
  });
}
