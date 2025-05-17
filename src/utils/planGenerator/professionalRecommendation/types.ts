
import { ServiceCategory } from "../types";

/**
 * Types for professional recommendations module
 */

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

export interface BudgetAllocation {
  total: number;
  breakdown: Record<ServiceCategory, number>;
}

export interface ProfessionalRecommendationResult {
  primaryRecommendations: ProfessionalRecommendation[];
  complementaryRecommendations?: ProfessionalRecommendation[];
  budgetAllocation?: BudgetAllocation;
  notes?: string[];
}

export interface ScenarioResult {
  scenarioName: string;
  confidence: number;
  mainIssue?: string;
  recommendations: {
    primaryProfessional: ServiceCategory;
    secondaryProfessional?: ServiceCategory;
    supportingProfessionals?: ServiceCategory[];
    rationale: string;
  };
}

export interface ProfessionalMatch {
  serviceType: ServiceCategory;
  matchScore: number;
  reasoning: string;
}

export enum EvidenceLevel {
  HIGH = "high",
  MEDIUM = "medium", 
  LOW = "low"
}

export interface AnalysisResult {
  symptoms: string[];
  goals: string[];
  severityScores: Record<string, number>;
  contraindications: ServiceCategory[];
  locationInfo: {
    location?: string;
    isRemote: boolean;
  };
  hasBudgetConstraint: boolean;
  budget?: number;
}

export interface SessionAllocation {
  sessions: number;
  costPerSession: number;
  totalCost: number;
  count: number; // Required for compatibility
  priorityLevel: 'high' | 'medium' | 'low'; // Required for compatibility
}

export interface ServicePricing {
  category: ServiceCategory;
  basePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
}

// Budget-related types
export interface BudgetConstraint {
  total: number;
  monthly?: number;
  perSession?: number;
  maxSessions?: number;
}

// Enhanced types to store budget alternatives
export interface BudgetAlternative {
  originalService: ServiceCategory;
  alternatives: ServiceCategory[];
  costReduction: number;
}
