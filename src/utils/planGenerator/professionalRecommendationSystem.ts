
// Re-export from the new modular structure
import { 
  generateProfessionalRecommendations 
} from "./professionalRecommendation";

import {
  ProfessionalRecommendationOptions,
  ProfessionalRecommendationResult
} from "./professionalRecommendation/types";

/**
 * Generate professional recommendations based on user input
 */
export function getProfessionalRecommendations(
  userInput: string,
  options: ProfessionalRecommendationOptions = {}
): ProfessionalRecommendationResult {
  return generateProfessionalRecommendations(userInput, options);
}

// Re-export types and other utilities for backward compatibility
export * from "./professionalRecommendation/types";
