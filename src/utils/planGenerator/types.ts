// Define ServiceCategory as a string enum equivalent for better type safety
export type ServiceCategory =
  | 'physiotherapist'
  | 'biokineticist'
  | 'dietician'
  | 'personal-trainer'
  | 'pain-management'
  | 'coaching'
  | 'psychology'
  | 'psychiatry'
  | 'podiatrist'
  | 'general-practitioner'
  | 'sport-physician'
  | 'orthopedic-surgeon'
  | 'family-medicine'
  | 'gastroenterology'
  | 'massage-therapy'
  | 'nutrition-coaching'
  | 'strength-coaching'
  | 'run-coaches'
  | 'occupational-therapy'
  | 'physical-therapy'
  | 'chiropractor'
  | 'nurse-practitioner'
  // Added new categories to support more specialties
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
  // Add missing categories that appear in the errors
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
  | string // Allow string type to be compatible with AIHealthPlan
  | 'all'; // Special case for filtering/selection

// Re-export AIHealthPlan interface
export interface AIHealthPlan {
  id: string;
  name: string;
  description: string;
  services: Array<{
    type: ServiceCategory;
    price: number;
    sessions: number;
    description: string;
    recommendedPractitioners?: any[];
    frequency?: string;
  }>;
  totalCost: number;
  planType: 'best-fit' | 'high-impact' | 'progressive';
  timeFrame: string;
  
  // Fields for UI/UX enhancements
  expectedOutcomes?: Array<{
    milestone: string;
    timeframe: string;
    description: string;
  }>;
  
  rationales?: Array<{
    service: ServiceCategory;
    rationale: string;
    evidenceLevel: "high" | "medium" | "low";
  }>;
  
  progressTimeline?: Array<{
    week: number;
    milestone: string;
    focus: string;
  }>;
  
  alternativeOptions?: Array<{
    originalService: ServiceCategory;
    alternatives: ServiceCategory[];
    reason: string;
  }>;

  // Add additional properties that are being accessed elsewhere
  recommendedServices?: ServiceCategory[];
  serviceDescriptions?: any[];
  suggestedProfessionals?: any[];
  matchScore?: number;
  goal?: string;
  primaryFocus?: string;
  complexity?: number;
  intensity?: string;
}

// Define shared types that are used across multiple modules
export interface BaseCosts {
  [key: string]: number;
}

export const BASELINE_COSTS: Record<ServiceCategory, number> = {
  'physiotherapist': 850,
  'biokineticist': 700,
  'dietician': 650,
  'personal-trainer': 550,
  'pain-management': 900,
  'coaching': 600,
  'psychology': 1200,
  'psychiatry': 1500,
  'podiatrist': 750,
  'general-practitioner': 800,
  'sport-physician': 1200,
  'orthopedic-surgeon': 2000,
  'family-medicine': 750,
  'gastroenterology': 1400,
  'massage-therapy': 500,
  'nutrition-coaching': 550,
  'strength-coaching': 550,
  'run-coaches': 550,
  'occupational-therapy': 700,
  'physical-therapy': 800,
  'chiropractor': 650,
  'nurse-practitioner': 600,
  'cardiology': 1400,
  'dermatology': 1000,
  'neurology': 1300,
  'endocrinology': 1200,
  'urology': 1100,
  'oncology': 1600,
  'rheumatology': 1000,
  'pediatrics': 900,
  'geriatrics': 950,
  'sports-medicine': 1100,
  'internal-medicine': 1000,
  'orthopedics': 1400,
  'neurosurgery': 2200,
  'infectious-disease': 1300,
  'plastic-surgery': 2100,
  'obstetrics-gynecology': 1100,
  'emergency-medicine': 1500,
  'anesthesiology': 1700,
  'radiology': 1200,
  'geriatric-medicine': 900,
  'all': 0
};

export interface OptimizedService {
  type: ServiceCategory;
  sessions: number;
  cost: number;
  frequency?: string;
  costPerSession: number;
  totalCost: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface LegacyPriceRange {
  affordable: number;
  highEnd: number;
}

export interface BudgetTier {
  name: string;
  range: PriceRange;
  maxSessions: number;
  budget: number;
}

export interface ServiceAllocationItem {
  type: ServiceCategory;
  percentage: number;
  priority: number;
  minSessions?: number;
  maxSessions?: number;
}

// Updated ServiceAllocation to include priority
export interface ServiceAllocation {
  type: ServiceCategory;
  price: number;
  sessions: number;
  description: string;
  frequency?: string;
  priority?: number; // Added priority field to resolve errors
}

export interface SpecialGroupDiscount {
  group: 'student' | 'senior' | 'child' | 'loyalty' | 'athlete' | 'military';
  discountPercentage: number;
  applicableServices: ServiceCategory[];
  minimumSessions?: number;
}

export interface ComorbidityGroup {
  name: string;
  conditions: string[];
  recommendedServices: ServiceCategory[];
  specialConsiderations?: string[];
}

export interface SpecialPopulation {
  type: 'child' | 'elderly' | 'athlete' | 'pregnant' | 'chronic';
  ageRange?: [number, number];
  recommendedServices: ServiceCategory[];
  contraindicatedServices?: ServiceCategory[];
  specializedProviders?: ServiceCategory[];
}

export interface UserPreference {
  preferredServiceTypes?: ServiceCategory[];
  avoidServiceTypes?: ServiceCategory[];
  previouslyUsedServices?: {
    serviceType: ServiceCategory;
    outcome: 'positive' | 'neutral' | 'negative';
    usageCount: number;
  }[];
  timePreference?: 'morning' | 'afternoon' | 'evening' | 'weekend';
  locationPreference?: 'remote' | 'in-person' | 'hybrid';
  budgetSensitivity?: 'very-sensitive' | 'somewhat-sensitive' | 'not-sensitive';
}

export interface BudgetAllocationStrategy {
  name: string;
  description: string;
  priorityServices: ServiceCategory[];
  minimumSessionsPerService: Record<ServiceCategory, number>;
  balancingFactor: number;
  overspendAllowed: boolean;
  maxOverspendPercentage?: number;
}

export interface ServiceConfigurationByBudget {
  [key: string]: {
    allocations: ServiceAllocationItem[];
    requiresDoctor: boolean;
    preferHighEnd: boolean;
  };
}

export interface PlanContext {
  ageGroup?: 'child' | 'teen' | 'adult' | 'senior';
  medicalConditions?: string[];
  goal?: string;
  budget?: number;
  budgetTier?: { name: string }; 
  location?: string;
  isUrgent?: boolean;
  timeAvailability?: number;
  preferOnline?: boolean;
  
  // Add missing properties that were causing errors
  name?: string;
  description?: string;
  primaryFocus?: string;
  serviceCount?: number;
  intensity?: string;
  duration?: string;
  isRemote?: boolean;
}

export interface SessionAllocation {
  sessions: number;
  costPerSession: number;
  totalCost: number;
}
