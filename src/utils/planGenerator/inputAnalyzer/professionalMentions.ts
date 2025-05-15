import { ServiceCategory } from "../types";
import { PROFESSIONAL_KEYWORDS, findAllServicesByKeyword } from "../professionalKeywords";

// Define the interface for professional service mention results
export interface ProfessionalServiceMention {
  serviceCategory: ServiceCategory;
  confidence: number;
}

/**
 * Detect mentions of health professionals in user input
 * Enhanced with comprehensive keyword matching system
 * 
 * @param input User's input text
 * @returns Array of detected professional service mentions with confidence scores
 */
export function detectProfessionalMentions(input: string): ProfessionalServiceMention[] {
  const inputLower = input.toLowerCase();
  
  // First, check for direct mentions of professional types
  const directMentions = checkDirectProfessionalMentions(inputLower);
  
  // Then check for condition and treatment mentions
  const conditionMentions = checkConditionAndTreatmentMentions(inputLower);
  
  // Combine and deduplicate results
  const combinedResults: Record<ServiceCategory, number> = {};
  
  [...directMentions, ...conditionMentions].forEach(mention => {
    // Keep the highest confidence score if there are duplicates
    if (!combinedResults[mention.serviceCategory] || 
        combinedResults[mention.serviceCategory] < mention.confidence) {
      combinedResults[mention.serviceCategory] = mention.confidence;
    }
  });
  
  // Convert back to array format
  return Object.entries(combinedResults).map(([serviceCategory, confidence]) => ({
    serviceCategory: serviceCategory as ServiceCategory,
    confidence
  }));
}

/**
 * Check for direct mentions of professional types
 */
function checkDirectProfessionalMentions(inputLower: string): ProfessionalServiceMention[] {
  const results: ProfessionalServiceMention[] = [];
  
  // Check for direct mentions of each professional type
  PROFESSIONAL_KEYWORDS.forEach(profMapping => {
    // Check professional name synonyms
    profMapping.synonyms.forEach(synonym => {
      if (inputLower.includes(synonym.toLowerCase())) {
        // Calculate confidence based on context
        let confidence = 0.7; // Base confidence
        
        // Boost confidence if there are usage indicators
        const needIndicators = ["need", "want", "see", "visit", "consult", "book", "appointment with"];
        needIndicators.forEach(indicator => {
          if (inputLower.includes(`${indicator} ${synonym.toLowerCase()}`)) {
            confidence = 0.9;
          }
        });
        
        results.push({
          serviceCategory: profMapping.service,
          confidence
        });
        
        console.log(`Detected direct professional mention: ${synonym} -> ${profMapping.service} (confidence: ${confidence})`);
      }
    });
  });
  
  return results;
}

/**
 * Check for condition and treatment mentions that indicate professional types
 */
function checkConditionAndTreatmentMentions(inputLower: string): ProfessionalServiceMention[] {
  const results: ProfessionalServiceMention[] = [];
  const processedCategories = new Set<ServiceCategory>();
  
  // Check each phrase in the input for matches
  const phrases = breakIntoPhrases(inputLower);
  
  phrases.forEach(phrase => {
    // Find all services that might match this phrase
    const serviceMatches = findAllServicesByKeyword(phrase);
    
    serviceMatches.forEach(match => {
      // Avoid duplicates within phrase analysis
      if (!processedCategories.has(match.service)) {
        processedCategories.add(match.service);
        results.push({
          serviceCategory: match.service,
          confidence: match.confidence
        });
        
        console.log(`Detected condition/treatment mention in phrase "${phrase}": ${match.service} (confidence: ${match.confidence})`);
      }
    });
  });
  
  return results;
}

/**
 * Break input text into meaningful phrases for better analysis
 */
function breakIntoPhrases(text: string): string[] {
  // Split by common delimiters
  const rawPhrases = text.split(/[,.;!?]|\band\b|\bor\b|\bbut\b|\bthen\b/);
  
  // Clean up and filter phrases
  return rawPhrases
    .map(phrase => phrase.trim())
    .filter(phrase => phrase.length > 3); // Ignore very short phrases
}
