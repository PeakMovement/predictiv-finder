
import { AIHealthPlan, ServiceCategory } from "@/types";
import { OptimizedService } from "@/utils/planGenerator/types";
import { getMockPractitioners } from "./mockData";
import { generateUniqueId } from "@/utils/idGenerator";

interface PlanBuilderOptions {
  planType: AIHealthPlan['planType'];
  timeFrame: string;
  description?: string;
  customName?: string;
  customTotalCost?: number;
  includePractitioners?: boolean;
  expectedOutcomes?: AIHealthPlan['expectedOutcomes'];
  rationales?: AIHealthPlan['rationales'];
  progressTimeline?: AIHealthPlan['progressTimeline'];
  alternativeOptions?: AIHealthPlan['alternativeOptions'];
}

export function buildHealthPlan(
  services: OptimizedService[],
  options: PlanBuilderOptions
): AIHealthPlan {
  // Default name based on plan type
  let planName = "";
  switch (options.planType) {
    case 'best-fit':
      planName = "Balanced Health Plan";
      break;
    case 'high-impact':
      planName = "Intensive Health Plan";
      break;
    case 'progressive':
      planName = "Progressive Health Plan";
      break;
    default:
      planName = "Customized Health Plan";
  }
  
  // Use custom name if provided
  if (options.customName) {
    planName = options.customName;
  }
  
  // Generate a default description if none provided
  const serviceTypes = services.map(s => s.type);
  
  // Convert array to string safely for description
  let serviceTypeNames = "";
  if (Array.isArray(serviceTypes)) {
    serviceTypeNames = serviceTypes
      .map(type => String(type).replace(/-/g, ' '))
      .join(', ');
  }
  
  const description = options.description || 
    `A ${options.timeFrame} health plan designed to address your specific needs with a combination of ${serviceTypeNames}.`;
  
  // Calculate total cost or use provided cost
  const totalCost = options.customTotalCost !== undefined
    ? options.customTotalCost
    : services.reduce((sum, service) => sum + service.totalCost, 0);
  
  // Get practitioners if needed
  let enhancedServices = services.map(service => {
    // Ensure frequency is present for all services
    const frequency = service.frequency || "weekly";
    
    const planService = {
      type: service.type,
      price: service.costPerSession,
      sessions: service.sessions,
      description: getServiceDescription(service.type, service.sessions),
      frequency: frequency
    };
    
    // Add practitioners if needed
    if (options.includePractitioners) {
      const practitioners = getMockPractitioners(service.type, 2);
      return {
        ...planService,
        recommendedPractitioners: practitioners
      };
    }
    
    return planService;
  });
  
  // Build the complete health plan
  const plan: AIHealthPlan = {
    id: generateUniqueId(),
    name: planName,
    description: description,
    services: enhancedServices,
    totalCost: totalCost,
    planType: options.planType,
    timeFrame: options.timeFrame
  };
  
  // Add optional fields if provided
  if (options.expectedOutcomes) {
    plan.expectedOutcomes = options.expectedOutcomes;
  }
  
  if (options.rationales) {
    plan.rationales = options.rationales;
  }
  
  if (options.progressTimeline) {
    plan.progressTimeline = options.progressTimeline;
  }
  
  if (options.alternativeOptions) {
    plan.alternativeOptions = options.alternativeOptions;
  }
  
  return plan;
}

// Now let's move the large getServiceDescription function to a separate file
import { getServiceDescription } from './serviceDescriptions';
