
import { ServiceCategory } from "../types";

/**
 * Defines complementary relationships between different service types
 * Used to coordinate treatment approaches for multiple conditions
 */
export const SERVICE_COMPLEMENTARY_MAP: Record<ServiceCategory, ServiceCategory[]> = {
  'physiotherapist': ['biokineticist', 'personal-trainer', 'pain-management'],
  'biokineticist': ['physiotherapist', 'personal-trainer', 'sport-physician'],
  'dietician': ['nutrition-coach', 'personal-trainer', 'gastroenterology'],
  'personal-trainer': ['physiotherapist', 'biokineticist', 'dietician'],
  'pain-management': ['physiotherapist', 'psychology'],
  'coaching': ['psychology', 'personal-trainer'],
  'psychology': ['psychiatry', 'coaching'],
  'psychiatry': ['psychology'],
  'podiatrist': ['physiotherapist', 'biokineticist'],
  'general-practitioner': ['family-medicine', 'nurse-practitioner'],
  'sport-physician': ['physiotherapist', 'biokineticist', 'orthopedic-surgeon'],
  'orthopedic-surgeon': ['physiotherapist', 'pain-management'],
  'family-medicine': ['general-practitioner'],
  'gastroenterology': ['dietician'],
  'massage-therapy': ['physiotherapist', 'pain-management'],
  'nutrition-coach': ['dietician', 'personal-trainer'],
  'occupational-therapy': ['physiotherapist', 'psychology'],
  'physical-therapy': ['physiotherapist'],
  'chiropractor': ['physiotherapist'],
  'nurse-practitioner': ['general-practitioner'],
  'cardiology': ['general-practitioner'],
  'dermatology': ['general-practitioner'],
  'neurology': ['psychiatry', 'psychology'],
  'endocrinology': ['dietician'],
  'urology': ['general-practitioner'],
  'oncology': ['general-practitioner'],
  'rheumatology': ['physiotherapist', 'pain-management'],
  'pediatrics': ['general-practitioner'],
  'geriatrics': ['general-practitioner'],
  'sports-medicine': ['physiotherapist', 'biokineticist'],
  'internal-medicine': ['general-practitioner'],
  'orthopedics': ['physiotherapist', 'sport-physician'],
  'neurosurgery': ['neurology', 'pain-management'],
  'infectious-disease': ['general-practitioner'],
  'plastic-surgery': ['dermatology'],
  'obstetrics-gynecology': ['general-practitioner'],
  'emergency-medicine': ['general-practitioner'],
  'anesthesiology': ['pain-management'],
  'radiology': ['general-practitioner'],
  'geriatric-medicine': ['general-practitioner'],
  'all': []
};

/**
 * Defines synergistic relationships between services that enhance each other's effectiveness
 */
export const SERVICE_SYNERGY_MAP: Record<ServiceCategory, Record<ServiceCategory, number>> = {
  'physiotherapist': { 'personal-trainer': 0.8, 'pain-management': 0.7 },
  'psychology': { 'psychiatry': 0.9, 'coaching': 0.7 },
  'dietician': { 'personal-trainer': 0.8, 'nutrition-coach': 0.7 },
  'pain-management': { 'physiotherapist': 0.7, 'psychology': 0.6 },
  // Default entries for remaining categories
  'all': {}
};

/**
 * Identifies services that work well together for specific condition combinations
 * 
 * @param conditions Array of medical conditions
 * @returns Object mapping primary services to recommended complementary services
 */
export function identifyComplementaryServices(
  conditions: string[]
): Record<ServiceCategory, ServiceCategory[]> {
  // Map of condition combinations to optimal service combinations
  const conditionServiceMap: Record<string, { primary: ServiceCategory, complementary: ServiceCategory[] }> = {
    'anxiety+depression': { 
      primary: 'psychiatry', 
      complementary: ['psychology', 'coaching'] 
    },
    'back pain+stress': { 
      primary: 'physiotherapist', 
      complementary: ['psychology', 'pain-management'] 
    },
    'weight management+joint pain': { 
      primary: 'dietician', 
      complementary: ['physiotherapist', 'personal-trainer'] 
    },
    'diabetes+heart disease': { 
      primary: 'endocrinology', 
      complementary: ['cardiology', 'dietician'] 
    },
    'insomnia+anxiety': { 
      primary: 'psychology', 
      complementary: ['psychiatry'] 
    },
    'running+knee pain': { 
      primary: 'physiotherapist', 
      complementary: ['biokineticist', 'podiatrist'] 
    }
  };
  
  // Initialize result
  const result: Record<ServiceCategory, ServiceCategory[]> = {};
  
  // Check for condition combinations
  for (const key in conditionServiceMap) {
    const conditionPair = key.split('+');
    if (
      conditionPair.every(condition => 
        conditions.some(userCondition => 
          userCondition.toLowerCase().includes(condition.toLowerCase())
        )
      )
    ) {
      const { primary, complementary } = conditionServiceMap[key];
      result[primary] = complementary;
    }
  }
  
  return result;
}

/**
 * Calculates integration score between two services to determine their compatibility
 * 
 * @param service1 First service category
 * @param service2 Second service category
 * @returns Integration score between 0 and 1
 */
export function calculateServiceIntegrationScore(
  service1: ServiceCategory, 
  service2: ServiceCategory
): number {
  // Check if services are the same
  if (service1 === service2) return 1;
  
  // Check for complementary relationship
  const complementary1 = SERVICE_COMPLEMENTARY_MAP[service1] || [];
  const complementary2 = SERVICE_COMPLEMENTARY_MAP[service2] || [];
  
  if (complementary1.includes(service2)) return 0.8;
  if (complementary2.includes(service1)) return 0.8;
  
  // Check for synergy relationship
  const synergies1 = SERVICE_SYNERGY_MAP[service1] || {};
  const synergies2 = SERVICE_SYNERGY_MAP[service2] || {};
  
  if (synergies1[service2]) return synergies1[service2];
  if (synergies2[service1]) return synergies2[service1];
  
  // Default moderate integration score
  return 0.5;
}

/**
 * Generates an optimal service allocation plan for multiple conditions
 * 
 * @param conditions Array of conditions to address
 * @param conditionSeverity Record of condition severity scores
 * @param budget Total budget available
 * @returns Optimized service allocations for all conditions
 */
export function generateIntegratedServicePlan(
  conditions: string[],
  conditionSeverity: Record<string, number>,
  budget: number
): {
  services: ServiceCategory[];
  sessionAllocations: Record<ServiceCategory, number>;
  conditionServiceMap: Record<string, ServiceCategory[]>;
} {
  // Initialize result
  const services: ServiceCategory[] = [];
  const sessionAllocations: Record<ServiceCategory, number> = {};
  const conditionServiceMap: Record<string, ServiceCategory[]> = {};
  
  // Map each condition to appropriate services based on condition type
  // This is a simplified mapping - in production this would use a more sophisticated system
  const conditionToServicesMap: Record<string, ServiceCategory[]> = {
    'back pain': ['physiotherapist', 'pain-management'],
    'knee pain': ['physiotherapist', 'orthopedics'],
    'ankle pain': ['physiotherapist', 'podiatrist'],
    'stress': ['psychology', 'coaching'],
    'anxiety': ['psychology', 'psychiatry'],
    'depression': ['psychiatry', 'psychology'],
    'weight': ['dietician', 'personal-trainer'],
    'nutrition': ['dietician', 'nutrition-coach'],
    'diabetes': ['endocrinology', 'dietician'],
    'heart': ['cardiology', 'general-practitioner'],
    'stomach': ['gastroenterology', 'dietician'],
    'skin': ['dermatology'],
    'headache': ['neurology', 'general-practitioner'],
    'sleep': ['psychology', 'psychiatry'],
    'fitness': ['personal-trainer', 'biokineticist'],
    'general': ['general-practitioner', 'family-medicine']
  };
  
  // Process each condition
  conditions.forEach(condition => {
    const conditionLower = condition.toLowerCase();
    let matchedServices: ServiceCategory[] = [];
    
    // Find matching services based on condition keywords
    Object.entries(conditionToServicesMap).forEach(([keyword, serviceList]) => {
      if (conditionLower.includes(keyword)) {
        matchedServices = [...matchedServices, ...serviceList];
      }
    });
    
    // If no specific services matched, use general practitioner
    if (matchedServices.length === 0) {
      matchedServices = ['general-practitioner'];
    }
    
    // Remove duplicates
    matchedServices = Array.from(new Set(matchedServices));
    
    // Store mapping
    conditionServiceMap[condition] = matchedServices;
    
    // Add to overall service list
    services.push(...matchedServices);
  });
  
  // Remove duplicates from service list
  const uniqueServices = Array.from(new Set(services));
  
  // Calculate severity-weighted session allocations
  const totalSeverity = Object.values(conditionSeverity).reduce((sum, severity) => sum + severity, 0) || conditions.length;
  const sessionsPerSeverityPoint = Math.max(1, Math.floor(budget / 500) / totalSeverity);
  
  // Allocate sessions based on conditions and their severity
  conditions.forEach(condition => {
    const severity = conditionSeverity[condition] || 0.5;
    const conditionServices = conditionServiceMap[condition] || [];
    
    // Calculate sessions for this condition based on severity
    const conditionSessions = Math.max(1, Math.round(severity * sessionsPerSeverityPoint));
    
    // Distribute sessions among services for this condition
    const servicesCount = conditionServices.length || 1;
    const baseSessionsPerService = Math.max(1, Math.floor(conditionSessions / servicesCount));
    
    conditionServices.forEach(service => {
      sessionAllocations[service] = (sessionAllocations[service] || 0) + baseSessionsPerService;
    });
  });
  
  return {
    services: uniqueServices,
    sessionAllocations,
    conditionServiceMap
  };
}
