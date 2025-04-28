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
  
  const serviceDistribution = distributeSessionsByBudget(
    context.budget,
    services.map(s => ({ type: s.type, priority: s.priority }))
  );

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

    // Match practitioners to goals
    if (context.goal) {
      const goalLower = context.goal.toLowerCase();
      availablePractitioners = availablePractitioners.sort((a, b) => {
        // Check if their tags match the user's goals
        const aRelevance = a.serviceTags.some(tag => 
          goalLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes('weight') || 
          tag.toLowerCase().includes('tone') || tag.toLowerCase().includes('fitness')
        ) ? 1 : 0;
        
        const bRelevance = b.serviceTags.some(tag => 
          goalLower.includes(tag.toLowerCase()) || tag.toLowerCase().includes('weight') || 
          tag.toLowerCase().includes('tone') || tag.toLowerCase().includes('fitness')
        ) ? 1 : 0;
        
        if (aRelevance !== bRelevance) return bRelevance - aRelevance;
        
        // If relevance is the same, sort by rating
        return b.rating - a.rating;
      });
    }

    // If we found practitioners for this service
    if (availablePractitioners.length > 0) {
      // Take the best matches
      const recommendedPractitioners = availablePractitioners.slice(0, 3);
      
      allocatedServices.push({
        type: service.type,
        price: sessionAllocation.costPerSession,
        sessions: sessionAllocation.sessions,
        description: generateServiceDescription(service.type, context.budgetTier.name === 'high'),
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
          description: generateServiceDescription(service.type, context.budgetTier.name === 'high'),
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

const generateServiceDescription = (serviceType: string, isHighEnd: boolean): string => {
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
  return "Customized Wellness Plan";
};

const generatePlanDescription = (context: PlanContext): string => {
  return "A personalized wellness plan designed for your specific needs and goals.";
};

const determinePlanType = (context: PlanContext): AIHealthPlan['planType'] => {
  return 'best-fit';
};

const determineTimeFrame = (context: PlanContext): string => {
  return "8 weeks";
};
