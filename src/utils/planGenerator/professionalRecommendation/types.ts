
import { ServiceCategory } from "../types";

export interface ProfessionalRecommendation {
  category: ServiceCategory;
  score: number;
  primaryCondition?: string;
  idealSessions: number;
  estimatedBudget: number;
  idealTiming: string;
  severity: number;
  notes: string[];
  preferredTraits?: string[];
}

export interface CategoryRecommendation {
  category: ServiceCategory;
  score: number;
  primaryCondition?: string;
}

export interface RecommendationGoal {
  type: string;
  priority: number;
  description: string;
}

export interface ServiceTimingPreference {
  frequency: number; // sessions per week/month
  duration: number; // weeks/months
  intensity: 'light' | 'moderate' | 'intensive';
}

export interface TraitPreference {
  trait: string;
  importance: number; // 0-1 scale
  reason?: string;
}
