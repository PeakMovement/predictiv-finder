
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
