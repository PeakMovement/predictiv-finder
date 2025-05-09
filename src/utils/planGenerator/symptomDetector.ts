
import { ServiceCategory } from "./types";
import { detectComprehensiveSymptoms } from "./detectors/comprehensiveSymptomDetector";

/**
 * Enhanced symptom identification with comprehensive detection
 * Acts as a facade to maintain backward compatibility while improving functionality
 * 
 * @param userInput - Original user input text
 * @returns Analysis of symptoms, priorities, and contraindications
 */
export const identifySymptoms = (userInput: string): { 
  symptoms: string[], 
  priorities: Record<string, number>,
  contraindications: ServiceCategory[]
} => {
  console.log("Identifying symptoms using enhanced detector");
  
  try {
    // Use the new comprehensive detector
    const results = detectComprehensiveSymptoms(userInput);
    
    // Return the standard format for backward compatibility
    return {
      symptoms: results.symptoms,
      priorities: results.priorities,
      contraindications: results.contraindications
    };
  } catch (error) {
    console.error("Error in symptom identification:", error);
    // Return empty results on error for graceful degradation
    return { 
      symptoms: ["general health"], 
      priorities: { "general health": 0.5 }, 
      contraindications: [] 
    };
  }
};
