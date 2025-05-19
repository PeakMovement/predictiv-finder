
import { ServiceCategory } from "../types";

// Define the types for professional keywords and phrases
interface ProfessionalKeywordMapping {
  category: string;
  synonyms: string[];
  treatments: string[];
}

interface ProfessionalPhraseMapping {
  [category: string]: string[];
}

// Placeholder data for PROFESSIONAL_KEYWORDS (you may need to replace with actual data)
export const PROFESSIONAL_KEYWORDS: ProfessionalKeywordMapping[] = [
  {
    category: "physiotherapist",
    synonyms: ["physio", "physical therapist"],
    treatments: ["rehabilitation", "manual therapy", "joint manipulation"]
  },
  {
    category: "dietician",
    synonyms: ["nutritionist", "diet specialist"],
    treatments: ["meal planning", "nutritional therapy", "dietary assessment"]
  },
  // Add more as needed
];

// Placeholder data for PROFESSIONAL_PHRASES (you may need to replace with actual data)
export const PROFESSIONAL_PHRASES: ProfessionalPhraseMapping = {
  "physiotherapist": ["help with joint pain", "recover from injury", "improve mobility"],
  "dietician": ["manage my diet", "lose weight with nutrition", "dietary advice"],
  // Add more as needed
};

// Service providers with confidence score
interface ServiceProvider {
  serviceCategory: ServiceCategory;
  confidence: number;
}

/**
 * Detects mentions of professionals in user input
 * @param userInput User's description of their health needs
 * @returns Array of detected professional categories with confidence scores
 */
export function detectProfessionalMentions(userInput: string): ServiceProvider[] {
  const inputLower = userInput.toLowerCase();
  const detectedCategories = new Map<ServiceCategory, number>();
  
  // Check direct mentions of professional types
  PROFESSIONAL_KEYWORDS.forEach(prof => {
    // Check for the category name
    if (inputLower.includes(prof.category.toLowerCase())) {
      detectedCategories.set(prof.category as ServiceCategory, 0.9); // High confidence for direct mention
    }
    
    // Check for synonyms
    prof.synonyms.forEach(synonym => {
      if (inputLower.includes(synonym.toLowerCase())) {
        detectedCategories.set(prof.category as ServiceCategory, 0.8); // Good confidence for synonym
      }
    });
    
    // Check for treatments offered by this professional
    prof.treatments.forEach(treatment => {
      if (inputLower.includes(treatment.toLowerCase())) {
        detectedCategories.set(prof.category as ServiceCategory, 0.7); // Moderate confidence for treatment mention
      }
    });
  });
  
  // Check for professional phrases
  Object.entries(PROFESSIONAL_PHRASES).forEach(([category, phrases]) => {
    phrases.forEach(phrase => {
      if (inputLower.includes(phrase.toLowerCase())) {
        detectedCategories.set(category as ServiceCategory, 0.85); // Good confidence for phrase match
      }
    });
  });
  
  return Array.from(detectedCategories.entries()).map(([serviceCategory, confidence]) => ({
    serviceCategory,
    confidence
  }));
}
