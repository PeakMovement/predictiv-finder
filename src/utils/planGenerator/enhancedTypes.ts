
import { ServiceCategory } from "./types";

export interface AnalyzedInput {
  medicalConditions: string[];
  suggestedCategories: ServiceCategory[];
  budget?: number;
  location?: string;
  preferOnline?: boolean;
  severity: Record<string, number>; // Severity score (0-1) for each condition
  preferences: Record<string, string>; // User-specific preferences
  timeAvailability: number; // Hours per week available for services
  timeFrame?: string; // Desired timeframe (e.g., "3 months")
  specificGoals?: Record<string, any>; // Specific goals like weight loss amount
}

export interface EnhancedServiceAllocation {
  type: ServiceCategory;
  percentage: number;
  priority: number;
  minSessions?: number;
  maxSessions?: number;
  costPerSession?: number;
}

export interface PlanNote {
  type: 'info' | 'warning' | 'success';
  message: string;
}

export interface EnhancedPlanContext {
  budget: number;
  location?: string;
  goal?: string;
  medicalConditions: string[];
  preferOnline?: boolean;
  severity: Record<string, number>;
  preferences: Record<string, string>;
  timeAvailability: number;
  timeFrame?: string;
  specificGoals?: Record<string, any>;
}
