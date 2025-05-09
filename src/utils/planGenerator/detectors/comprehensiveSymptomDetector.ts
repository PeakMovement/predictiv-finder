
import { ServiceCategory } from "../types";
import { SYMPTOM_MAPPINGS } from "../symptomMappings";
import { detectBodyPainAssociations } from "./bodyPainDetector";
import { detectGeneralSymptoms } from "./generalSymptomDetector";

/**
 * Advanced symptom detection with multi-factor analysis
 * 
 * @param userInput - Original user input text
 * @returns Comprehensive analysis of symptoms, priorities, and contraindications
 */
export function detectComprehensiveSymptoms(userInput: string): {
  symptoms: string[];
  priorities: Record<string, number>;
  contraindications: ServiceCategory[];
  confidence: Record<string, number>;
  primarySymptoms: string[];
} {
  const symptoms: string[] = [];
  const priorities: Record<string, number> = {};
  const contraindications: ServiceCategory[] = [];
  const confidence: Record<string, number> = {};
  const primarySymptoms: string[] = [];
  
  const inputLower = userInput.toLowerCase();
  const words = inputLower.split(/\s+/);
  
  console.log("Running comprehensive symptom analysis on:", inputLower);
  
  try {
    // Step 1: Run each specialized detector
    detectBodyPainAssociations(inputLower, words, symptoms, priorities, contraindications);
    detectGeneralSymptoms(inputLower, symptoms, priorities, contraindications);
    
    // Step 2: Context-aware symptom prioritization
    analyzeSymptomPriorities(userInput, inputLower, symptoms, priorities, confidence, primarySymptoms);
    
    // Ensure we have at least one primary symptom
    ensurePrimarySymptomExists(symptoms, priorities, primarySymptoms);
    
  } catch (error) {
    console.error("Error in comprehensive symptom detection:", error);
  }
  
  return {
    symptoms,
    priorities,
    contraindications, 
    confidence,
    primarySymptoms
  };
}

/**
 * Analyze symptoms to determine priorities and confidence levels
 */
function analyzeSymptomPriorities(
  userInput: string,
  inputLower: string,
  symptoms: string[],
  priorities: Record<string, number>,
  confidence: Record<string, number>,
  primarySymptoms: string[]
): void {
  // Key phrases that indicate primary importance
  const primaryIndicators = ['mainly', 'primarily', 'especially', 'most importantly', 'above all'];
  const intensifiers = ['very', 'severe', 'bad', 'intense', 'significant', 'serious'];
  
  for (const symptom of symptoms) {
    // Default confidence level
    confidence[symptom] = 0.6;
    
    // Check for primary symptom indicators
    const symptomLower = symptom.toLowerCase();
    const symptomWords = symptomLower.split(' ');
    const mainWord = symptomWords[symptomWords.length - 1]; // Usually the main noun
    
    // Count mentions of this symptom or related terms
    const mentionCount = (userInput.match(new RegExp(mainWord, 'gi')) || []).length;
    
    // Check proximity to primary indicators
    let isPrimary = false;
    primaryIndicators.forEach(indicator => {
      const indicatorIndex = inputLower.indexOf(indicator);
      if (indicatorIndex >= 0) {
        // Check if symptom is mentioned within 10 words after the indicator
        const textAfterIndicator = inputLower.substring(indicatorIndex + indicator.length);
        if (textAfterIndicator.indexOf(mainWord) >= 0 && 
            textAfterIndicator.indexOf(mainWord) < 50) { // Rough approximation of 10 words
          isPrimary = true;
          confidence[symptom] += 0.2;
        }
      }
    });
    
    // Check for intensifiers near symptom mentions
    intensifiers.forEach(intensifier => {
      const pattern = new RegExp(`${intensifier}\\s+(?:\\w+\\s+){0,2}${mainWord}`, 'i');
      if (pattern.test(inputLower)) {
        confidence[symptom] += 0.15;
        isPrimary = true;
      }
    });
    
    // Adjust priority based on our analysis
    if (isPrimary || mentionCount > 1 || confidence[symptom] > 0.7) {
      primarySymptoms.push(symptom);
      // Boost priority for primary symptoms
      priorities[symptom] = Math.min((priorities[symptom] || 0.5) * 1.3, 1.0);
    }
    
    console.log(`Symptom analysis - ${symptom}: priority=${priorities[symptom]}, confidence=${confidence[symptom]}, primary=${primarySymptoms.includes(symptom)}`);
  }
}

/**
 * Ensure at least one primary symptom exists
 */
function ensurePrimarySymptomExists(
  symptoms: string[],
  priorities: Record<string, number>,
  primarySymptoms: string[]
): void {
  if (primarySymptoms.length === 0 && symptoms.length > 0) {
    // Use the highest priority symptom as primary
    const highestPrioritySymptom = symptoms.reduce((highest, current) => 
      (priorities[current] > priorities[highest]) ? current : highest, symptoms[0]);
    primarySymptoms.push(highestPrioritySymptom);
  }
}
