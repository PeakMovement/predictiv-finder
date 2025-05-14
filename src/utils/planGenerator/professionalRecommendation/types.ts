
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
  serviceCategory: ServiceCategory;
  recommendedSessions: number;
  estimatedCost: number | null;
  urgency: 'high' | 'medium' | 'low';
  reasoning: string;
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
  suggestedSchedule?: string;
}

/**
 * Complete result of professional recommendations
 */
export interface ProfessionalRecommendationResult {
  recommendations: ProfessionalRecommendation[];
  totalEstimatedCost: number | null;
  suggestedTimeframe: string;
  primaryRecommendation?: ProfessionalRecommendation;
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
