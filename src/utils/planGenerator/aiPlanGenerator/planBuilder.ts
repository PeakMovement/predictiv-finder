
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
  
  // Convert serviceTypes array to string safely for description
  let serviceTypeNames = "";
  if (Array.isArray(serviceTypes) && serviceTypes.length > 0) {
    serviceTypeNames = serviceTypes
      .map(type => String(type).replace(/-/g, ' '))
      .join(', ');
  } else {
    serviceTypeNames = "professional services";
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

// Helper function for service descriptions
function getServiceDescription(type: ServiceCategory, sessions: number): string {
  const plural = sessions > 1 ? 's' : '';
  
  switch (type) {
    case 'physiotherapist':
      return `${sessions} physiotherapy session${plural} for assessment and treatment`;
    case 'biokineticist':
      return `${sessions} biokinetic session${plural} for movement assessment and rehabilitation`;
    case 'dietician':
      return `${sessions} dietician consultation${plural} for nutrition planning`;
    case 'personal-trainer':
      return `${sessions} personal training session${plural} for fitness coaching`;
    case 'pain-management':
      return `${sessions} pain management session${plural} for chronic pain relief`;
    case 'coaching':
      return `${sessions} coaching session${plural} for guidance and motivation`;
    case 'psychology':
      return `${sessions} psychology session${plural} for mental health support`;
    case 'psychiatry':
      return `${sessions} psychiatric consultation${plural} for mental health treatment`;
    case 'podiatrist':
      return `${sessions} podiatry session${plural} for foot and lower limb care`;
    case 'general-practitioner':
      return `${sessions} GP consultation${plural} for general health assessment`;
    case 'sport-physician':
      return `${sessions} sports medicine consultation${plural} for athletic health`;
    case 'orthopedic-surgeon':
      return `${sessions} orthopedic consultation${plural} for musculoskeletal assessment`;
    default:
      return `${sessions} ${String(type).replace('-', ' ')} session${plural}`;
  }
}
