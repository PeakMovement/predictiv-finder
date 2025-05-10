
import { AIHealthPlan, ServiceCategory } from "@/types";
import { ServiceAllocationItem, PlanContext } from "./types";
import { generatePlan } from "./planGenerator/generatePlan";
import { distributeSessionsByBudget } from "./sessionCalculator";
import { generateUniqueName } from "./namingUtils";

interface ServiceSpecification {
  type: ServiceCategory;
  priority: number;
  minSessions?: number;
  maxSessions?: number;
}

/**
 * Builds a comprehensive health plan combining multiple specialties
 */
export function buildMultidisciplinaryPlan(
  primaryCondition: string,
  serviceCategories: ServiceCategory[],
  context: PlanContext
): AIHealthPlan {
  if (!serviceCategories || serviceCategories.length === 0) {
    return generatePlan(context);
  }
  
  // Create service specifications with priorities
  const serviceSpecs = createMultidisciplinaryServiceSpecs(
    primaryCondition,
    serviceCategories,
    context
  );
  
  // Allocate resources based on service priorities
  const serviceDistribution = distributeSessionsByBudget(
    context.budget,
    serviceSpecs.map(spec => ({
      type: spec.type,
      priority: spec.priority
    }))
  );
  
  // Generate custom plan name and description
  const planName = generateMultidisciplinaryPlanName(primaryCondition, serviceCategories);
  const planDescription = generateMultidisciplinaryPlanDescription(
    primaryCondition,
    serviceCategories,
    context
  );
  
  // Create the plan
  const plan = generatePlan({
    ...context,
    goal: `${primaryCondition} using multidisciplinary approach`
  });
  
  // Override plan name and description
  plan.name = planName;
  plan.description = planDescription;
  
  return plan;
}

/**
 * Creates service specifications with appropriate priorities
 */
function createMultidisciplinaryServiceSpecs(
  primaryCondition: string,
  serviceCategories: ServiceCategory[],
  context: PlanContext
): ServiceSpecification[] {
  // Service priority mappings based on condition
  const servicePriorities: Record<string, Partial<Record<ServiceCategory, number>>> = {
    "knee pain": {
      "physiotherapist": 1.0,
      "orthopedics": 0.8,
      "personal-trainer": 0.6
    },
    "back pain": {
      "physiotherapist": 1.0,
      "chiropractor": 0.8,
      "pain-management": 0.7
    },
    "anxiety": {
      "psychology": 1.0,
      "psychiatry": 0.8,
      "coaching": 0.7
    },
    "weight loss": {
      "dietician": 1.0,
      "personal-trainer": 0.9,
      "coaching": 0.7
    },
    "diabetes": {
      "endocrinology": 1.0,
      "dietician": 0.9,
      "general-practitioner": 0.7
    }
  };
  
  // Default base priority
  const defaultPriority = 0.5;
  
  // Get condition-specific priorities or fall back to default
  const conditionPriorities = servicePriorities[primaryCondition.toLowerCase()] || {};
  
  // Create specs with appropriate priorities
  return serviceCategories.map(category => {
    const priority = conditionPriorities[category] || defaultPriority;
    
    return {
      type: category,
      priority,
      minSessions: 1,
      maxSessions: Math.ceil(priority * 4) // More sessions for higher priority services
    };
  });
}

/**
 * Generates a descriptive name for a multidisciplinary plan
 */
function generateMultidisciplinaryPlanName(
  primaryCondition: string,
  serviceCategories: ServiceCategory[]
): string {
  // Capitalize first letter of condition
  const condition = primaryCondition.charAt(0).toUpperCase() + primaryCondition.slice(1);
  
  if (serviceCategories.length <= 2) {
    // Simple naming for 1-2 services
    const serviceNames = serviceCategories.map(formatServiceName).join(' & ');
    return `${condition} Management: ${serviceNames} Plan`;
  } else {
    // For 3+ services, use a more general name
    return `Comprehensive ${condition} Management Plan`;
  }
}

/**
 * Generates a detailed description for a multidisciplinary plan
 */
function generateMultidisciplinaryPlanDescription(
  primaryCondition: string,
  serviceCategories: ServiceCategory[],
  context: PlanContext
): string {
  const serviceCount = serviceCategories.length;
  const serviceNames = serviceCategories.map(formatServiceName).join(', ');
  
  let baseDescription = `A personalized plan for ${primaryCondition} combining ${serviceCount} specialties: ${serviceNames}.`;
  
  // Add budget context if available
  if (context.budget) {
    baseDescription += ` Optimized for your budget of R${context.budget}.`;
  }
  
  // Add timeline information
  if (context.timeAvailability) {
    baseDescription += ` Designed to fit within ${context.timeAvailability} hours per week.`;
  }
  
  return baseDescription;
}

/**
 * Format service category name for display
 */
function formatServiceName(category: ServiceCategory): string {
  return category
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
