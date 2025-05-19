import { ServiceCategory } from "./types";
import { PlanContext, ServiceAllocationItem } from "./types";
import { createServiceCategoryRecord } from "./helpers/serviceRecordInitializer";
import { BASELINE_COSTS } from "./types";
import { findAlternativeCategories } from "./multiProblemCoordination/alternativeCategories";
import { resolveTreatmentConflicts } from "./multiProblemCoordination/conflictResolution";
import { optimizeTreatmentTimeline, createServiceSchedule } from "./multiProblemCoordination/timelineOptimizer";
import { findOptimalServiceIntegration } from "./multiProblemCoordination/serviceIntegration";

export interface PlanBuildOptions {
  optimizeBudget?: boolean;
  includeAlternatives?: boolean;
  considerTimeConstraints?: boolean;
  maxServices?: number;
  prioritizeUrgent?: boolean;
}

export interface MultidisciplinaryPlan {
  services: ServiceAllocationItem[];
  totalCost: number;
  timeRequired: number;
  schedule?: Array<{
    timeframe: string;
    services: ServiceCategory[];
    frequency: string;
    description: string;
  }>;
  alternatives?: Array<{
    originalService: ServiceCategory;
    alternatives: ServiceCategory[];
    reason: string;
  }>;
  integrationNotes?: string[];
}

/**
 * Builds a comprehensive multidisciplinary healthcare plan based on user context
 * @param context User's health context and requirements
 * @param options Configuration options for plan building
 * @returns A complete multidisciplinary plan
 */
export function buildMultidisciplinaryPlan(
  context: PlanContext,
  options: PlanBuildOptions = {}
): MultidisciplinaryPlan {
  // Default options
  const {
    optimizeBudget = true,
    includeAlternatives = true,
    considerTimeConstraints = true,
    maxServices = 5,
    prioritizeUrgent = true
  } = options;
  
  // Initialize the plan
  const plan: MultidisciplinaryPlan = {
    services: [],
    totalCost: 0,
    timeRequired: 0,
    integrationNotes: []
  };
  
  // Step 1: Determine required services based on medical conditions
  const requiredServices = determineRequiredServices(context);
  
  // Step 2: Prioritize services based on urgency if needed
  const prioritizedServices = prioritizeUrgent ? 
    prioritizeServicesByUrgency(requiredServices, context) : 
    requiredServices;
  
  // Step 3: Limit to max services if specified
  const selectedServices = prioritizedServices.slice(0, maxServices);
  
  // Step 4: Calculate budget allocation
  const budgetAllocation = calculateBudgetAllocation(
    selectedServices, 
    context.budget || 5000,
    optimizeBudget
  );
  
  // Step 5: Create service allocation items
  plan.services = selectedServices.map((service, index) => {
    const allocation: ServiceAllocationItem = {
      type: service,
      percentage: 100 / selectedServices.length,
      priority: index + 1,
      minSessions: 1,
      maxSessions: calculateMaxSessions(service, budgetAllocation[service] || 0)
    };
    return allocation;
  });
  
  // Step 6: Calculate total cost
  plan.totalCost = Object.values(budgetAllocation).reduce((sum, cost) => sum + cost, 0);
  
  // Step 7: Calculate time required (rough estimate)
  plan.timeRequired = plan.services.reduce((total, service) => {
    return total + (service.maxSessions || 1) * getSessionDuration(service.type);
  }, 0);
  
  // Step 8: Add alternatives if requested
  if (includeAlternatives) {
    plan.alternatives = selectedServices.map(service => ({
      originalService: service,
      alternatives: findAlternativeCategories([service]),
      reason: "Budget optimization or availability"
    }));
  }
  
  // Step 9: Create schedule if time constraints are considered
  if (considerTimeConstraints && context.medicalConditions) {
    // Create a mock treatment mapping for the timeline optimizer
    const mockTreatments: Record<string, any> = {};
    context.medicalConditions.forEach(condition => {
      mockTreatments[condition] = selectedServices.map(service => 
        mapServiceToTreatmentModality(service)
      );
    });
    
    const timeline = optimizeTreatmentTimeline(
      context.medicalConditions,
      mockTreatments
    );
    
    plan.schedule = createServiceSchedule(timeline);
  }
  
  // Step 10: Add integration notes
  const serviceIntegrations = findOptimalServiceIntegration(selectedServices);
  plan.integrationNotes = serviceIntegrations.map(integration => 
    `${integration.orderedServices.join(' and ')} should coordinate care (integration score: ${integration.integrationScore.toFixed(2)})`
  );
  
  return plan;
}

/**
 * Determines required services based on medical conditions and goals
 */
function determineRequiredServices(context: PlanContext): ServiceCategory[] {
  const services: ServiceCategory[] = [];
  
  // Add general practitioner for medical conditions
  if (context.medicalConditions && context.medicalConditions.length > 0) {
    services.push('general-practitioner');
    
    // Check for specific conditions
    const conditionsLower = context.medicalConditions.map(c => c.toLowerCase());
    
    if (conditionsLower.some(c => c.includes('pain') || c.includes('injury'))) {
      services.push('physiotherapist');
    }
    
    if (conditionsLower.some(c => c.includes('diet') || c.includes('nutrition') || c.includes('weight'))) {
      services.push('dietician');
    }
    
    if (conditionsLower.some(c => c.includes('mental') || c.includes('anxiety') || c.includes('depression'))) {
      services.push('psychology');
    }
    
    if (conditionsLower.some(c => c.includes('heart') || c.includes('cardiac'))) {
      services.push('cardiology');
    }
    
    if (conditionsLower.some(c => c.includes('diabetes') || c.includes('thyroid'))) {
      services.push('endocrinology');
    }
    
    if (conditionsLower.some(c => c.includes('stomach') || c.includes('digestive'))) {
      services.push('gastroenterology');
    }
  }
  
  // Add services based on goal
  if (context.goal) {
    const goalLower = context.goal.toLowerCase();
    
    if (goalLower.includes('fitness') || goalLower.includes('strength')) {
      services.push('personal-trainer');
    }
    
    if (goalLower.includes('running') || goalLower.includes('marathon')) {
      services.push('personal-trainer');
      services.push('biokineticist');
    }
    
    if (goalLower.includes('diet') || goalLower.includes('nutrition')) {
      services.push('dietician');
    }
    
    if (goalLower.includes('stress') || goalLower.includes('anxiety')) {
      services.push('psychology');
    }
  }
  
  // Ensure at least one service is included
  if (services.length === 0) {
    services.push('general-practitioner');
  }
  
  // Return unique set of services
  return Array.from(new Set(services));
}

/**
 * Prioritizes services based on urgency
 */
function prioritizeServicesByUrgency(
  services: ServiceCategory[], 
  context: PlanContext
): ServiceCategory[] {
  // Define urgency scores for different service types
  const urgencyScores: Record<ServiceCategory, number> = createServiceCategoryRecord(0);
  
  // Set high urgency for critical services
  urgencyScores['emergency-medicine'] = 10;
  urgencyScores['cardiology'] = 9;
  urgencyScores['neurology'] = 8;
  urgencyScores['psychiatry'] = 7;
  
  // Set medium urgency for important but non-critical services
  urgencyScores['general-practitioner'] = 6;
  urgencyScores['pain-management'] = 5;
  urgencyScores['physiotherapist'] = 4;
  
  // Set lower urgency for supportive services
  urgencyScores['dietician'] = 3;
  urgencyScores['personal-trainer'] = 2;
  urgencyScores['coaching'] = 1;
  
  // Adjust urgency based on context
  if (context.isUrgent) {
    // Boost medical services when urgent
    urgencyScores['general-practitioner'] += 3;
    urgencyScores['family-medicine'] += 3;
    urgencyScores['emergency-medicine'] += 3;
  }
  
  // Sort services by urgency score
  return [...services].sort((a, b) => 
    (urgencyScores[b] || 0) - (urgencyScores[a] || 0)
  );
}

/**
 * Calculates budget allocation for services
 */
function calculateBudgetAllocation(
  services: ServiceCategory[],
  totalBudget: number,
  optimize: boolean
): Record<ServiceCategory, number> {
  const allocation: Record<ServiceCategory, number> = {};
  
  if (optimize) {
    // Sophisticated budget allocation based on service importance
    // For now, use a simple proportional allocation
    const totalCost = services.reduce((sum, service) => 
      sum + (BASELINE_COSTS[service] || 500), 0);
    
    services.forEach(service => {
      const baseCost = BASELINE_COSTS[service] || 500;
      allocation[service] = Math.floor((baseCost / totalCost) * totalBudget);
    });
  } else {
    // Simple equal allocation
    const budgetPerService = Math.floor(totalBudget / services.length);
    services.forEach(service => {
      allocation[service] = budgetPerService;
    });
  }
  
  return allocation;
}

/**
 * Calculates maximum sessions based on budget and service cost
 */
function calculateMaxSessions(service: ServiceCategory, budget: number): number {
  const costPerSession = BASELINE_COSTS[service] || 500;
  return Math.max(1, Math.floor(budget / costPerSession));
}

/**
 * Gets estimated session duration in minutes
 */
function getSessionDuration(service: ServiceCategory): number {
  const durationMap: Partial<Record<ServiceCategory, number>> = {
    'physiotherapist': 60,
    'personal-trainer': 60,
    'dietician': 45,
    'psychology': 50,
    'psychiatry': 45,
    'general-practitioner': 15,
    'cardiology': 30,
    'massage-therapy': 60
  };
  
  return durationMap[service] || 30; // Default to 30 minutes
}

/**
 * Maps service categories to treatment modalities
 */
function mapServiceToTreatmentModality(service: ServiceCategory): string {
  const modalityMap: Partial<Record<ServiceCategory, string>> = {
    'physiotherapist': 'stretching',
    'personal-trainer': 'strength-training',
    'dietician': 'diet-restriction',
    'psychology': 'cognitive-behavioral',
    'psychiatry': 'medication',
    'general-practitioner': 'medication',
    'massage-therapy': 'relaxation'
  };
  
  return modalityMap[service] || 'activity';
}
