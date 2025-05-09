
import { ServiceCategory } from "../types";

/**
 * Result from the service matching process
 */
export interface ServiceMatchResult {
  category: ServiceCategory;
  score: number;
  relevanceFactors: string[];
  primaryCondition?: string;
  complementaryCategories?: ServiceCategory[];
  // Added enhancement to store evidence level for UI explanations
  evidenceLevel?: 'high' | 'medium' | 'low';
  // Added field to store alternative options when primary isn't available
  alternativeOptions?: ServiceCategory[];
}

/**
 * Service match with detailed reasoning
 */
export interface ServiceMatch {
  score: number;
  factors: string[];
  primaryCondition?: string;
  // Added fields for enhanced UI feedback
  confidenceLevel?: number; // 0-1 score indicating confidence in this match
  evidenceDescription?: string; // Brief summary of evidence for this match
  contraindications?: string[]; // Any reasons this service might not be suitable
}

/**
 * Type for service match tracking
 */
export type ServiceMatchRecord = Record<ServiceCategory, ServiceMatch>;

/**
 * Enhanced structure for visual comparison display
 */
export interface ServiceComparison {
  serviceType: ServiceCategory;
  costEffectiveness: number; // 0-1 score
  timeToResults: number; // Estimated weeks
  effectiveness: number; // 0-1 score
  sustainabilityScore: number; // 0-1 score
  prosCons: {
    pros: string[];
    cons: string[];
  };
}

/**
 * Common health concern suggestion
 */
export interface HealthConcernSuggestion {
  label: string;
  description: string;
  symptoms: string[];
  commonServices: ServiceCategory[];
}
