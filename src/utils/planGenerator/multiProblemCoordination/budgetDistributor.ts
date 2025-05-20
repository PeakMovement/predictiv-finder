
import { ServiceCategory } from "../types";
import { createServiceCategoryRecord, createServiceCategoryRecordWithFactory } from "../helpers/serviceRecordInitializer";

/**
 * Interface for session allocation
 */
export interface SessionAllocation {
  sessions: number;
  costPerSession: number;
  totalCost: number;
  conditions: string[];
}

/**
 * Settings for budget distribution
 */
export interface BudgetDistributionSettings {
  prioritizeHighRisk: boolean;
  minimumSessions: number;
  preferSpecialists: boolean;
}

/**
 * Default settings for budget distribution
 */
export const DEFAULT_BUDGET_SETTINGS: BudgetDistributionSettings = {
  prioritizeHighRisk: true,
  minimumSessions: 2,
  preferSpecialists: true
};

/**
 * Type for condition with severity
 */
interface ConditionWithSeverity {
  name: string;
  severity: number;
  services: ServiceCategory[];
}

/**
 * Distributes a budget across different services based on conditions
 * 
 * @param budget Total budget available
 * @param conditions Array of health conditions to address
 * @param severityScores Severity score for each condition
 * @param servicesToConditions Mapping of which services address which conditions
 * @param settings Settings for how to distribute the budget
 * @returns Allocation of budget and sessions across services
 */
export function distributeBudgetAcrossServices(
  budget: number,
  conditions: string[],
  severityScores: Record<string, number>,
  servicesToConditions: Record<ServiceCategory, string[]>,
  settings: BudgetDistributionSettings = DEFAULT_BUDGET_SETTINGS
): {
  allocation: Record<ServiceCategory, SessionAllocation>;
  totalSpent: number;
  remainingBudget: number;
  prioritizedConditions: string[];
} {
  // Create cost map using createServiceCategoryRecord
  const costPerService = createServiceCategoryRecord(0);
  
  // Set specific costs for common services
  costPerService['physiotherapist'] = 150;
  costPerService['biokineticist'] = 180;
  costPerService['dietician'] = 120;
  costPerService['personal-trainer'] = 100;
  costPerService['coaching'] = 140;
  costPerService['psychology'] = 200;
  costPerService['psychiatry'] = 300;
  costPerService['family-medicine'] = 150;
  costPerService['pain-management'] = 200;
  costPerService['podiatrist'] = 180;
  costPerService['general-practitioner'] = 120;
  costPerService['sport-physician'] = 200;
  costPerService['orthopedic-surgeon'] = 400;
  costPerService['gastroenterology'] = 300;
  costPerService['massage-therapy'] = 100;
  costPerService['nutrition-coaching'] = 120;
  costPerService['occupational-therapy'] = 160;
  costPerService['physical-therapy'] = 150;
  costPerService['chiropractor'] = 140;
  costPerService['nurse-practitioner'] = 100;
  costPerService['cardiology'] = 300;
  costPerService['dermatology'] = 250;
  costPerService['neurology'] = 320;
  costPerService['endocrinology'] = 280;
  costPerService['urology'] = 260;
  costPerService['oncology'] = 350;
  costPerService['rheumatology'] = 270;
  costPerService['pediatrics'] = 180;
  costPerService['geriatrics'] = 200;
  costPerService['sports-medicine'] = 220;
  costPerService['internal-medicine'] = 240;
  costPerService['orthopedics'] = 260;
  costPerService['neurosurgery'] = 500;
  costPerService['infectious-disease'] = 280;
  costPerService['plastic-surgery'] = 450;
  costPerService['obstetrics-gynecology'] = 240;
  costPerService['emergency-medicine'] = 300;
  costPerService['anesthesiology'] = 380;
  costPerService['radiology'] = 260;
  costPerService['geriatric-medicine'] = 220;
  costPerService['strength-coaching'] = 110;
  costPerService['run-coaching'] = 110;
  costPerService['gynecology'] = 240;
  costPerService['ophthalmology'] = 250;
  costPerService['speech-therapy'] = 170;
  costPerService['audiology'] = 180;
  costPerService['acupuncture'] = 130;
  costPerService['yoga-instructor'] = 90;
  costPerService['pilates-instructor'] = 100;
  costPerService['tai-chi-instructor'] = 90;
  costPerService['naturopathy'] = 140;
  costPerService['homeopathy'] = 120;
  costPerService['osteopathy'] = 150;
  costPerService['pharmacy'] = 60;
  costPerService['medical-specialist'] = 280;
  costPerService['all'] = 150;
  
  // Initialize allocation using factory
  const allocation = createServiceCategoryRecordWithFactory<SessionAllocation>(() => ({
    sessions: 0,
    costPerSession: 0,
    totalCost: 0,
    conditions: []
  }));
  
  // Format conditions with their severities for prioritization
  const conditionsWithSeverity: ConditionWithSeverity[] = conditions.map(condition => {
    return {
      name: condition,
      severity: severityScores[condition] || 0.5, // Default to medium severity if not specified
      services: []
    };
  });
  
  // Associate services to conditions
  for (const service in servicesToConditions) {
    const serviceCategory = service as ServiceCategory;
    const serviceConditions = servicesToConditions[serviceCategory] || [];
    
    // Add this service to each condition it addresses
    serviceConditions.forEach(conditionName => {
      const condition = conditionsWithSeverity.find(c => c.name === conditionName);
      if (condition) {
        condition.services.push(serviceCategory);
      }
    });
  }
  
  // Prioritize conditions based on severity if setting is enabled
  if (settings.prioritizeHighRisk) {
    conditionsWithSeverity.sort((a, b) => b.severity - a.severity);
  }
  
  // Prioritized conditions list for return value
  const prioritizedConditions = conditionsWithSeverity.map(c => c.name);
  
  // First pass: allocate minimum sessions to each condition based on severity
  let remainingBudget = budget;
  
  conditionsWithSeverity.forEach(condition => {
    const relevantServices = condition.services;
    
    if (relevantServices.length === 0) {
      // If no specific services, allocate to general practitioner
      relevantServices.push('general-practitioner');
    }
    
    // Calculate how many services to use based on severity and available budget
    const servicesToUse = Math.min(
      relevantServices.length,
      Math.max(1, Math.ceil(condition.severity * relevantServices.length))
    );
    
    // Sort services by specialization if that setting is enabled
    let servicesToAllocate = relevantServices.slice(0, servicesToUse);
    if (settings.preferSpecialists) {
      // This would ideally use a more sophisticated algorithm
      // For now, just ensure we don't always use generalist services
      if (servicesToAllocate.includes('general-practitioner') && servicesToAllocate.length > 1) {
        servicesToAllocate = servicesToAllocate.filter(s => s !== 'general-practitioner');
      }
    }
    
    // Allocate minimum sessions to each service
    servicesToAllocate.forEach(service => {
      const cost = costPerService[service];
      const minSessionsForThisService = Math.max(1, Math.floor(settings.minimumSessions * condition.severity));
      
      // Check if we can afford minimum sessions
      if (remainingBudget >= cost * minSessionsForThisService) {
        allocation[service].sessions += minSessionsForThisService;
        allocation[service].costPerSession = cost;
        allocation[service].totalCost += cost * minSessionsForThisService;
        
        if (!allocation[service].conditions.includes(condition.name)) {
          allocation[service].conditions.push(condition.name);
        }
        
        remainingBudget -= cost * minSessionsForThisService;
      }
    });
  });
  
  // Second pass: distribute remaining budget proportionally to condition severity
  if (remainingBudget > 0) {
    // Calculate total severity for weighting
    const totalSeverity = conditionsWithSeverity.reduce((sum, condition) => sum + condition.severity, 0);
    
    // Distribute remaining budget proportionally
    conditionsWithSeverity.forEach(condition => {
      if (condition.services.length === 0) return;
      
      // Calculate budget allocation for this condition
      const conditionBudget = (condition.severity / totalSeverity) * remainingBudget;
      
      // Select primary service for this condition (first in list after sorting)
      const primaryService = condition.services[0];
      const cost = costPerService[primaryService];
      
      // Calculate how many additional sessions we can afford
      const additionalSessions = Math.floor(conditionBudget / cost);
      
      if (additionalSessions > 0) {
        allocation[primaryService].sessions += additionalSessions;
        allocation[primaryService].totalCost += cost * additionalSessions;
        
        remainingBudget -= cost * additionalSessions;
      }
    });
  }
  
  // Calculate total spent
  const totalSpent = budget - remainingBudget;
  
  return {
    allocation,
    totalSpent,
    remainingBudget,
    prioritizedConditions
  };
}
