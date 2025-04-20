export type ServiceCategory = 
  | 'dietician'
  | 'personal-trainer'
  | 'biokineticist'
  | 'physiotherapist'
  | 'coaching'
  | 'family-medicine'
  | 'internal-medicine'
  | 'pediatrics'
  | 'cardiology'
  | 'dermatology'
  | 'orthopedics'
  | 'neurology'
  | 'gastroenterology'
  | 'obstetrics-gynecology'
  | 'emergency-medicine'
  | 'psychiatry'
  | 'anesthesiology'
  | 'endocrinology'
  | 'urology'
  | 'oncology'
  | 'neurosurgery'
  | 'infectious-disease'
  | 'radiology'
  | 'geriatric-medicine'
  | 'plastic-surgery'
  | 'rheumatology'
  | 'pain-management';

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
  services: {
    type: ServiceCategory;
    price: number;
    sessions: number;
    description: string;
    recommendedPractitioners?: Practitioner[];
  }[];
  totalCost: number;
  planType: 'best-fit' | 'high-impact' | 'progressive';
  timeFrame: string;
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
