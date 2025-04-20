import { AIHealthPlan, Practitioner, ServiceCategory } from "@/types";
import { PRACTITIONERS } from "@/data/mockData";
import { PlanContext, ServiceAllocation } from "./types";
import { CONDITION_TO_SERVICES, SERVICE_CONFIGS_BY_BUDGET } from "./serviceMappings";
import { PRICE_RANGES, determineBudgetTier } from "./budgetConfig";

export const generatePlan = (context: PlanContext): AIHealthPlan => {
  const config = SERVICE_CONFIGS_BY_BUDGET[context.budgetTier.name];
  const services = determineRequiredServices(context, config.allocations);
  
  return {
    id: `plan-${Date.now()}`,
    name: generatePlanName(context),
    description: generatePlanDescription(context),
    services: allocateServices(services, context),
    totalCost: calculateTotalCost(services),
    planType: determinePlanType(context),
    timeFrame: determineTimeFrame(context)
  };
};

const determineRequiredServices = (
  context: PlanContext,
  allocations: ServiceAllocation[]
): ServiceAllocation[] => {
  let services: ServiceAllocation[] = [];

  if (context.medicalConditions && context.medicalConditions.length > 0) {
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

  if (services.length === 0) {
    services = allocations;
  }

  return services;
};

const allocateServices = (
  services: ServiceAllocation[],
  context: PlanContext
): AIHealthPlan['services'] => {
  const allocatedServices: AIHealthPlan['services'] = [];
  let remainingBudget = context.budget;

  services.forEach(service => {
    const priceRange = PRICE_RANGES[service.type][context.budgetTier.name];
    const isHighEnd = context.budgetTier.name === 'high' || service.priority === 1;
    const sessionPrice = isHighEnd ? priceRange.highEnd : priceRange.affordable;
    const maxSessions = context.budgetTier.maxSessions;
    const percentageOfBudget = service.percentage / 100;
    const budgetForService = context.budget * percentageOfBudget;
    const possibleSessions = Math.floor(budgetForService / sessionPrice);
    const sessions = Math.min(possibleSessions, maxSessions);

    if (sessions > 0) {
      allocatedServices.push({
        type: service.type,
        price: sessionPrice,
        sessions: sessions,
        description: generateServiceDescription(service.type, isHighEnd),
        recommendedPractitioners: getSuitablePractitioners(
          service.type,
          context.goal,
          context.location,
          context.preferOnline,
          sessionPrice
        )
      });
      remainingBudget -= sessionPrice * sessions;
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
  const descriptions: Record<ServiceCategory, { affordable: string; highEnd: string }> = {
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
  };

  return isHighEnd ? descriptions[serviceType].highEnd : descriptions[serviceType].affordable;
};

const calculateTotalCost = (services: AIHealthPlan['services']): number => {
  return services.reduce((sum, service) => sum + (service.price * service.sessions), 0);
};

const generatePlanName = (context: PlanContext): string => {
  return `Customized ${context.goal || 'Wellness'} Plan`;
};

const generatePlanDescription = (context: PlanContext): string => {
  return `A personalized plan to help you achieve your ${context.goal || 'wellness'} goals, tailored to your budget and preferences.`;
};

const determinePlanType = (context: PlanContext): AIHealthPlan['planType'] => {
  if (context.budgetTier.name === 'low') return 'best-fit';
  if (context.medicalConditions.length > 0) return 'high-impact';
  return 'progressive';
};

const determineTimeFrame = (context: PlanContext): string => {
  return '3 months';
};
