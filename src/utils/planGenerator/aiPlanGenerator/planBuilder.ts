
import { UserCriteria, AIHealthPlan, PlanContext, ServiceCategory } from '@/types';
import { getServiceDescription } from './serviceDescriptions';

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
    // Properties for internal use
    goal: criteria.goal,
    medicalConditions: criteria.conditions,
    location: criteria.location,
    preferOnline: preferOnline,
    isRemote: preferOnline,
    budget: criteria.budget?.monthly,
    
    // Fields needed for generation logic
    serviceCount: Math.min(3, categories.length),
    intensity: 'standard',
    duration: 'medium-term'
  });
  
  // For more complex cases, add alternative plans
  if (complexityLevel > 0.6) {
    // Intensive plan for complex cases
    planContexts.push({
      // Properties for internal use
      goal: criteria.goal,
      medicalConditions: criteria.conditions,
      location: criteria.location,
      preferOnline: preferOnline,
      isRemote: preferOnline,
      budget: criteria.budget?.monthly,
      
      // Fields needed for generation logic
      serviceCount: Math.min(5, categories.length + 1),
      intensity: 'intensive',
      duration: 'long-term'
    });
  }
  
  if (complexityLevel < 0.4) {
    // Minimal plan for simpler cases
    planContexts.push({
      // Properties for internal use
      goal: criteria.goal,
      medicalConditions: criteria.conditions,
      location: criteria.location,
      preferOnline: preferOnline,
      isRemote: preferOnline,
      budget: criteria.budget?.monthly,
      
      // Fields needed for generation logic
      serviceCount: Math.min(2, categories.length),
      intensity: 'light',
      duration: 'short-term'
    });
  }
  
  // Create plans from contexts
  const plans = planContexts.map(context => {
    const services = categories.slice(0, context.serviceCount || 3);
    const professionals = services.map(category => {
      // Create simple placeholder professionals
      return {
        id: `prof-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: `${category} Specialist`,
        specialty: category,
        isOnline: preferOnline
      };
    }).flat();
    
    // Create service descriptions
    const serviceInfos = services.map(service => ({
      serviceType: service,
      description: getServiceDescription(service as ServiceCategory)
    }));
    
    const planName = `${context.intensity === 'intensive' ? 'Intensive' : 
                      (context.intensity === 'light' ? 'Essential' : 'Standard')} Care Plan`;
    
    const planDescription = `${context.intensity === 'intensive' ? 'Comprehensive' :
                              (context.intensity === 'light' ? 'Focused' : 'Balanced')} 
                              approach for ${criteria.goal || 'your health needs'}.`;
                              
    const timeFrame = context.duration === 'short-term' ? '4-6 weeks' : 
                     context.duration === 'medium-term' ? '2-3 months' : 
                     '4-6 months';
                     
    const primaryFocus = criteria.goal || 'General Health';
    
    const plan: AIHealthPlan = {
      id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: planName,
      description: planDescription,
      services: services.map(serviceType => ({
        type: serviceType as ServiceCategory,
        price: Math.floor(Math.random() * 500) + 500, // Random price between 500-1000
        sessions: Math.floor(Math.random() * 5) + 3, // 3-8 sessions
        description: getServiceDescription(serviceType as ServiceCategory)
      })),
      totalCost: Math.floor(Math.random() * 5000) + 2000, // Random total cost
      planType: 'best-fit',
      timeFrame: timeFrame,
      matchScore: 0.7 + (Math.random() * 0.2), // Base match score
      intensity: context.intensity || 'standard',
      recommendedServices: services as ServiceCategory[],
      serviceDescriptions: serviceInfos,
      suggestedProfessionals: professionals,
      goal: criteria.goal,
      primaryFocus: primaryFocus
    };
    
    return plan;
  });
  
  // Sort plans by match score and return
  return plans.sort((a, b) => ((b.matchScore || 0) - (a.matchScore || 0)));
}
