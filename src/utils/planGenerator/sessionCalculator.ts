
import { ServiceAllocation, ServiceCategory, SessionAllocation, PriceRange } from './types';

// Re-export as calculateSessions for backwards compatibility
export const calculateSessions = distributeSessionsByBudget;

/**
 * Distributes sessions based on budget and service priorities
 */
export function distributeSessionsByBudget(
  budget: number = 2500,
  services: Array<{ type: ServiceCategory; priority: number }>
): Record<ServiceCategory, SessionAllocation> {
  // Create a default empty allocation
  const defaultSessionAllocation: Record<ServiceCategory, SessionAllocation> = {
    'physiotherapist': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'biokineticist': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'dietician': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'personal-trainer': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'pain-management': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'coaching': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'psychology': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'psychiatry': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'podiatrist': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'general-practitioner': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'sport-physician': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'orthopedic-surgeon': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'family-medicine': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'gastroenterology': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'massage-therapy': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'nutrition-coach': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'occupational-therapy': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'physical-therapy': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'chiropractor': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'nurse-practitioner': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'cardiology': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'dermatology': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'neurology': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'endocrinology': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'urology': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'oncology': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'rheumatology': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'pediatrics': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'geriatrics': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'sports-medicine': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'internal-medicine': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'orthopedics': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'neurosurgery': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'infectious-disease': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'plastic-surgery': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'obstetrics-gynecology': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'emergency-medicine': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'anesthesiology': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'radiology': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'geriatric-medicine': { sessions: 0, costPerSession: 0, totalCost: 0 },
    'all': { sessions: 0, costPerSession: 0, totalCost: 0 }
  };

  // Basic validation
  if (!budget || budget <= 0 || !services || services.length === 0) {
    return defaultSessionAllocation;
  }

  const sessionAllocation: Record<ServiceCategory, SessionAllocation> = { ...defaultSessionAllocation };
  
  // Calculate total priority
  const totalPriority = services.reduce((sum, service) => sum + service.priority, 0) || 1;
  
  // Get price ranges for services
  const priceRanges = getServicePriceRanges();
  
  // Sort services by priority (highest first)
  const sortedServices = [...services].sort((a, b) => b.priority - a.priority);
  
  // Phase 1: Initial session allocation based on priority
  const totalServices = sortedServices.length;
  
  // Base number of sessions per service
  const baseSessionsPerService = budget >= 2000 ? 2 : 1;
  
  // Available budget after initial allocation
  let remainingBudget = budget;
  
  // First pass: Allocate base sessions to all services
  for (const service of sortedServices) {
    const priceRange = priceRanges[service.type] || { 
      low: { min: 400, max: 600 },
      medium: { min: 500, max: 800 }, 
      high: { min: 700, max: 1200 }
    };
    
    // Use medium tier pricing for initial allocation
    const costPerSession = Math.floor((priceRange.medium.min + priceRange.medium.max) / 2);
    
    // Ensure we have enough budget for base sessions
    if (costPerSession * baseSessionsPerService <= remainingBudget) {
      sessionAllocation[service.type] = {
        sessions: baseSessionsPerService,
        costPerSession: costPerSession,
        totalCost: costPerSession * baseSessionsPerService
      };
      
      remainingBudget -= costPerSession * baseSessionsPerService;
    }
  }
  
  // Second pass: Distribute remaining budget based on priority
  if (remainingBudget > 0) {
    for (const service of sortedServices) {
      if (sessionAllocation[service.type].sessions === 0) continue;
      
      // Calculate share of remaining budget
      const priorityShare = service.priority / totalPriority;
      const additionalBudget = remainingBudget * priorityShare;
      const costPerSession = sessionAllocation[service.type].costPerSession;
      
      // Calculate additional sessions
      const additionalSessions = Math.floor(additionalBudget / costPerSession);
      
      if (additionalSessions > 0) {
        sessionAllocation[service.type].sessions += additionalSessions;
        sessionAllocation[service.type].totalCost += additionalSessions * costPerSession;
        remainingBudget -= additionalSessions * costPerSession;
      }
    }
  }

  return sessionAllocation;
}

/**
 * Get price ranges for different service types and budget tiers
 */
function getServicePriceRanges(): Record<ServiceCategory, Record<string, PriceRange>> {
  // Initialize with basic price ranges for common services
  const priceRanges: Partial<Record<ServiceCategory, Record<string, PriceRange>>> = {
    'physiotherapist': {
      low: { min: 400, max: 600 },
      medium: { min: 600, max: 900 },
      high: { min: 900, max: 1200 }
    },
    'personal-trainer': {
      low: { min: 300, max: 450 },
      medium: { min: 450, max: 700 },
      high: { min: 700, max: 1000 }
    }
  };
  
  // Default price ranges for all other services
  const defaultRanges = {
    low: { min: 400, max: 600 },
    medium: { min: 600, max: 900 },
    high: { min: 900, max: 1500 }
  };
  
  // Create a complete record with all service categories
  const fullPriceRanges: Record<ServiceCategory, Record<string, PriceRange>> = {} as Record<ServiceCategory, Record<string, PriceRange>>;
  
  // Add all service categories
  const allServiceCategories: ServiceCategory[] = [
    'physiotherapist', 'biokineticist', 'dietician', 'personal-trainer',
    'pain-management', 'coaching', 'psychology', 'psychiatry', 
    'podiatrist', 'general-practitioner', 'sport-physician', 'orthopedic-surgeon',
    'family-medicine', 'gastroenterology', 'massage-therapy', 'nutrition-coach',
    'occupational-therapy', 'physical-therapy', 'chiropractor', 'nurse-practitioner',
    'cardiology', 'dermatology', 'neurology', 'endocrinology',
    'urology', 'oncology', 'rheumatology', 'pediatrics',
    'geriatrics', 'sports-medicine', 'internal-medicine', 'orthopedics',
    'neurosurgery', 'infectious-disease', 'plastic-surgery', 'obstetrics-gynecology',
    'emergency-medicine', 'anesthesiology', 'radiology', 'geriatric-medicine',
    'all'
  ];
  
  // Fill in all service categories with default or specific ranges
  for (const category of allServiceCategories) {
    fullPriceRanges[category] = priceRanges[category] || { ...defaultRanges };
  }
  
  return fullPriceRanges;
}

/**
 * Legacy function for determining session count based on budget
 */
export function calculateSessionsForBudget(
  budget: number,
  costPerSession: number | PriceRange | LegacyPriceRange,
  minSessions: number = 1,
  maxSessions: number = 8
): number {
  // Determine the actual cost per session
  let actualCostPerSession: number;
  
  if (typeof costPerSession === 'number') {
    actualCostPerSession = costPerSession;
  } else if ('min' in costPerSession && 'max' in costPerSession) {
    // Use average cost for PriceRange
    actualCostPerSession = (costPerSession.min + costPerSession.max) / 2;
  } else {
    // Use average cost for LegacyPriceRange
    actualCostPerSession = (costPerSession.affordable + costPerSession.highEnd) / 2;
  }
  
  // Calculate affordable sessions based on budget
  let affordableSessions = Math.floor(budget / actualCostPerSession);
  
  // Constrain within min and max sessions
  return Math.min(Math.max(affordableSessions, minSessions), maxSessions);
}

// Add missing LegacyPriceRange interface if it doesn't exist in types.ts
interface LegacyPriceRange {
  affordable: number;
  highEnd: number;
}
