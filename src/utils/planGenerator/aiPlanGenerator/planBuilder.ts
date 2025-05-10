import { ServiceCategory } from "@/types";
import { generatePlanName, generatePlanDescription } from "./planNaming";
import { optimizeServiceAllocation } from "../budgetHandling/enhancedBudgetHandler";
import { BASELINE_COSTS } from "../types";

/**
 * Builds a health plan based on service options, preferred services, and budget.
 */
function buildPlan(serviceOptions: any, preferredServices: ServiceCategory | ServiceCategory[], budget: number) {
  // Convert string to array if needed
  const services = Array.isArray(preferredServices) ? preferredServices : [preferredServices];

  const planName = generatePlanName(serviceOptions.primaryCondition, services, budget);
  const planDescription = generatePlanDescription(serviceOptions.primaryCondition, serviceOptions.goals, budget);

  // Define max sessions mapping for all service categories
  const maxSessions: Record<ServiceCategory, number> = Object.keys(BASELINE_COSTS).reduce((acc, key) => {
    const serviceCategory = key as ServiceCategory;
    const isHighBudget = budget > 2000;

    // Set default values for all categories
    acc[serviceCategory] = isHighBudget ? 2 : 1;

    // Override values for specific categories
    if (serviceCategory === 'personal-trainer') acc[serviceCategory] = isHighBudget ? 8 : 4;
    if (serviceCategory === 'dietician') acc[serviceCategory] = isHighBudget ? 4 : 2;
    if (serviceCategory === 'physiotherapist') acc[serviceCategory] = isHighBudget ? 6 : 3;
    if (serviceCategory === 'family-medicine') acc[serviceCategory] = isHighBudget ? 2 : 1;
    if (serviceCategory === 'coaching') acc[serviceCategory] = isHighBudget ? 4 : 2;
    if (serviceCategory === 'psychiatry') acc[serviceCategory] = isHighBudget ? 3 : 2;
    if (serviceCategory === 'biokineticist') acc[serviceCategory] = isHighBudget ? 3 : 2;
    if (serviceCategory === 'pain-management') acc[serviceCategory] = isHighBudget ? 3 : 2;

    return acc;
  }, {} as Record<ServiceCategory, number>);

  // Generate services based on optimized allocation
  const allocations = optimizeServiceAllocation(
    budget,
    services,
    serviceOptions.servicePriorities,
    maxSessions,
    serviceOptions.isStrictBudget
  );

  // Create services for the plan
  const planServices = allocations.map(allocation => {
    return {
      type: allocation.type,
      sessions: allocation.sessions,
      price: allocation.costPerSession,
      description: generateServiceDescription(allocation.type, serviceOptions.primaryCondition, budget > 2000)
    };
  });

  // Calculate total cost
  const totalCost = allocations.reduce((sum, allocation) => sum + allocation.totalCost, 0);

  return {
    id: `plan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: planName,
    description: planDescription,
    services: planServices,
    totalCost,
    planType: 'best-fit',
    timeFrame: `${serviceOptions.timeframeWeeks} weeks`
  };
}

/**
 * Generates a service description based on service type and context
 */
function generateServiceDescription(type: ServiceCategory, condition: string, isPremium: boolean): string {
  // Create a complete mapping for all service categories
  const allCategories = Object.keys(BASELINE_COSTS) as ServiceCategory[];

  // Create base descriptions with default values for all categories
  const baseDescriptions = allCategories.reduce((acc, category) => {
    acc[category] = {
      standard: "Professional healthcare service",
      premium: "Premium professional healthcare service"
    };
    return acc;
  }, {} as Record<ServiceCategory, { standard: string, premium: string }>);

  // Override with specific descriptions for common categories
  Object.assign(baseDescriptions, {
    'personal-trainer': {
      standard: "Guided exercise sessions tailored to your fitness level",
      premium: "Personalized training program with advanced exercise techniques"
    },
    'dietician': {
      standard: "Nutritional guidance with meal planning support",
      premium: "Comprehensive nutritional assessment with customized meal plans"
    },
    'physiotherapist': {
      standard: "Focused treatment to improve movement and function",
      premium: "Advanced rehabilitation with specialized manual techniques"
    },
    'coaching': {
      standard: "Supportive guidance for achieving your health goals",
      premium: "Strategic coaching with performance optimization techniques"
    },
    'psychiatry': {
      standard: "Professional mental health support and treatment",
      premium: "Comprehensive mental wellness program with personalized strategies"
    },
    'family-medicine': {
      standard: "General healthcare consultation and basic assessment",
      premium: "Thorough medical evaluation with ongoing monitoring"
    },
    'gastroenterology': {
      standard: "Digestive health assessment and treatment recommendations",
      premium: "Specialized gastrointestinal evaluation and management plan"
    },
    'biokineticist': {
      standard: "Movement assessment and personalized exercise plan",
      premium: "Advanced biomechanical analysis with personalized corrective program"
    },
    'pain-management': {
      standard: "Pain assessment and relief strategies",
      premium: "Comprehensive pain management program with integrated techniques"
    }
  });

  // Get base description based on service type and premium level
  const baseDescription = baseDescriptions[type][isPremium ? 'premium' : 'standard'];

  // Customize further based on condition
  if (condition.includes("knee") && type === 'physiotherapist') {
    return isPremium ?
      "Specialized knee rehabilitation with advanced techniques and progressive exercises" :
      "Targeted knee therapy to improve movement and reduce pain";
  } else if (condition.includes("back") && type === 'physiotherapist') {
    return isPremium ?
      "Comprehensive back assessment with specialized manual therapy and corrective exercises" :
      "Back pain treatment with personalized exercises and techniques";
  } else if (condition.includes("weight") && type === 'dietician') {
    return isPremium ?
      "Personalized weight management nutrition plan with detailed meal strategies" :
      "Nutritional guidance focused on sustainable weight management";
  } else if (condition.includes("race") && type === 'personal-trainer') {
    return isPremium ?
      "Specialized race preparation program with periodized training and performance analysis" :
      "Structured training plans to prepare you for your upcoming race";
  }

  return baseDescription;
}

export { buildPlan };
