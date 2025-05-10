import { PlanContext } from "../types";

/**
 * Generates a descriptive name for a health plan based on context
 */
export const generatePlanName = (context: PlanContext): string => {
  const budgetTierPrefix = context.budgetTier ? 
    `${context.budgetTier.charAt(0).toUpperCase() + context.budgetTier.slice(1)} Budget:` :
    "Custom";
  
  // Special case for knee pain + race preparation
  const hasKneePain = context.medicalConditions?.some(c => 
    c.toLowerCase().includes('knee') && c.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = context.goal?.toLowerCase().includes('race') || 
                      context.goal?.toLowerCase().includes('run') ||
                      context.medicalConditions?.some(c => c.toLowerCase().includes('race preparation'));
  
  if (hasKneePain && hasRacePrep) {
    return `${budgetTierPrefix} Knee-Safe Race Preparation Plan`;
  }
  
  // Special cases for specific conditions
  const hasAnxiety = context.medicalConditions?.some(c => c.toLowerCase().includes('anxiety'));
  const hasNutrition = context.medicalConditions?.some(c => c.toLowerCase().includes('nutrition'));
  
  if (hasAnxiety && hasNutrition && hasRacePrep) {
    return `${budgetTierPrefix} Holistic Race Preparation Plan`;
  }
  
  if (hasAnxiety && hasNutrition) {
    return `${budgetTierPrefix} Nutrition & Mental Wellness Plan`;
  }
  
  if (hasAnxiety) {
    return `${budgetTierPrefix} Anxiety Management Plan`;
  }
  
  if (hasRacePrep) {
    return `${budgetTierPrefix} Race Training Plan`;
  }
  
  // Other conditions
  if (context.medicalConditions?.some(c => c.toLowerCase().includes('shoulder'))) {
    return `${budgetTierPrefix} Shoulder Recovery Plan`;
  }
  
  if (context.medicalConditions?.some(c => c.toLowerCase().includes('back'))) {
    return `${budgetTierPrefix} Back Pain Relief Plan`;
  }
  
  return `${budgetTierPrefix} Wellness Plan`;
};

/**
 * Generates a description for a health plan based on context
 */
export const generatePlanDescription = (context: PlanContext): string => {
  // Special case descriptions for common combined conditions
  const hasKneePain = context.medicalConditions?.some(c => 
    c.toLowerCase().includes('knee') && c.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = context.goal?.toLowerCase().includes('race') || 
                      context.goal?.toLowerCase().includes('run') ||
                      context.medicalConditions?.some(c => c.toLowerCase().includes('race preparation'));
  
  if (hasKneePain && hasRacePrep) {
    return "A balanced plan focusing on knee rehabilitation while preparing you for your race. " +
           "Includes modified training approaches that protect your knee while building necessary fitness.";
  }
  
  // Default description
  return "A personalized wellness plan designed for your specific needs and goals.";
};
