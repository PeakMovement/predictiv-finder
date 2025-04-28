import { AIHealthPlan, Practitioner, ServiceCategory } from "@/types";
import { PRACTITIONERS } from "@/data/mockData";
import { COACHES } from "@/data/practitioners/coaches";
import { PlanContext, ServiceAllocation } from "./types";
import { CONDITION_TO_SERVICES, SERVICE_CONFIGS_BY_BUDGET } from "./serviceMappings";
import { filterByLocation } from "./locationFilter";
import { distributeSessionsByBudget } from "./sessionCalculator";

// Create a combined practitioners array that includes coaches
const ALL_PRACTITIONERS = [...PRACTITIONERS, ...COACHES];

export const generatePlan = (context: PlanContext): AIHealthPlan => {
  const config = SERVICE_CONFIGS_BY_BUDGET[context.budgetTier.name];
  const services = determineRequiredServices(context, config.allocations);
  
  return {
    id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: generatePlanName(context),
    description: generatePlanDescription(context),
    services: allocateServices(services, context),
    totalCost: calculateTotalCost(allocateServices(services, context)),
    planType: determinePlanType(context),
    timeFrame: determineTimeFrame(context)
  };
};

const determineRequiredServices = (
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

  if (context.goal) {
    // Use the imported functions directly
    // We need to handle this differently - removing the call that's causing issues
    
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

const allocateServices = (
  services: ServiceAllocation[],
  context: PlanContext
): AIHealthPlan['services'] => {
  const allocatedServices: AIHealthPlan['services'] = [];
  
  // Enhanced service distribution that ensures balanced allocation for multi-condition scenarios
  let serviceDistribution = distributeSessionsByBudget(
    context.budget,
    services.map(s => ({ type: s.type, priority: s.priority }))
  );

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
          context.budgetTier.name === 'high',
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
            context.budgetTier.name === 'high',
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

const getSuitablePractitioners = (
  serviceCategory: ServiceCategory,
  goal?: string,
  location?: string,
  preferOnline?: boolean,
  budget?: number
): Practitioner[] => {
  let practitioners = PRACTITIONERS.filter(p => p.serviceType === serviceCategory);
  
  if (location) {
    practitioners = practitioners.filter(p =>
      p.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  if (preferOnline !== undefined) {
    practitioners = practitioners.filter(p => p.isOnline === preferOnline);
  }
  
  if (goal) {
    practitioners = practitioners.sort((a, b) => {
      const aRelevance = a.serviceTags.some(tag =>
        goal.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(goal.toLowerCase())
      ) ? 1 : 0;
      
      const bRelevance = b.serviceTags.some(tag =>
        goal.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(goal.toLowerCase())
      ) ? 1 : 0;
      
      return bRelevance - aRelevance;
    });
  }
  
  practitioners = practitioners.sort((a, b) => b.rating - a.rating);
  
  return practitioners.slice(0, 3);
};

const generateServiceDescription = (
  serviceType: string, 
  isHighEnd: boolean,
  isKneePainWithRace: boolean = false,
  medicalConditions: string[] = []
): string => {
  // Special case descriptions for knee pain + race preparation
  if (isKneePainWithRace) {
    switch (serviceType) {
      case 'physiotherapist':
        return isHighEnd 
          ? 'Specialized knee rehabilitation focused on running biomechanics and race-specific demands.' 
          : 'Targeted knee therapy to support safe race preparation and running mechanics.';
      case 'coaching':
        return isHighEnd 
          ? 'Personalized race training plan designed to accommodate knee limitations while optimizing performance.' 
          : 'Modified race preparation coaching that respects knee recovery needs.';
      case 'personal-trainer':
        return isHighEnd 
          ? 'Customized strength program focusing on knee stability, running economy, and race-specific preparation.' 
          : 'Knee-friendly training sessions that support your race goals.';
    }
  }
  
  // Special case for any back pain condition
  const hasBackPain = medicalConditions.some(c => c.toLowerCase().includes('back') && c.toLowerCase().includes('pain'));
  if (hasBackPain) {
    switch (serviceType) {
      case 'physiotherapist':
        return isHighEnd 
          ? 'Comprehensive back assessment with specialized manual therapy and movement correction.' 
          : 'Back pain treatment with targeted exercises for relief and functional improvement.';
      case 'personal-trainer':
        return isHighEnd 
          ? 'Personalized training program with core stability focus to support back health.' 
          : 'Back-safe exercise sessions to build strength without aggravating pain.';
    }
  }
  
  // Special case for anxiety
  const hasAnxiety = medicalConditions.some(c => c.toLowerCase().includes('anxiety'));
  if (hasAnxiety) {
    switch (serviceType) {
      case 'coaching':
        return isHighEnd 
          ? 'Holistic coaching focused on mental wellness techniques and anxiety management strategies.' 
          : 'Supportive coaching sessions to develop coping skills for anxiety.';
      case 'dietician':
        return isHighEnd 
          ? 'Specialized nutrition plan addressing the connection between diet, mood, and anxiety.' 
          : 'Diet guidance to support mental wellbeing and reduce anxiety triggers.';
    }
  }

  // Standard descriptions as fallback
  const descriptions: Record<string, { affordable: string; highEnd: string }> = {
    'dietician': {
      affordable: 'Basic dietary advice and meal planning.',
      highEnd: 'Comprehensive nutritional assessment and personalized meal plans.'
    },
    'personal-trainer': {
      affordable: 'Group fitness sessions focusing on strength and endurance.',
      highEnd: 'Personalized training sessions with tailored exercise programs.'
    },
    'physiotherapist': {
      affordable: 'Standard physiotherapy sessions for rehabilitation.',
      highEnd: 'Advanced physiotherapy with specialized manual therapy.'
    },
    'cardiology': {
      affordable: 'Basic cardiac health check-up.',
      highEnd: 'Comprehensive cardiac evaluation with advanced diagnostics.'
    },
    'endocrinology': {
      affordable: 'Initial consultation for hormonal imbalances.',
      highEnd: 'Detailed endocrine assessment and personalized treatment plans.'
    },
    'internal-medicine': {
      affordable: 'General internal medicine consultation.',
      highEnd: 'Specialized internal medicine consultation with comprehensive testing.'
    },
    'gastroenterology': {
      affordable: 'Standard digestive health assessment.',
      highEnd: 'Advanced gastroenterological consultation with specialized treatment plan.'
    },
    'coaching': {
      affordable: 'Group coaching session with technique guidance and motivation',
      highEnd: 'Private coaching with personalized training plan and performance analysis'
    },
    'family-medicine': {
      affordable: "Clinical consultation with basic health assessment",
      highEnd: "Comprehensive medical evaluation with detailed health recommendations"
    },
    'biokineticist': {
      affordable: "Basic movement and biomechanical assessment",
      highEnd: "Advanced movement analysis with personalized exercise prescription"
    },
    'pediatrics': {
      affordable: "Standard pediatric health check-up",
      highEnd: "Comprehensive pediatric assessment with developmental evaluation"
    },
    'dermatology': {
      affordable: "Basic skin assessment and care recommendations",
      highEnd: "Advanced dermatological evaluation with specialized treatment"
    },
    'orthopedics': {
      affordable: "Standard orthopedic consultation",
      highEnd: "Comprehensive orthopedic evaluation with specialized treatment"
    },
    'neurology': {
      affordable: "Basic neurological check-up",
      highEnd: "Comprehensive neurological assessment with advanced diagnostics"
    },
    'obstetrics-gynecology': {
      affordable: "Standard gynecological check-up",
      highEnd: "Comprehensive women's health assessment with specialized care"
    },
    'emergency-medicine': {
      affordable: "Basic urgent care assessment",
      highEnd: "Comprehensive emergency medical evaluation"
    },
    'psychiatry': {
      affordable: "Initial mental health consultation",
      highEnd: "Comprehensive psychiatric evaluation with personalized treatment plan"
    },
    'anesthesiology': {
      affordable: "Standard pre-procedure assessment",
      highEnd: "Comprehensive anesthetic evaluation and pain management"
    },
    'urology': {
      affordable: "Basic urological health check-up",
      highEnd: "Comprehensive urological assessment with specialized treatment"
    },
    'oncology': {
      affordable: "Initial cancer screening consultation",
      highEnd: "Comprehensive oncological evaluation with personalized treatment plan"
    },
    'neurosurgery': {
      affordable: "Initial neurosurgical consultation",
      highEnd: "Comprehensive neurosurgical evaluation with specialized treatment"
    },
    'infectious-disease': {
      affordable: "Basic infectious disease screening",
      highEnd: "Comprehensive infectious disease assessment with specialized treatment"
    },
    'radiology': {
      affordable: "Standard imaging assessment",
      highEnd: "Advanced imaging with specialized interpretation"
    },
    'geriatric-medicine': {
      affordable: "Basic elder care consultation",
      highEnd: "Comprehensive geriatric assessment with specialized care plan"
    },
    'plastic-surgery': {
      affordable: "Initial cosmetic consultation",
      highEnd: "Comprehensive aesthetic evaluation with personalized treatment plan"
    },
    'rheumatology': {
      affordable: "Basic rheumatological check-up",
      highEnd: "Comprehensive rheumatological assessment with specialized treatment"
    },
    'pain-management': {
      affordable: "Basic pain assessment and treatment",
      highEnd: "Comprehensive pain evaluation with multimodal treatment plan"
    }
  };

  return isHighEnd ? 
    descriptions[serviceType]?.highEnd || "Premium specialized service" : 
    descriptions[serviceType]?.affordable || "Standard service";
};

const calculateTotalCost = (services: AIHealthPlan['services']): number => {
  return services.reduce((total, service) => total + (service.price * service.sessions), 0);
};

const generatePlanName = (context: PlanContext): string => {
  const budgetTierPrefix = `${context.budgetTier.name.charAt(0).toUpperCase() + context.budgetTier.name.slice(1)} Budget:`;
  
  // Special case for knee pain + race preparation
  const hasKneePain = context.medicalConditions?.some(c => 
    c.toLowerCase().includes('knee') && c.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = context.goal?.toLowerCase().includes('race') || 
                      context.goal?.toLowerCase().includes('run') ||
                      context.medicalConditions?.some(c => c.toLowerCase().includes('race preparation'));
  
  if (hasKneePain && hasRacePrep) {
    return `${budgetTierPrefix} Knee-Safe Race Preparation Plan`;
  }
  
  // Special cases for specific conditions
  const hasAnxiety = context.medicalConditions?.some(c => c.toLowerCase().includes('anxiety'));
  const hasNutrition = context.medicalConditions?.some(c => c.toLowerCase().includes('nutrition'));
  
  if (hasAnxiety && hasNutrition && hasRacePrep) {
    return `${budgetTierPrefix} Holistic Race Preparation Plan`;
  }
  
  if (hasAnxiety && hasNutrition) {
    return `${budgetTierPrefix} Nutrition & Mental Wellness Plan`;
  }
  
  if (hasAnxiety) {
    return `${budgetTierPrefix} Anxiety Management Plan`;
  }
  
  if (hasRacePrep) {
    return `${budgetTierPrefix} Race Training Plan`;
  }
  
  // Other conditions
  if (context.medicalConditions?.some(c => c.toLowerCase().includes('shoulder'))) {
    return `${budgetTierPrefix} Shoulder Recovery Plan`;
  }
  
  if (context.medicalConditions?.some(c => c.toLowerCase().includes('back'))) {
    return `${budgetTierPrefix} Back Pain Relief Plan`;
  }
  
  return "Customized Wellness Plan";
};

const generatePlanDescription = (context: PlanContext): string => {
  // Special case descriptions for common combined conditions
  const hasKneePain = context.medicalConditions?.some(c => 
    c.toLowerCase().includes('knee') && c.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = context.goal?.toLowerCase().includes('race') || 
                      context.goal?.toLowerCase().includes('run') ||
                      context.medicalConditions?.some(c => c.toLowerCase().includes('race preparation'));
  
  if (hasKneePain && hasRacePrep) {
    return "A balanced plan focusing on knee rehabilitation while preparing you for your race. " +
           "Includes modified training approaches that protect your knee while building necessary fitness.";
  }
  
  // Default description
  return "A personalized wellness plan designed for your specific needs and goals.";
};

const determinePlanType = (context: PlanContext): AIHealthPlan['planType'] => {
  const hasRacePrep = context.goal?.toLowerCase().includes('race') || 
                      context.goal?.toLowerCase().includes('run') ||
                      context.medicalConditions?.some(c => c.toLowerCase().includes('race preparation'));
                      
  if (hasRacePrep) {
    return 'progressive';
  }
  
  const hasRehabNeeds = context.medicalConditions?.some(c => 
    c.toLowerCase().includes('pain') || c.toLowerCase().includes('injury')
  );
  
  if (hasRehabNeeds) {
    return 'high-impact';
  }
  
  return 'best-fit';
};

const determineTimeFrame = (context: PlanContext): string => {
  // Special case for knee pain + race prep
  const hasKneePain = context.medicalConditions?.some(c => 
    c.toLowerCase().includes('knee') && c.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = context.goal?.toLowerCase().includes('race') || 
                      context.goal?.toLowerCase().includes('run') ||
                      context.medicalConditions?.some(c => c.toLowerCase().includes('race preparation'));
  
  if (hasKneePain && hasRacePrep) {
    // Check if there's a specific timeframe mentioned for the race
    const raceMatch = context.goal?.match(/(\d+)\s*(weeks?|months?|days?)(.*?)(race|run|marathon|event)/i) ||
                       context.goal?.match(/(race|run|marathon|event)(.*?)(\d+)\s*(weeks?|months?|days?)/i);
                    
    if (raceMatch) {
      const amount = parseInt(raceMatch[1] || raceMatch[3], 10);
      const unit = (raceMatch[2] || raceMatch[4]).toLowerCase();
      return `${amount} ${unit}`;
    }
    
    // Default timeframe for knee pain + race prep
    return "8 weeks"; // Standard combined rehab + training timeframe
  }
  
  // For standard knee pain without race prep
  if (hasKneePain) {
    return "6 weeks"; // Standard knee rehabilitation timeframe
  }
  
  // For race prep without injury
  if (hasRacePrep) {
    return "4 weeks"; // Standard race preparation timeframe
  }
  
  return "8 weeks"; // Default timeframe
};
