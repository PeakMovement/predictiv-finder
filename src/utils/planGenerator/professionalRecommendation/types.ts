
import { ServiceCategory } from "../types";

/**
 * Professional recommendation priority levels
 */
export type RecommendationPriority = 'high' | 'medium' | 'low';

/**
 * Basic recommendation for a professional category with importance score
 */
export interface CategoryRecommendation {
  category: string;
  score: number;
  importance: number;
  reasoning?: string;
  primaryCondition?: string;
}

/**
 * Detailed professional recommendation with session count and priority
 */
export interface ProfessionalRecommendation {
  category: string;
  sessions: number;
  priority?: RecommendationPriority;
  reasoning?: string;
}

/**
 * Budget allocation for professional recommendations
 */
export interface BudgetAllocation {
  total: number;
  breakdown: Record<string, number>;
}

/**
 * Complete recommendation result returned by the API
 */
export interface ProfessionalRecommendationResult {
  primaryRecommendations: ProfessionalRecommendation[];
  complementaryRecommendations?: ProfessionalRecommendation[];
  budgetAllocation?: BudgetAllocation;
  notes?: string[];
}

/**
 * Options for customizing recommendation generation
 */
export interface ProfessionalRecommendationOptions {
  includeBudget?: boolean;
  includeSupporting?: boolean;
  maxRecommendations?: number;
  prioritizeRemote?: boolean;
  location?: string;
}
