
import { UserCriteria, AIHealthPlan, PlanContext } from '@/types';
import { getSuggestedProfessionals } from '../categoryMatcher';
import { getServiceDescriptions } from './serviceDescriptions';

/**
 * Generates AI health plans based on user criteria and complexity level
 * @param criteria User's specific health criteria
 * @param complexityLevel The estimated complexity of the user's needs (0-1)
 * @returns Array of AI health plans
 */
export function generateAIHealthPlans(
  criteria: Partial<UserCriteria>,
  complexityLevel: number = 0.5
): AIHealthPlan[] {
  // Get all relevant service categories from the criteria
  const categories = criteria.categories || ['family-medicine'];
  
  // Generate different plan contexts based on the complexity
  const planContexts: PlanContext[] = [];
  
  // Check if any medical conditions are mentioned
  const hasMedicalConditions = criteria.conditions && criteria.conditions.length > 0;
  
  // Check for online preference
  const preferOnline = criteria.preferOnline === true;
  
  // Basic plan (always included)
  planContexts.push({
    name: 'Standard Care Plan',
    description: `Focused on ${criteria.goal || 'your health needs'}.`,
    primaryFocus: criteria.goal || 'General Health',
    serviceCount: Math.min(3, categories.length),
    intensity: 'standard',
    location: criteria.location || 'Your area',
    isRemote: preferOnline,
    duration: 'medium-term'
  });
  
  // For more complex cases, add alternative plans
  if (complexityLevel > 0.6) {
    // Intensive plan for complex cases
    planContexts.push({
      name: 'Intensive Care Plan',
      description: `Comprehensive approach for ${criteria.goal || 'your health needs'}.`,
      primaryFocus: criteria.goal || 'Comprehensive Care',
      serviceCount: Math.min(5, categories.length + 1),
      intensity: 'intensive',
      location: criteria.location || 'Your area',
      isRemote: preferOnline,
      duration: 'long-term'
    });
  }
  
  if (complexityLevel < 0.4) {
    // Minimal plan for simpler cases
    planContexts.push({
      name: 'Essential Care Plan',
      description: `Focused on core needs for ${criteria.goal || 'your health'}.`,
      primaryFocus: criteria.goal || 'Essential Care',
      serviceCount: Math.min(2, categories.length),
      intensity: 'light',
      location: criteria.location || 'Your area',
      isRemote: preferOnline,
      duration: 'short-term'
    });
  }
  
  // Create plans from contexts
  const plans = planContexts.map(context => {
    const services = categories.slice(0, context.serviceCount);
    const professionals = services.map(category => 
      getSuggestedProfessionals(category, 1, preferOnline, criteria.location)
    ).flat();
    
    const serviceInfos = getServiceDescriptions(services);
    
    const plan: AIHealthPlan = {
      id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: context.name,
      description: context.description,
      goal: criteria.goal || 'Improve health',
      primaryFocus: context.primaryFocus,
      complexity: complexityLevel,
      recommendedServices: services,
      serviceDescriptions: serviceInfos,
      suggestedProfessionals: professionals,
      expectedDuration: context.duration === 'short-term' ? '4-6 weeks' : 
                        context.duration === 'medium-term' ? '2-3 months' : 
                        '4-6 months',
      matchScore: 0.7 + (Math.random() * 0.2), // Base match score
      intensity: context.intensity
    };
    
    return plan;
  });
  
  // Sort plans by match score and return
  return plans.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}
