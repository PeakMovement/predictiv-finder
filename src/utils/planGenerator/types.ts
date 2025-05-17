
// Update or create the ServiceCategory type definition
export type ServiceCategory =
  | 'physiotherapist'
  | 'biokineticist'
  | 'dietician'
  | 'personal-trainer'
  | 'coaching'
  | 'psychology'
  | 'psychiatry'
  | 'family-medicine'
  | 'pain-management'
  | 'podiatrist'
  | 'general-practitioner'
  | 'sport-physician'
  | 'orthopedic-surgeon'
  | 'gastroenterology'
  | 'massage-therapy'
  | 'nutrition-coaching'  // Fixed: was 'nutrition-coach' in some files
  | 'occupational-therapy'
  | 'physical-therapy'
  | 'chiropractor'
  | 'nurse-practitioner'
  | 'cardiology'
  | 'dermatology'
  | 'neurology'
  | 'endocrinology'
  | 'urology'
  | 'oncology'
  | 'rheumatology'
  | 'pediatrics'
  | 'geriatrics'
  | 'sports-medicine'
  | 'internal-medicine'
  | 'orthopedics'
  | 'neurosurgery'
  | 'infectious-disease'
  | 'plastic-surgery'
  | 'obstetrics-gynecology'
  | 'emergency-medicine'
  | 'anesthesiology'
  | 'radiology'
  | 'geriatric-medicine'
  | 'all';  // Special type to refer to all services

// Additional types needed
export interface BudgetTier {
  name: string;
  range: { min: number; max: number };
  maxSessions: number;
  budget: number;
}

export interface ServiceConfigurationByBudget {
  low: {
    allocations: ServiceAllocation[];
    requiresDoctor: boolean;
    preferHighEnd: boolean;
  };
  medium: {
    allocations: ServiceAllocation[];
    requiresDoctor: boolean;
    preferHighEnd: boolean;
  };
  high: {
    allocations: ServiceAllocation[];
    requiresDoctor: boolean;
    preferHighEnd: boolean;
  };
}

export interface ServiceAllocation {
  type: ServiceCategory;
  percentage: number;
  priority: number;
  minSessions?: number;
  maxSessions?: number;
}

export interface ComorbidityGroup {
  name: string;
  conditions: string[];
  recommendedServices: ServiceCategory[];
  specialConsiderations: string[];
}

export interface SpecialPopulation {
  type: 'child' | 'elderly' | 'athlete' | 'pregnant' | 'chronic';
  ageRange?: [number, number];
  recommendedServices: ServiceCategory[];
  contraindicatedServices?: ServiceCategory[];
  specializedProviders: ServiceCategory[];
}

export interface UserPreference {
  preferredServiceTypes?: ServiceCategory[];
  avoidServiceTypes?: ServiceCategory[];
  previouslyUsedServices?: Array<{
    serviceType: ServiceCategory;
    usageCount: number;
    outcome: 'positive' | 'neutral' | 'negative';
  }>;
}

export type TreatmentModality = 
  | 'stretching' 
  | 'strength-training'
  | 'cardio'
  | 'rest'
  | 'diet-restriction'
  | 'activity';

export interface SessionAllocation {
  count: number;
  frequency?: string;
  costPerSession: number;
  totalCost: number;
  priorityLevel: 'high' | 'medium' | 'low';
}
