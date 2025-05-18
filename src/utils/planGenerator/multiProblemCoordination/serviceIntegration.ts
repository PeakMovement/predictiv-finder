
import { ServiceCategory } from "../types";
import { createServiceCategoryRecord, createServiceCategoryRecordWithFactory } from "../helpers/serviceRecordInitializer";

/**
 * Handles integration of multiple services into a cohesive plan
 */

/**
 * Generates a coordination score between service types
 * Higher score means better coordination/integration
 */
export const SERVICE_COORDINATION_SCORES: Record<ServiceCategory, Record<ServiceCategory, number>> = 
  createServiceCategoryRecordWithFactory(() => createServiceCategoryRecord(0));

// Initialize specific entries for key service coordination pairs
SERVICE_COORDINATION_SCORES['physiotherapist']['biokineticist'] = 0.9;
SERVICE_COORDINATION_SCORES['physiotherapist']['personal-trainer'] = 0.8;
SERVICE_COORDINATION_SCORES['physiotherapist']['pain-management'] = 0.85;
SERVICE_COORDINATION_SCORES['physiotherapist']['sport-physician'] = 0.85;
SERVICE_COORDINATION_SCORES['physiotherapist']['massage-therapy'] = 0.8;

SERVICE_COORDINATION_SCORES['psychology']['psychiatry'] = 0.95;
SERVICE_COORDINATION_SCORES['psychology']['coaching'] = 0.8;
SERVICE_COORDINATION_SCORES['psychology']['general-practitioner'] = 0.7;

SERVICE_COORDINATION_SCORES['dietician']['nutrition-coaching'] = 0.9;
SERVICE_COORDINATION_SCORES['dietician']['personal-trainer'] = 0.8;
SERVICE_COORDINATION_SCORES['dietician']['gastroenterology'] = 0.85;

SERVICE_COORDINATION_SCORES['pain-management']['physiotherapist'] = 0.85;
SERVICE_COORDINATION_SCORES['pain-management']['massage-therapy'] = 0.8;
SERVICE_COORDINATION_SCORES['pain-management']['psychology'] = 0.75;

// Fill values for all other services with a reasonable default like 0.5
Object.keys(SERVICE_COORDINATION_SCORES).forEach(service1 => {
  Object.keys(SERVICE_COORDINATION_SCORES).forEach(service2 => {
    if (service1 === service2) {
      SERVICE_COORDINATION_SCORES[service1 as ServiceCategory][service2 as ServiceCategory] = 1.0; // Perfect coordination with self
    } else if (!SERVICE_COORDINATION_SCORES[service1 as ServiceCategory][service2 as ServiceCategory]) {
      SERVICE_COORDINATION_SCORES[service1 as ServiceCategory][service2 as ServiceCategory] = 0.5; // Default coordination score
    }
  });
});

/**
 * Find the optimal service integration for a set of service categories
 * 
 * @param services List of services to be integrated
 * @returns Ordered list of services with integration scores
 */
export function findOptimalServiceIntegration(
  services: ServiceCategory[]
): {
  orderedServices: ServiceCategory[];
  integrationScore: number;
}[] {
  if (!services || services.length <= 1) {
    return services.map(service => ({
      orderedServices: [service],
      integrationScore: 1
    }));
  }
  
  const result: {
    orderedServices: ServiceCategory[];
    integrationScore: number;
  }[] = [];
  
  // Calculate total coordination score for each service
  const serviceScores: Record<ServiceCategory, number> = {};
  
  services.forEach(service1 => {
    serviceScores[service1] = 0;
    services.forEach(service2 => {
      if (service1 !== service2) {
        // Get coordination score between these services
        const score = SERVICE_COORDINATION_SCORES[service1][service2] || 0.5;
        serviceScores[service1] += score;
      }
    });
  });
  
  // Sort services by their total coordination score
  const sortedServices = [...services].sort((a, b) => 
    (serviceScores[b] || 0) - (serviceScores[a] || 0)
  );
  
  // Create integration pairs with scores
  for (let i = 0; i < sortedServices.length - 1; i++) {
    const service1 = sortedServices[i];
    const service2 = sortedServices[i + 1];
    const score = SERVICE_COORDINATION_SCORES[service1][service2] || 0.5;
    
    result.push({
      orderedServices: [service1, service2],
      integrationScore: score
    });
  }
  
  return result;
}

/**
 * Generate coordination notes for a service pair
 * 
 * @param service1 First service category
 * @param service2 Second service category
 * @returns Coordination notes as string
 */
export function generateCoordinationNotes(
  service1: ServiceCategory,
  service2: ServiceCategory
): string {
  const coordinationTemplates: Record<string, string[]> = {
    'high': [
      `${service1} and ${service2} should coordinate closely on treatment progression.`,
      `Regular communication between ${service1} and ${service2} providers is essential.`,
      `${service1} should share assessment notes with ${service2} for optimal care.`
    ],
    'medium': [
      `Some coordination between ${service1} and ${service2} would be beneficial.`,
      `Monthly check-ins between ${service1} and ${service2} providers are recommended.`,
      `${service1} should be aware of ${service2} treatment approaches.`
    ],
    'low': [
      `Minimal coordination needed between ${service1} and ${service2}.`,
      `${service1} and ${service2} can operate independently with awareness of overall plan.`,
      `Annual review of progress involving both ${service1} and ${service2} is sufficient.`
    ]
  };
  
  const score = SERVICE_COORDINATION_SCORES[service1][service2] || 0.5;
  
  // Determine coordination level based on score
  let level = 'medium';
  if (score >= 0.8) level = 'high';
  else if (score < 0.6) level = 'low';
  
  // Select a random template from the appropriate level
  const templates = coordinationTemplates[level];
  const randomIndex = Math.floor(Math.random() * templates.length);
  
  return templates[randomIndex];
}
