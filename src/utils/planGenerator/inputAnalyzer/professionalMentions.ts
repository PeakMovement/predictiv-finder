
import { ServiceCategory } from "../types";
import { PROFESSIONAL_KEYWORDS } from "../professionalKeywords";
import { PROFESSIONAL_PHRASES } from "../professionalPhrases";

/**
 * Detects mentions of professionals in user input
 * @param userInput User's description of their health needs
 * @returns Array of detected professional categories
 */
export function detectProfessionalMentions(userInput: string): ServiceCategory[] {
  const inputLower = userInput.toLowerCase();
  const detectedCategories = new Set<ServiceCategory>();
  
  // Check direct mentions of professional types
  PROFESSIONAL_KEYWORDS.forEach(prof => {
    // Check for the category name
    if (inputLower.includes(prof.category.toLowerCase())) {
      detectedCategories.add(prof.category as ServiceCategory);
    }
    
    // Check for synonyms
    prof.synonyms.forEach(synonym => {
      if (inputLower.includes(synonym.toLowerCase())) {
        detectedCategories.add(prof.category as ServiceCategory);
      }
    });
    
    // Check for treatments offered by this professional
    prof.treatments.forEach(treatment => {
      if (inputLower.includes(treatment.toLowerCase())) {
        detectedCategories.add(prof.category as ServiceCategory);
      }
    });
  });
  
  // Check for professional phrases
  Object.entries(PROFESSIONAL_PHRASES).forEach(([category, phrases]) => {
    phrases.forEach(phrase => {
      if (inputLower.includes(phrase.toLowerCase())) {
        detectedCategories.add(category as ServiceCategory);
      }
    });
  });
  
  return Array.from(detectedCategories);
}
