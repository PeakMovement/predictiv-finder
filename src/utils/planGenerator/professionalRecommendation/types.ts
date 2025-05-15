
import { ServiceCategory } from "../types";

export interface ProfessionalRecommendationOptions {
  // Optional configuration options
  maxRecommendations?: number;
  includeAlternatives?: boolean;
  locationLimit?: string;
  detailedReasoning?: boolean;
}

export interface CategoryRecommendation {
  category: ServiceCategory;
  score: number;
  reasoning?: string;
  primaryCondition?: string;
}

export interface ProfessionalRecommendation {
  category: ServiceCategory;
  sessions: number;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface BudgetAllocationItem {
  category: ServiceCategory;
  amount: number;
  percentage?: number;
}

export interface ProfessionalRecommendationResult {
  primaryRecommendations: ProfessionalRecommendation[];
  complementaryRecommendations?: ProfessionalRecommendation[];
  alternativeOptions?: {
    category: ServiceCategory;
    alternatives: ServiceCategory[];
    reason: string;
  }[];
  notes?: string[];
  budgetAllocation?: {
    total: number;
    breakdown: Record<string, number>;
  };
}

export interface ScenarioResult {
  scenario: string;
  confidence: number;
  mainIssue?: string;
  recommendations: {
    primaryProfessional: ServiceCategory;
    secondaryProfessional?: ServiceCategory;
    supportingProfessionals?: ServiceCategory[];
    rationale: string;
  };
}
