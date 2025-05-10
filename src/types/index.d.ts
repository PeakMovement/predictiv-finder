
// Import ServiceCategory from planGenerator/types to use the same definition
import { ServiceCategory } from "../utils/planGenerator/types";
export type { ServiceCategory };

export type ServiceMode = 'online' | 'in-person' | 'both';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type GoalType = string;

export interface Practitioner {
  id: string;
  name: string;
  serviceType: ServiceCategory;
  pricePerSession: number;
  serviceTags: string[];
  location: string;
  isOnline: boolean;
  availability: string;
  imageUrl: string;
  bio: string;
  rating: number;
  maxPrice?: number;
  specialtyNotes?: string;
}

export interface AIHealthPlan {
  id: string;
  name: string;
  description: string;
  services: Array<{
    type: ServiceCategory;
    price: number;
    sessions: number;
    description: string;
    recommendedPractitioners?: Practitioner[];
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
}

export interface UserCriteria {
  categories: ServiceCategory[];
  goal?: string;
  budget: {
    monthly: number;
    preferredSetup: 'once-off' | 'monthly' | 'not-sure';
    flexibleBudget: boolean;
  };
  location?: string;
  locationRadius?: 'exact' | 'nearby' | 'anywhere';
  mode?: ServiceMode[];
  description?: string;
}

export interface DetailedUserCriteria {
  categories: ServiceCategory[];
  fitness?: {
    level: FitnessLevel;
    goal: string;
    injuries: string;
    trainingStyle: string;
  };
  nutrition?: {
    goal: string;
    restrictions: string[];
    struggles: string[];
    previousDietitian: boolean;
  };
  health?: {
    conditions: string;
    recovery: string;
    pain: string;
    openToReferrals: boolean;
  };
  recovery?: {
    weeklyTime: number;
    currentRoutine: string[];
    mindfulness: boolean;
  };
  budget: {
    monthly: number;
    preferredSetup: 'once-off' | 'monthly' | 'not-sure';
    flexibleBudget: boolean;
  };
  location?: string;
  locationRadius?: 'exact' | 'nearby' | 'anywhere';
  mode?: ServiceMode[];
}

export interface CategorySelectionProps {
  selectedCategories: ServiceCategory[];
  onCategoryToggle: (category: ServiceCategory) => void;
  onContinue: (categories: ServiceCategory[]) => void;
  suggestedCategories?: ServiceCategory[];
}

// Explicitly export PlanContext type needed by planGenerator modules
export interface PlanContext {
  ageGroup?: 'child' | 'teen' | 'adult' | 'senior';
  medicalConditions?: string[];
  goal?: string;
  budget?: number;
  budgetTier?: string;
  location?: string;
  isUrgent?: boolean;
  timeAvailability?: number;
}

// Explicitly export ServiceAllocation interface needed by planGenerator modules
export interface ServiceAllocation {
  type: ServiceCategory;
  price: number;
  sessions: number;
  description: string;
  frequency?: string;
}
