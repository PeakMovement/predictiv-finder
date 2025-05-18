
import { ServiceCategory } from "./types";
import type { AIHealthPlan } from "@/types"; // Updated import path
import { createServiceCategoryRecord } from './helpers/serviceRecordInitializer';

/**
 * Feedback system for evaluating health plans
 */

// Plan effectiveness score type
export type PlanEffectivenessScore = {
  overall: number;
  byCondition: Record<string, number>;
  byPractitioner: Record<ServiceCategory, number>;
};

// Feedback item type
export type PlanFeedbackItem = {
  aspect: string;
  score: number;
  feedback: string;
  suggestion?: string;
};

/**
 * Evaluate a generated health plan and provide feedback
 * @param plan The health plan to evaluate
 * @param userQuery The original user query
 * @returns Effectiveness score and feedback
 */
export function evaluateHealthPlan(
  plan: AIHealthPlan,
  userQuery: string
): {
  score: PlanEffectivenessScore;
  feedback: PlanFeedbackItem[];
} {
  // Initialize default scores
  const score: PlanEffectivenessScore = {
    overall: 0,
    byCondition: {},
    byPractitioner: createServiceCategoryRecord(0)
  };
  
  const feedback: PlanFeedbackItem[] = [];
  
  // Evaluate plan completeness
  const completenessScore = evaluatePlanCompleteness(plan);
  feedback.push({
    aspect: "Completeness",
    score: completenessScore,
    feedback: completenessScore > 0.7 
      ? "Plan addresses key health needs comprehensively" 
      : "Plan may be missing some important components",
    suggestion: completenessScore < 0.7 
      ? "Consider adding more detail about treatment approaches" 
      : undefined
  });
  
  // Evaluate practitioner matching
  const practitionerScore = evaluatePractitionerMatching(plan, userQuery);
  feedback.push({
    aspect: "Practitioner Selection",
    score: practitionerScore,
    feedback: practitionerScore > 0.7 
      ? "Practitioners well-matched to your health needs" 
      : "Some practitioners may not be optimal for your situation",
    suggestion: practitionerScore < 0.7 
      ? "Consider consulting with a healthcare provider for a second opinion" 
      : undefined
  });
  
  // Calculate overall score (weighted average)
  score.overall = (completenessScore * 0.5) + (practitionerScore * 0.5);
  
  // Additional evaluations could be added here
  
  return { score, feedback };
}

/**
 * Evaluate how complete the plan is
 */
function evaluatePlanCompleteness(plan: AIHealthPlan): number {
  let score = 0.5; // Base score
  
  // Check for plan name
  if (plan.name && plan.name.length > 5) {
    score += 0.1;
  }
  
  // Check for description
  if (plan.description && plan.description.length > 20) {
    score += 0.1;
  }
  
  // Check for services
  if (plan.services && plan.services.length > 0) {
    score += 0.3;
  }
  
  return Math.min(1.0, score);
}

/**
 * Evaluate how well practitioners match user needs
 */
function evaluatePractitionerMatching(plan: AIHealthPlan, userQuery: string): number {
  let score = 0.5; // Base score
  
  // This would normally use more sophisticated matching logic
  // For now use a simple implementation
  
  // Initialize practitioner scores
  const practitionerScores = createServiceCategoryRecord(0);
  
  // Count number of services with non-zero allocations
  const serviceCount = plan.services ? plan.services.length : 0;
  
  // Adjust score based on service count
  if (serviceCount >= 3) {
    score += 0.2;
  } else if (serviceCount >= 1) {
    score += 0.1;
  } else {
    score -= 0.1;
  }
  
  return Math.min(1.0, Math.max(0, score));
}
