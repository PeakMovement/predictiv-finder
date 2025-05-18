
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
  | 'nutrition-coaching'
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
  | 'strength-coaching'  // Added this
  | 'run-coaching'       // Added this
  | 'all';  // Special type to refer to all services

// Define baseline costs for service categories - useful for budget calculations
export const BASELINE_COSTS: Record<ServiceCategory, number> = {
  'physiotherapist': 600,
  'biokineticist': 550,
  'dietician': 500,
  'personal-trainer': 450,
  'coaching': 400,
  'psychology': 800,
  'psychiatry': 1000,
  'family-medicine': 550,
  'pain-management': 700,
  'podiatrist': 550,
  'general-practitioner': 600,
  'sport-physician': 800,
  'orthopedic-surgeon': 1200,
  'gastroenterology': 900,
  'massage-therapy': 350,
  'nutrition-coaching': 400,
  'occupational-therapy': 500,
  'physical-therapy': 550,
  'chiropractor': 450,
  'nurse-practitioner': 400,
  'cardiology': 900,
  'dermatology': 700,
  'neurology': 850,
  'endocrinology': 800,
  'urology': 750,
  'oncology': 1100,
  'rheumatology': 750,
  'pediatrics': 600,
  'geriatrics': 650,
  'sports-medicine': 700,
  'internal-medicine': 700,
  'orthopedics': 900,
  'neurosurgery': 1500,
  'infectious-disease': 850,
  'plastic-surgery': 1400,
  'obstetrics-gynecology': 750,
  'emergency-medicine': 1000,
  'anesthesiology': 1100,
  'radiology': 800,
  'geriatric-medicine': 650,
  'strength-coaching': 550,  // Added this
  'run-coaching': 600,       // Added this
  'all': 0
};

// Update the TreatmentModality type to include all the treatment types used in the codebase
export type TreatmentModality = 
  | 'stretching' 
  | 'strength-training'
  | 'cardio'
  | 'rest'
  | 'diet-restriction'
  | 'activity'
  | 'medication'
  | 'activity-modification'
  | 'cognitive-behavioral'
  | 'relaxation'
  | 'performance-nutrition'
  | 'isometric-exercise'
  | 'light-activity'
  | 'portion-control'
  | 'meal-timing';

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

// Updated ServiceAllocation interfaces to support both old and new formats
export interface ServiceAllocation {
  type: ServiceCategory;
  percentage: number;
  priority: number;
  minSessions?: number;
  maxSessions?: number;
  sessions?: number;  // Added for compatibility
  description?: string; // Added for compatibility
  frequency?: string; // Added for compatibility
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

export interface SessionAllocation {
  count: number;
  sessions?: number; // For backward compatibility
  frequency?: string;
  costPerSession: number;
  totalCost: number;
  priorityLevel: 'high' | 'medium' | 'low';
}

// Additional context interfaces
export interface PriceRange {
  min: number;
  max: number;
}

// For compatibility with older code
export interface LegacyPriceRange {
  affordable: number;
  highEnd: number;
}

export interface PlanContext {
  goal?: string;
  medicalConditions?: string[];
  location?: string;
  preferOnline?: boolean;
  isRemote?: boolean;
  budget?: number;
  budgetTier?: string;
  serviceCount?: number;
  intensity?: 'light' | 'standard' | 'intensive';
  duration?: 'short-term' | 'medium-term' | 'long-term';
  timeAvailability?: number; // Add the missing field
  ageGroup?: 'child' | 'teen' | 'adult' | 'senior'; // Add the missing field from PlanContext in types.d.ts
  isUrgent?: boolean; // Add the missing field from PlanContext in types.d.ts
}

export interface ServiceAllocationItem {
  type: ServiceCategory;
  percentage: number;
  priority: number;
  price?: number; // Added for compatibility
  sessions?: number; // Added for compatibility 
  description?: string; // Added for compatibility
}
