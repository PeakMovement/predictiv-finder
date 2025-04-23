
import { AIHealthPlan, Practitioner, ServiceCategory } from "@/types";
import { PRACTITIONERS } from "@/data/mockData";
import { COACHES } from "@/data/practitioners/coaches";
import { PlanContext, ServiceAllocation } from "./types";
import { CONDITION_TO_SERVICES, SERVICE_CONFIGS_BY_BUDGET } from "./serviceMappings";
import { identifySymptoms, getProfessionalsForSymptoms } from "./symptomMapper";
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
    const symptoms = identifySymptoms(context.goal);
    const symptomBasedServices = getProfessionalsForSymptoms(symptoms);
    
    symptomBasedServices.forEach(serviceType => {
      const allocation = allocations.find(a => a.type === serviceType);
      if (allocation && !services.some(s => s.type === serviceType)) {
        services.push(allocation);
      }
    });
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

const generateServiceDescription = (serviceType: ServiceCategory, isHighEnd: boolean): string => {
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
  return services.reduce((sum, service) => sum + (service.price * service.sessions), 0);
};

const generatePlanName = (context: PlanContext): string => {
  if (context.medicalConditions.includes('weight loss') || 
      context.medicalConditions.includes('fitness goals') ||
      (context.goal && (context.goal.includes('weight') || context.goal.includes('tone')))) {
    return `Custom ${context.budgetTier.name.charAt(0).toUpperCase() + context.budgetTier.name.slice(1)} Budget Fitness Plan`;
  }
  
  return `Customized ${context.goal || 'Wellness'} Plan`;
};

const generatePlanDescription = (context: PlanContext): string => {
  if (context.medicalConditions.includes('weight loss') ||
      context.goal?.toLowerCase().includes('weight') ||
      context.goal?.toLowerCase().includes('tone')) {
    return `A personalized plan to help you reach your weight and fitness goals, combining nutrition guidance and effective training strategies.`;
  }
  
  return `A personalized plan to help you achieve your ${context.goal || 'wellness'} goals, tailored to your budget and preferences.`;
};

const determinePlanType = (context: PlanContext): AIHealthPlan['planType'] => {
  // If user has fitness goals like weight loss or toning, make it "progressive"
  if (context.medicalConditions.includes('weight loss') || 
      context.medicalConditions.includes('fitness goals') ||
      (context.goal && (context.goal.includes('weight') || context.goal.includes('tone')))) {
    return 'progressive';
  }
  
  if (context.budgetTier.name === 'low') return 'best-fit';
  if (context.medicalConditions.length > 0) return 'high-impact';
  return 'progressive';
};

const determineTimeFrame = (context: PlanContext): string => {
  // If a specific timeframe is mentioned in the goal, use that
  if (context.goal) {
    const timeMatch = context.goal.match(/(\d+)\s*(weeks|week|months|month|days|day)/i);
    if (timeMatch) {
      const amount = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();
      
      if (unit.includes('week')) {
        return `${amount} week${amount > 1 ? 's' : ''}`;
      } else if (unit.includes('month')) {
        return `${amount} month${amount > 1 ? 's' : ''}`;
      } else if (unit.includes('day')) {
        // Convert days to weeks if more than 14 days
        if (amount > 14) {
          const weeks = Math.ceil(amount / 7);
          return `${weeks} week${weeks > 1 ? 's' : ''}`;
        }
        return `${amount} day${amount > 1 ? 's' : ''}`;
      }
    }
  }
  
  return '3 months';
};
