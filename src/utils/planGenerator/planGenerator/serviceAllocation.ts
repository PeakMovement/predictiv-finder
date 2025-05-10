import { AIHealthPlan, PlanContext, Practitioner, ServiceAllocation, ServiceCategory } from "@/types";
import { PRACTITIONERS } from "@/data/mockData";
import { COACHES } from "@/data/practitioners/coaches";
import { CONDITION_TO_SERVICES } from "../serviceMappings";
import { filterByLocation } from "../locationFilter";
import { distributeSessionsByBudget } from "../sessionCalculator";
import { generateServiceDescription } from "./serviceDescription";

// Create a combined practitioners array that includes coaches
const ALL_PRACTITIONERS = [...PRACTITIONERS, ...COACHES];

/**
 * Determines which services are required based on the user's context
 */
export const determineRequiredServices = (
  context: PlanContext,
  allocations: ServiceAllocation[]
): ServiceAllocation[] => {
  let services: ServiceAllocation[] = [];

  // Special case handling for combined conditions
  const hasKneePainWithRace = context.medicalConditions?.some(c => 
    c.toLowerCase().includes('knee') && c.toLowerCase().includes('pain')
  ) && (
    context.goal?.toLowerCase().includes('race') || 
    context.goal?.toLowerCase().includes('run') ||
    context.medicalConditions?.some(c => c.toLowerCase().includes('race preparation'))
  );
  
  if (hasKneePainWithRace) {
    console.log("Detected special case: knee pain with race preparation");
    
    // We need both physiotherapy and coaching for this case
    const physiotherapy = allocations.find(a => a.type === 'physiotherapist');
    const coaching = allocations.find(a => a.type === 'coaching');
    const training = allocations.find(a => a.type === 'personal-trainer');
    
    if (physiotherapy) {
      services.push({...physiotherapy, priority: 0.9}); // Slightly reduce priority to allow other services
    }
    
    if (coaching) {
      services.push({...coaching, priority: 1.0}); // Give coaching high priority for race prep
    }
    
    if (training) {
      services.push({...training, priority: 0.95}); // High priority for personal training
    }
    
    // We can return early since we've handled this special case
    return services;
  }
  
  // Special case for anxiety + nutrition + race preparation
  const hasAnxietyNutritionRace = (
    (context.goal?.toLowerCase().includes('anxiety') || context.medicalConditions?.some(c => c.toLowerCase().includes('anxiety'))) &&
    (context.goal?.toLowerCase().includes('eat') || context.goal?.toLowerCase().includes('nutrition') || 
     context.medicalConditions?.some(c => c.toLowerCase().includes('nutrition'))) &&
    (context.goal?.toLowerCase().includes('race') || context.goal?.toLowerCase().includes('run') || 
     context.medicalConditions?.some(c => c.toLowerCase().includes('race')))
  );
  
  if (hasAnxietyNutritionRace) {
    console.log("Detected special case: anxiety + nutrition + race preparation");
    
    // We need dietician, coaching, and personal trainer
    const dietician = allocations.find(a => a.type === 'dietician');
    const coaching = allocations.find(a => a.type === 'coaching');
    const training = allocations.find(a => a.type === 'personal-trainer');
    
    if (dietician) {
      services.push({...dietician, priority: 1.0}); // Highest priority for nutrition
    }
    
    if (coaching) {
      services.push({...coaching, priority: 0.95}); // High priority for anxiety support
    }
    
    if (training) {
      services.push({...training, priority: 0.9}); // Also important for race prep
    }
    
    // We can return early since we've handled this special case
    return services;
  }

  // Handle other cases by checking goals and medical conditions
  if (context.goal) {
    // If we have medical conditions, use those to determine services
    if (context.medicalConditions?.length > 0) {
      context.medicalConditions.forEach(condition => {
        const conditionServices = CONDITION_TO_SERVICES[condition];
        if (conditionServices) {
          conditionServices.forEach(serviceType => {
            const allocation = allocations.find(a => a.type === serviceType);
            if (allocation && !services.some(s => s.type === serviceType)) {
              services.push(allocation);
            }
          });
        }
      });
    }
    
    // If goal mentions specific keywords, add relevant services
    if (context.goal.toLowerCase().includes('pain') || 
        context.goal.toLowerCase().includes('injury')) {
      const physiotherapy = allocations.find(a => a.type === 'physiotherapist');
      if (physiotherapy && !services.some(s => s.type === 'physiotherapist')) {
        services.push(physiotherapy);
      }
    }
    
    if (context.goal.toLowerCase().includes('diet') || 
        context.goal.toLowerCase().includes('nutrition') || 
        context.goal.toLowerCase().includes('eat')) {
      const dietician = allocations.find(a => a.type === 'dietician');
      if (dietician && !services.some(s => s.type === 'dietician')) {
        services.push(dietician);
      }
    }
    
    if (context.goal.toLowerCase().includes('train') || 
        context.goal.toLowerCase().includes('exercise') || 
        context.goal.toLowerCase().includes('fitness')) {
      const trainer = allocations.find(a => a.type === 'personal-trainer');
      if (trainer && !services.some(s => s.type === 'personal-trainer')) {
        services.push(trainer);
      }
    }
    
    if (context.goal.toLowerCase().includes('anxiety') || 
        context.goal.toLowerCase().includes('stress') || 
        context.goal.toLowerCase().includes('mental')) {
      const coaching = allocations.find(a => a.type === 'coaching');
      if (coaching && !services.some(s => s.type === 'coaching')) {
        services.push(coaching);
      }
    }
    
    // If race or running is mentioned, ensure proper coaching
    if (context.goal.toLowerCase().includes('race') || 
        context.goal.toLowerCase().includes('marathon') ||
        context.goal.toLowerCase().includes('run')) {
      const coaching = allocations.find(a => a.type === 'coaching');
      const trainer = allocations.find(a => a.type === 'personal-trainer');
      
      if (coaching && !services.some(s => s.type === 'coaching')) {
        services.push({...coaching, priority: 0.95}); // Higher priority for race preparation
      }
      
      if (trainer && !services.some(s => s.type === 'personal-trainer')) {
        services.push({...trainer, priority: 0.9});
      }
    }
  }

  // Handle other conditions and default cases
  if (services.length === 0 && context.medicalConditions?.length > 0) {
    context.medicalConditions.forEach(condition => {
      const conditionServices = CONDITION_TO_SERVICES[condition];
      if (conditionServices) {
        conditionServices.forEach(serviceType => {
          const allocation = allocations.find(a => a.type === serviceType);
          if (allocation && !services.some(s => s.type === serviceType)) {
            services.push(allocation);
          }
        });
      }
    });
  }

  // If no specific services were determined, use default allocations
  if (services.length === 0) {
    services = allocations;
  }
  
  // Always include personal trainer for fitness/weight loss goals
  if (context.goal?.toLowerCase().includes('weight') || 
      context.goal?.toLowerCase().includes('tone') || 
      context.goal?.toLowerCase().includes('fitness') ||
      context.medicalConditions.includes('weight loss') ||
      context.medicalConditions.includes('fitness goals')) {
    
    const hasPersonalTrainer = services.some(s => s.type === 'personal-trainer');
    
    if (!hasPersonalTrainer) {
      const trainerAllocation = allocations.find(a => a.type === 'personal-trainer');
      if (trainerAllocation) {
        services.push(trainerAllocation);
        console.log("Adding personal-trainer because of fitness/weight loss goals");
      }
    }
  }

  return services;
};

/**
 * Allocates services based on requirements and budget
 */
export const allocateServices = (
  services: ServiceAllocation[],
  context: PlanContext
): AIHealthPlan['services'] => {
  const allocatedServices: AIHealthPlan['services'] = [];
  
  // Enhanced service distribution that ensures balanced allocation for multi-condition scenarios
  let serviceDistribution = distributeSessionsByBudget(
    context.budget,
    services.map(s => ({ type: s.type, priority: s.priority }))
  );

  // Handle special cases and allocation
  // Special cases - ensure coaching and physiotherapy get at least one session each
  const hasKneePain = context.medicalConditions?.some(c => 
    c.toLowerCase().includes('knee') && c.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = context.goal?.toLowerCase().includes('race') || 
                      context.goal?.toLowerCase().includes('run') ||
                      context.medicalConditions?.some(c => c.toLowerCase().includes('race preparation'));
  
  if (hasKneePain && hasRacePrep) {
    // For very low budgets, make sure we have at least one session of each critical service
    if (context.budget < 1000) {
      // Get the minimum allocations we need
      const hasPhysiotherapy = serviceDistribution['physiotherapist'] && serviceDistribution['physiotherapist'].sessions > 0;
      const hasCoaching = serviceDistribution['coaching'] && serviceDistribution['coaching'].sessions > 0;
      
      // If we're missing critical services, override the distribution
      if (!hasPhysiotherapy || !hasCoaching) {
        // Calculate an affordable cost per session based on budget
        const affordableSessionCost = Math.floor(context.budget / 2) - 50; // Leave a small buffer
        
        // Create a custom distribution
        serviceDistribution = {
          'physiotherapist': {
            sessions: 1,
            costPerSession: affordableSessionCost,
            totalCost: affordableSessionCost
          },
          'coaching': {
            sessions: 1,
            costPerSession: affordableSessionCost,
            totalCost: affordableSessionCost
          }
        };
        
        console.log("Applied special budget handling for knee pain + race preparation");
      }
    }
  }
  
  services.forEach(service => {
    const sessionAllocation = serviceDistribution[service.type];
    if (!sessionAllocation) return;

    let availablePractitioners = ALL_PRACTITIONERS.filter(p => 
      p.serviceType === service.type
    );

    // Apply filters for location and online preference
    if (context.location) {
      availablePractitioners = filterByLocation(
        availablePractitioners,
        { 
          location: context.location, 
          radius: context.preferOnline ? 'anywhere' : 'nearby' 
        }
      );
    }

    // Add online preference filtering
    if (context.preferOnline !== undefined) {
      availablePractitioners = availablePractitioners.filter(p => 
        p.isOnline === context.preferOnline
      );
    }

    // More practitioner matching logic
    // Enhanced matching - consider both goals and medical conditions
    availablePractitioners = availablePractitioners.sort((a, b) => {
      let aRelevance = 0;
      let bRelevance = 0;
      
      // Check if practitioners have tags relevant to goal
      if (context.goal) {
        const goalLower = context.goal.toLowerCase();
        
        aRelevance += a.serviceTags.some(tag => 
          goalLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes('weight') || 
          tag.toLowerCase().includes('tone') || tag.toLowerCase().includes('fitness')
        ) ? 2 : 0;
        
        bRelevance += b.serviceTags.some(tag => 
          goalLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes('weight') || 
          tag.toLowerCase().includes('tone') || tag.toLowerCase().includes('fitness')
        ) ? 2 : 0;
      }
      
      // Special case for knee pain + race prep
      if (hasKneePain && hasRacePrep) {
        if (service.type === 'physiotherapist') {
          // Prioritize physiotherapists with running or knee specialties
          aRelevance += a.serviceTags.some(tag => 
            tag.toLowerCase().includes('run') || tag.toLowerCase().includes('knee') ||
            tag.toLowerCase().includes('sports')
          ) ? 3 : 0;
          
          bRelevance += b.serviceTags.some(tag => 
            tag.toLowerCase().includes('run') || tag.toLowerCase().includes('knee') ||
            tag.toLowerCase().includes('sports')
          ) ? 3 : 0;
        }
        else if (service.type === 'coaching') {
          // Prioritize coaches who can handle injuries
          aRelevance += a.serviceTags.some(tag => 
            tag.toLowerCase().includes('injury') || tag.toLowerCase().includes('rehab') ||
            tag.toLowerCase().includes('recovery')
          ) ? 3 : 0;
          
          bRelevance += b.serviceTags.some(tag => 
            tag.toLowerCase().includes('injury') || tag.toLowerCase().includes('rehab') ||
            tag.toLowerCase().includes('recovery')
          ) ? 3 : 0;
        }
      }
      
      // Check for medical condition relevance
      if (context.medicalConditions?.length) {
        for (const condition of context.medicalConditions) {
          const condLower = condition.toLowerCase();
          
          aRelevance += a.serviceTags.some(tag => 
            condLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes(condLower)
          ) ? 1 : 0;
          
          bRelevance += b.serviceTags.some(tag => 
            condLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes(condLower)
          ) ? 1 : 0;
        }
      }
      
      if (aRelevance !== bRelevance) return bRelevance - aRelevance;
      
      // If relevance is the same, sort by rating
      return b.rating - a.rating;
    });

    // If we found practitioners for this service
    if (availablePractitioners.length > 0) {
      // Take the best matches
      const recommendedPractitioners = availablePractitioners.slice(0, 3);
      
      allocatedServices.push({
        type: service.type,
        price: sessionAllocation.costPerSession,
        sessions: sessionAllocation.sessions,
        description: generateServiceDescription(
          service.type, 
          context.budgetTier === 'high',
          hasKneePain && hasRacePrep,
          context.medicalConditions
        ),
        recommendedPractitioners: recommendedPractitioners
      });
    } else {
      // Even if we don't find exact matches, include the service with general practitioners
      // Get practitioners of this service type, regardless of other filters
      const generalPractitioners = ALL_PRACTITIONERS.filter(p => p.serviceType === service.type).slice(0, 3);
      
      if (generalPractitioners.length > 0) {
        allocatedServices.push({
          type: service.type,
          price: sessionAllocation.costPerSession,
          sessions: sessionAllocation.sessions,
          description: generateServiceDescription(
            service.type, 
            context.budgetTier === 'high',
            hasKneePain && hasRacePrep,
            context.medicalConditions
          ),
          recommendedPractitioners: generalPractitioners
        });
      }
    }
  });

  return allocatedServices;
};
