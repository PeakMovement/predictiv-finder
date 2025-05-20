
import { ServiceCategory } from "./types";
import { createServiceCategoryRecord } from "./helpers/serviceRecordInitializer";

/**
 * Calculate default sessions based on service type and condition severity
 * 
 * @param serviceType The type of service
 * @param conditionSeverity Severity of the condition (0-1)
 * @returns Recommended number of sessions
 */
export function calculateDefaultSessions(
  serviceType: ServiceCategory,
  conditionSeverity: number = 0.5
): number {
  // Base session counts by service category
  const baseSessions: Record<ServiceCategory, number> = {
    'physiotherapist': 3,
    'biokineticist': 4,
    'dietician': 2,
    'personal-trainer': 4,
    'psychology': 3,
    'coaching': 3,
    'psychiatry': 2,
    'general-practitioner': 1,
    'family-medicine': 1,
    'cardiology': 1,
    'endocrinology': 1,
    'gastroenterology': 1,
    'neurology': 1,
    'orthopedic-surgeon': 1,
    'rheumatology': 1,
    'sports-medicine': 1,
    'dermatology': 1,
    'gynecology': 1,
    'ophthalmology': 1,
    'pain-management': 2,
    'podiatrist': 1,
    'occupational-therapy': 3,
    'speech-therapy': 4,
    'audiology': 1,
    'nutrition-coaching': 3,
    'chiropractor': 3,
    'massage-therapy': 3,
    'acupuncture': 3,
    'yoga-instructor': 4,
    'pilates-instructor': 4,
    'tai-chi-instructor': 4,
    'naturopathy': 2,
    'homeopathy': 2,
    'osteopathy': 2,
    'pharmacy': 1,
    'medical-specialist': 1,
    'pediatrics': 1,
    'geriatrics': 1,
    'physical-therapy': 3,
    'strength-coaching': 4,
    'run-coaching': 3,
    'internal-medicine': 1,
    'infectious-disease': 1,
    'plastic-surgery': 1,
    'orthopedics': 1,
    'neurosurgery': 1,
    'oncology': 2,
    'urology': 1,
    'obstetrics-gynecology': 1,
    'emergency-medicine': 1,
    'anesthesiology': 1,
    'radiology': 1,
    'geriatric-medicine': 1,
    'sport-physician': 1,
    'nurse-practitioner': 1,
    'all': 2
  };
  
  // Get base session count for this service type
  const baseSessionCount = baseSessions[serviceType] || 2;
  
  // Adjust based on severity
  if (conditionSeverity < 0.3) {
    return Math.max(1, baseSessionCount - 1);
  } else if (conditionSeverity > 0.7) {
    return baseSessionCount + 1;
  } else {
    return baseSessionCount;
  }
}

/**
 * Calculate session frequency recommendation
 * 
 * @param serviceType Service category
 * @param totalSessions Total number of sessions
 * @param timeframe Timeframe in weeks
 * @returns Recommended frequency string
 */
export function calculateSessionFrequency(
  serviceType: ServiceCategory,
  totalSessions: number,
  timeframe: number = 4
): string {
  // For very few sessions
  if (totalSessions === 1) {
    return "Once";
  }
  
  // For short timeframes with multiple sessions
  if (timeframe <= 2 && totalSessions > 1) {
    return `${totalSessions} times in ${timeframe} week${timeframe > 1 ? 's' : ''}`;
  }
  
  // Calculate sessions per week
  const sessionsPerWeek = totalSessions / timeframe;
  
  if (sessionsPerWeek >= 3) {
    return "3+ times per week";
  } else if (sessionsPerWeek >= 1) {
    return "Weekly";
  } else if (sessionsPerWeek >= 0.5) {
    return "Every other week";
  } else {
    return "Monthly";
  }
}

/**
 * Calculate optimal session allocation based on budget and priorities
 * 
 * @param services List of service types
 * @param budget Total budget available
 * @param priorities Optional priority mapping (0-1)
 * @returns Map of service types to session counts
 */
export function calculateSessionAllocation(
  services: ServiceCategory[],
  budget: number,
  priorities?: Record<ServiceCategory, number>
): Record<ServiceCategory, number> {
  // Default priorities
  const defaultPriorities: Record<ServiceCategory, number> = {
    'physiotherapist': 0.8,
    'biokineticist': 0.7,
    'dietician': 0.7,
    'personal-trainer': 0.7,
    'psychology': 0.8,
    'coaching': 0.6,
    'psychiatry': 0.9,
    'general-practitioner': 0.9,
    'family-medicine': 0.8,
    'cardiology': 0.9,
    'endocrinology': 0.8,
    'gastroenterology': 0.8,
    'neurology': 0.9,
    'orthopedic-surgeon': 0.9,
    'rheumatology': 0.8,
    'sports-medicine': 0.7,
    'dermatology': 0.7,
    'gynecology': 0.8,
    'ophthalmology': 0.8,
    'pain-management': 0.8,
    'podiatrist': 0.7,
    'occupational-therapy': 0.7,
    'speech-therapy': 0.7,
    'audiology': 0.7,
    'nutrition-coaching': 0.6,
    'chiropractor': 0.7,
    'massage-therapy': 0.6,
    'acupuncture': 0.5,
    'yoga-instructor': 0.5,
    'pilates-instructor': 0.5,
    'tai-chi-instructor': 0.5,
    'naturopathy': 0.4,
    'homeopathy': 0.4,
    'osteopathy': 0.6,
    'pharmacy': 0.7,
    'medical-specialist': 0.9,
    'pediatrics': 0.8,
    'geriatrics': 0.8,
    'physical-therapy': 0.8,
    'strength-coaching': 0.6,
    'run-coaching': 0.6,
    'internal-medicine': 0.8,
    'infectious-disease': 0.9,
    'plastic-surgery': 0.7,
    'orthopedics': 0.8,
    'neurosurgery': 0.9,
    'oncology': 0.9,
    'urology': 0.8,
    'obstetrics-gynecology': 0.8,
    'emergency-medicine': 0.9,
    'anesthesiology': 0.9,
    'radiology': 0.8,
    'geriatric-medicine': 0.8,
    'sport-physician': 0.7,
    'nurse-practitioner': 0.7,
    'all': 0.7
  };
  
  // Use provided priorities or defaults
  const servicePriorities = priorities || defaultPriorities;
  
  // Service costs
  const serviceCosts: Record<ServiceCategory, number> = {
    'physiotherapist': 600,
    'biokineticist': 550,
    'dietician': 500,
    'personal-trainer': 400,
    'psychology': 800,
    'coaching': 450,
    'psychiatry': 900,
    'general-practitioner': 500,
    'family-medicine': 600,
    'cardiology': 1000,
    'endocrinology': 800,
    'gastroenterology': 800,
    'neurology': 900,
    'orthopedic-surgeon': 1200,
    'rheumatology': 800,
    'sports-medicine': 750,
    'dermatology': 750,
    'gynecology': 800,
    'ophthalmology': 700,
    'pain-management': 700,
    'podiatrist': 600,
    'occupational-therapy': 650,
    'speech-therapy': 600,
    'audiology': 500,
    'nutrition-coaching': 400,
    'chiropractor': 500,
    'massage-therapy': 450,
    'acupuncture': 450,
    'yoga-instructor': 300,
    'pilates-instructor': 350,
    'tai-chi-instructor': 300,
    'naturopathy': 400,
    'homeopathy': 350,
    'osteopathy': 500,
    'pharmacy': 250,
    'medical-specialist': 900,
    'pediatrics': 650,
    'geriatrics': 700,
    'physical-therapy': 600,
    'strength-coaching': 500,
    'run-coaching': 450,
    'internal-medicine': 750,
    'infectious-disease': 900,
    'plastic-surgery': 1500,
    'orthopedics': 800,
    'neurosurgery': 2000,
    'oncology': 1200,
    'urology': 800,
    'obstetrics-gynecology': 800,
    'emergency-medicine': 1500,
    'anesthesiology': 1000,
    'radiology': 700,
    'geriatric-medicine': 750,
    'sport-physician': 800,
    'nurse-practitioner': 450,
    'all': 700
  };
  
  // Initialize result with all services having 0 sessions
  const result = createServiceCategoryRecord(0);
  
  // Ensure we allocate at least one session to every service
  services.forEach(service => {
    result[service] = 1;
    budget -= serviceCosts[service] || 500;
  });
  
  // If budget is exhausted, return what we have
  if (budget <= 0) {
    return result;
  }
  
  // Sort services by priority
  const sortedServices = [...services].sort((a, b) => 
    (servicePriorities[b] || 0.5) - (servicePriorities[a] || 0.5)
  );
  
  // Allocate remaining budget to services in priority order
  let index = 0;
  while (budget > 0 && index < sortedServices.length) {
    const service = sortedServices[index];
    const cost = serviceCosts[service] || 500;
    
    // If we can afford another session, add it
    if (budget >= cost) {
      result[service]++;
      budget -= cost;
    } else {
      // Move to next service
      index++;
    }
  }
  
  return result;
}

/**
 * Generate a fully populated ServiceAllocation record with default values
 * @returns A record with all service allocations initialized
 */
export function createDefaultServiceAllocationRecord(): Record<ServiceCategory, any> {
  return createServiceCategoryRecord({
    type: 'general-practitioner' as ServiceCategory,
    sessions: 1,
    priorityLevel: 'medium' as const,
    count: 1,
    costPerSession: 500,
    totalCost: 500
  });
}
