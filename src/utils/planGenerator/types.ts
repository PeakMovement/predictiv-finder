
// Define the ServiceCategory type
export type ServiceCategory =
  | 'physiotherapist'
  | 'biokineticist'
  | 'dietician'
  | 'personal-trainer'
  | 'psychology'
  | 'coaching'
  | 'psychiatry'
  | 'general-practitioner'
  | 'family-medicine'
  | 'cardiology'
  | 'endocrinology'
  | 'gastroenterology'
  | 'neurology'
  | 'orthopedic-surgeon'
  | 'rheumatology'
  | 'sports-medicine'
  | 'dermatology'
  | 'gynecology'
  | 'ophthalmology'
  | 'pain-management'
  | 'podiatrist'
  | 'occupational-therapy'
  | 'speech-therapy'
  | 'audiology'
  | 'nutrition-coaching'
  | 'chiropractor'
  | 'massage-therapy'
  | 'acupuncture'
  | 'yoga-instructor'
  | 'pilates-instructor'
  | 'tai-chi-instructor'
  | 'naturopathy'
  | 'homeopathy'
  | 'osteopathy'
  | 'pharmacy'
  | 'medical-specialist'
  | 'pediatrics'
  | 'geriatrics'
  | 'physical-therapy'
  | 'strength-coaching'
  | 'run-coaching'
  | 'internal-medicine'
  | 'infectious-disease'
  | 'plastic-surgery'
  | 'orthopedics'
  | 'neurosurgery'
  | 'oncology'
  | 'urology'
  | 'obstetrics-gynecology'
  | 'emergency-medicine'
  | 'anesthesiology'
  | 'radiology'
  | 'geriatric-medicine'
  | 'sport-physician'
  | 'nurse-practitioner'
  | 'all';

// Define the ServiceAllocation interface
export interface ServiceAllocation {
  type: ServiceCategory;
  count: number;
  priorityLevel: 'critical' | 'high' | 'medium' | 'low';
  costPerSession?: number;
  totalCost?: number;
  sessions?: number;
}

// Add ServiceAllocationItem type that was missing
export interface ServiceAllocationItem {
  type: ServiceCategory;
  percentage: number;
  priority: number;
  minSessions?: number;
  maxSessions?: number;
}

// Add PlanContext interface
export interface PlanContext {
  ageGroup?: 'child' | 'teen' | 'adult' | 'senior';
  medicalConditions?: string[];
  goal?: string;
  budget?: number;
  budgetTier?: string;
  location?: string;
  isUrgent?: boolean;
  timeAvailability?: number;
  preferOnline?: boolean;
  isRemote?: boolean;
  serviceCount?: number;
  intensity?: 'light' | 'standard' | 'intensive';
  duration?: 'short-term' | 'medium-term' | 'long-term';
}

// Update BudgetTier from string union to interface to match how it's used
export interface BudgetTier {
  name: string;
  range: { min: number; max: number };
  maxSessions: number;
  budget: number;
}

export const BASELINE_COSTS: Record<ServiceCategory, number> = {
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

export interface PriceRange {
  min: number;
  max: number;
}

// Update LegacyPriceRange to match how it's being used
export interface LegacyPriceRange {
  low: number;
  high: number;
  affordable?: number;
  highEnd?: number;
}

export interface ServiceConfigurationByBudget {
  [key: string]: {
    allocations: Array<ServiceAllocationItem>;
    requiresDoctor: boolean;
    preferHighEnd: boolean;
  };
}

// Define the ComorbidityGroup interface
export interface ComorbidityGroup {
  name: string;
  conditions: string[];
  recommendedServices: ServiceCategory[];
  specialConsiderations: string[];
}

// Define the SpecialPopulation interface
export interface SpecialPopulation {
  type: 'child' | 'elderly' | 'athlete' | 'pregnant' | 'chronic';
  ageRange?: [number, number]; // Min and max age
  recommendedServices: ServiceCategory[];
  contraindicatedServices?: ServiceCategory[];
  specializedProviders: ServiceCategory[];
}

// Define the UserPreference interface
export interface UserPreference {
  preferredServiceTypes?: ServiceCategory[];
  avoidServiceTypes?: ServiceCategory[];
  previouslyUsedServices?: Array<{
    serviceType: ServiceCategory;
    outcome: 'positive' | 'negative' | 'neutral';
    usageCount: number;
  }>;
  preferredSessionFrequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  budgetConstraint?: number;
}

// Update TreatmentModality to include all the values being used
export type TreatmentModality = 
  | 'in-person'
  | 'remote'
  | 'hybrid'
  | 'stretching'
  | 'strength-training'
  | 'rest'
  | 'activity'
  | 'diet-restriction'
  | 'cardio'
  | 'medication'
  | 'activity-modification'
  | 'cognitive-behavioral'
  | 'relaxation'
  | 'performance-nutrition'
  | 'isometric-exercise'
  | 'light-activity'
  | 'portion-control'
  | 'meal-timing';
