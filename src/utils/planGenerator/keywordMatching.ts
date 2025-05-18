
import { ServiceCategory } from "./types";
import { createServiceCategoryRecord } from "./helpers/serviceRecordInitializer";

/**
 * Scores a piece of text against various service categories based on keyword matching
 * @param text The text to analyze
 * @param keywords Mapping of keywords to service categories
 * @returns Record of scores by service category
 */
export function scoreTextByKeywords(
  text: string,
  keywords: Record<string, ServiceCategory[]>
): Record<ServiceCategory, number> {
  const textLower = text.toLowerCase();
  
  // Initialize scores object with zeros for all service categories
  const scores = createServiceCategoryRecord(0);
  
  // Check each keyword against the text
  for (const keyword in keywords) {
    const keywordLower = keyword.toLowerCase();
    
    // If keyword is found in text
    if (textLower.includes(keywordLower)) {
      // Get relevant service categories for this keyword
      const services = keywords[keyword];
      
      // Increment scores for each relevant service
      services.forEach(service => {
        scores[service] += 1;
      });
    }
  }
  
  return scores;
}

/**
 * Calculate weighted scores for service categories based on keyword matches
 * @param text Text to analyze
 * @param keywordGroups Groups of keywords with different weights
 * @returns Weighted scores by service
 */
export function calculateWeightedServiceScores(
  text: string,
  keywordGroups: {
    highImportance: Record<string, ServiceCategory[]>;
    mediumImportance: Record<string, ServiceCategory[]>;
    lowImportance: Record<string, ServiceCategory[]>;
  }
): Record<ServiceCategory, number> {
  // Score text against each keyword group
  const highScores = scoreTextByKeywords(text, keywordGroups.highImportance);
  const mediumScores = scoreTextByKeywords(text, keywordGroups.mediumImportance);
  const lowScores = scoreTextByKeywords(text, keywordGroups.lowImportance);
  
  // Combine scores with appropriate weights
  const finalScores = createServiceCategoryRecord(0);
  
  // Apply weights to each category
  for (const category in finalScores) {
    const serviceCategory = category as ServiceCategory;
    finalScores[serviceCategory] = (
      (highScores[serviceCategory] * 3) +
      (mediumScores[serviceCategory] * 2) +
      (lowScores[serviceCategory] * 1)
    );
  }
  
  return finalScores;
}
