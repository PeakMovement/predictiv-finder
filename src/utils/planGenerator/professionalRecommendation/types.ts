
import { ServiceCategory } from "../types";

/**
 * Options for customizing professional recommendations
 */
export interface ProfessionalRecommendationOptions {
  budget?: number;
  preferredLocations?: string[];
  includeRemoteOptions?: boolean;
  maxProfessionals?: number;
  preferredTimeframe?: number;
  userPreferences?: Record<string, any>;
}

/**
 * Structure of a professional recommendation
 */
export interface ProfessionalRecommendation {
  category: ServiceCategory;
  sessions: number;
  priority?: 'high' | 'medium' | 'low';
  reasoning: string;
  estimatedCost?: number | null;
  practitioners?: {
    id: string;
    name: string;
    matchScore: number;
  }[];
}

/**
 * Structure for category-specific recommendations
 */
export interface CategoryRecommendation {
  category: ServiceCategory;
  importance: number;
  reasoning: string;
  score?: number; // Add this to match actual usage
  primaryCondition?: string; // Add this to match actual usage
  suggestedSchedule?: string;
}

/**
 * Complete result of professional recommendations
 */
export interface ProfessionalRecommendationResult {
  primaryRecommendations: ProfessionalRecommendation[]; // Changed from recommendations to primaryRecommendations
  primaryRecommendation?: ProfessionalRecommendation; // Keep for backward compatibility
  complementaryRecommendations?: ProfessionalRecommendation[]; // Add this to match actual usage
  totalEstimatedCost?: number | null;
  suggestedTimeframe?: string;
  alternativeApproaches?: {
    title: string;
    description: string;
    estimatedCost?: number;
  }[];
  constraints?: {
    budget?: boolean;
    location?: boolean;
    time?: boolean;
  };
  categoryRecommendations?: CategoryRecommendation[];
  notes?: string[]; // Add this to match actual usage
  budgetAllocation?: {   // Add this to match actual usage
    total: number;
    breakdown: Record<string, number>;
  };
}

/**
 * Service allocation record
 */
export interface ServiceAllocation {
  serviceType: ServiceCategory;
  sessions: number;
  practitionerId?: string;
  estimatedCost: number;
  description: string;
  reasoning?: string;
}

/**
 * Location analysis result
 */
export interface LocationAnalysisResult {
  preferredLocations: string[];
  isRemotePreferred: boolean;
  locationDetails?: string;
  maxDistance?: number;
}

/**
 * Budget analysis result
 */
export interface BudgetAnalysisResult {
  amount?: number;
  hasBudgetConstraint: boolean;
  isFlexible?: boolean;
  preferredSetting?: 'premium' | 'mid-range' | 'budget';
}

/**
 * Structure for a practitioner profile
 */
export interface PractitionerProfile {
  id: string;
  name: string;
  serviceCategory: ServiceCategory;
  specialization: string[];
  location: string;
  hasRemoteOption: boolean;
  costPerSession: number;
  rating: number;
  availability?: string;
  education?: string;
  experience?: number;
}
