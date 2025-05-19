/**
 * Enhanced goal analyzer module
 * Refactored from the original large file
 */

import { ServiceCategory } from "../types";
import { logger } from "@/utils/cache";

/**
 * Analyzes user goals and suggests relevant service categories
 * @param goal User's stated goal
 * @returns Suggested service categories based on the goal
 */
export function analyzeUserGoal(goal: string): ServiceCategory[] {
  try {
    logger.debug("Analyzing user goal:", goal);
    
    const lowerGoal = goal.toLowerCase();
    const suggestedCategories: ServiceCategory[] = [];
    
    // Goal-based service suggestions
    if (lowerGoal.includes('weight loss') || lowerGoal.includes('lose weight')) {
      suggestedCategories.push('dietician', 'personal-trainer');
    }
    
    if (lowerGoal.includes('gain muscle') || lowerGoal.includes('build muscle')) {
      suggestedCategories.push('personal-trainer', 'dietician');
    }
    
    if (lowerGoal.includes('reduce stress') || lowerGoal.includes('manage stress')) {
      suggestedCategories.push('psychology', 'coaching');
    }
    
    if (lowerGoal.includes('improve fitness') || lowerGoal.includes('get fitter')) {
      suggestedCategories.push('personal-trainer', 'physiotherapist');
    }
    
    if (lowerGoal.includes('recover from injury') || lowerGoal.includes('rehabilitation')) {
      suggestedCategories.push('physiotherapist', 'biokineticist');
    }
    
    if (lowerGoal.includes('improve diet') || lowerGoal.includes('eat healthier')) {
      suggestedCategories.push('dietician', 'nutrition-coaching');
    }
    
    if (lowerGoal.includes('manage pain') || lowerGoal.includes('reduce pain')) {
      suggestedCategories.push('pain-management', 'physiotherapist');
    }
    
    if (lowerGoal.includes('improve sleep') || lowerGoal.includes('sleep better')) {
      suggestedCategories.push('psychology', 'coaching');
    }
    
    if (lowerGoal.includes('increase energy') || lowerGoal.includes('reduce fatigue')) {
      suggestedCategories.push('dietician', 'personal-trainer');
    }
    
    if (lowerGoal.includes('improve mobility') || lowerGoal.includes('move better')) {
      suggestedCategories.push('physiotherapist', 'biokineticist');
    }
    
    return suggestedCategories;
  } catch (error) {
    logger.error("Error analyzing user goal:", error);
    return [];
  }
}

/**
 * Extracts specific goals from user input
 * @param userInput Text input from the user
 * @returns Array of extracted goals
 */
export function extractGoals(userInput: string): string[] {
  try {
    logger.debug("Extracting goals from user input:", userInput);
    
    const lowerInput = userInput.toLowerCase();
    const extractedGoals: string[] = [];
    
    // Goal extraction patterns
    if (lowerInput.includes('weight loss') || lowerInput.includes('lose weight')) {
      extractedGoals.push('weight loss');
    }
    
    if (lowerInput.includes('gain muscle') || lowerInput.includes('build muscle')) {
      extractedGoals.push('muscle gain');
    }
    
    if (lowerInput.includes('reduce stress') || lowerInput.includes('manage stress')) {
      extractedGoals.push('stress reduction');
    }
    
    if (lowerInput.includes('improve fitness') || lowerInput.includes('get fitter')) {
      extractedGoals.push('fitness improvement');
    }
    
    if (lowerInput.includes('recover from injury') || lowerInput.includes('rehabilitation')) {
      extractedGoals.push('injury recovery');
    }
    
    if (lowerInput.includes('improve diet') || lowerInput.includes('eat healthier')) {
      extractedGoals.push('diet improvement');
    }
    
    if (lowerInput.includes('manage pain') || lowerInput.includes('reduce pain')) {
      extractedGoals.push('pain management');
    }
    
    if (lowerInput.includes('improve sleep') || lowerInput.includes('sleep better')) {
      extractedGoals.push('sleep improvement');
    }
    
    if (lowerInput.includes('increase energy') || lowerInput.includes('reduce fatigue')) {
      extractedGoals.push('energy increase');
    }
    
    if (lowerInput.includes('improve mobility') || lowerInput.includes('move better')) {
      extractedGoals.push('mobility improvement');
    }
    
    return extractedGoals;
  } catch (error) {
    logger.error("Error extracting goals from user input:", error);
    return [];
  }
}

/**
 * Suggests primary service category based on user goal
 * @param goal User's stated goal
 * @returns Primary service category based on the goal
 */
export function suggestPrimaryCategoryForGoal(goal: string): ServiceCategory | null {
  try {
    logger.debug("Suggesting primary category for goal:", goal);
    
    const lowerGoal = goal.toLowerCase();
    let primaryCategory: ServiceCategory | null = null;
    
    // Goal-based primary category suggestions
    if (lowerGoal.includes('weight loss') || lowerGoal.includes('lose weight')) {
      primaryCategory = 'dietician';
    }
    
    if (lowerGoal.includes('gain muscle') || lowerGoal.includes('build muscle')) {
      primaryCategory = 'personal-trainer';
    }
    
    if (lowerGoal.includes('reduce stress') || lowerGoal.includes('manage stress')) {
      primaryCategory = 'psychology';
    }
    
    if (lowerGoal.includes('improve fitness') || lowerGoal.includes('get fitter')) {
      primaryCategory = 'personal-trainer';
    }
    
    if (lowerGoal.includes('recover from injury') || lowerGoal.includes('rehabilitation')) {
      primaryCategory = 'physiotherapist';
    }
    
    if (lowerGoal.includes('improve diet') || lowerGoal.includes('eat healthier')) {
      primaryCategory = 'dietician';
    }
    
    if (lowerGoal.includes('manage pain') || lowerGoal.includes('reduce pain')) {
      primaryCategory = 'pain-management';
    }
    
    if (lowerGoal.includes('improve sleep') || lowerGoal.includes('sleep better')) {
      primaryCategory = 'psychology';
    }
    
    if (lowerGoal.includes('increase energy') || lowerGoal.includes('reduce fatigue')) {
      primaryCategory = 'dietician';
    }
    
    if (lowerGoal.includes('improve mobility') || lowerGoal.includes('move better')) {
      primaryCategory = 'physiotherapist';
    }

    if (lowerGoal.includes('running') || lowerGoal.includes('marathon')) {
      const suggestedCategories: ServiceCategory[] = [];
      suggestedCategories.push('personal-trainer', 'run-coaching');
      primaryCategory = 'run-coaching';
    }
    
    return primaryCategory;
  } catch (error) {
    logger.error("Error suggesting primary category for goal:", error);
    return null;
  }
}
