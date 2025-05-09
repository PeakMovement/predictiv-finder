
import { ServiceCategory } from "../types";
import { SYMPTOM_MAPPINGS } from "../symptomMappingsData";

/**
 * Detects general health symptoms from user input by matching against predefined symptom keywords
 * 
 * @param inputLower - Lowercase user input text
 * @param symptoms - Array to populate with detected symptoms
 * @param priorities - Object to populate with symptom priorities
 * @param contraindications - Array to populate with contraindicated service categories
 * @returns void - Modifies the passed arrays/objects in place
 */
export const detectGeneralSymptoms = (
  inputLower: string,
  symptoms: string[],
  priorities: Record<string, number>,
  contraindications: ServiceCategory[]
): void => {
  if (!inputLower || typeof inputLower !== 'string') {
    console.warn("Invalid input provided to detectGeneralSymptoms");
    return;
  }

  try {
    // Check for general health symptoms from symptom mappings
    for (const symptomKey in SYMPTOM_MAPPINGS) {
      const symptomData = SYMPTOM_MAPPINGS[symptomKey];
      
      // Skip symptoms we've already matched via specific detectors
      if (symptoms.includes(symptomKey)) continue;
      
      // Skip if no keywords are defined
      if (!symptomData.keywords || !Array.isArray(symptomData.keywords) || symptomData.keywords.length === 0) continue;
      
      // Check for keyword matches
      const keywordMatches = symptomData.keywords.some(keyword => {
        if (!keyword || typeof keyword !== 'string') return false;
        return inputLower.includes(keyword.toLowerCase());
      });
      
      if (keywordMatches) {
        // Add the symptom to our list
        symptoms.push(symptomKey);
        priorities[symptomKey] = symptomData.priority !== undefined ? symptomData.priority : 0.5;
        
        console.log(`Detected general symptom: ${symptomKey} via keywords`);
        
        // Add any contraindications
        if (symptomData.contraindications && Array.isArray(symptomData.contraindications)) {
          symptomData.contraindications.forEach(category => {
            if (!contraindications.includes(category)) {
              contraindications.push(category);
              console.log(`Added contraindication: ${category} from symptom ${symptomKey}`);
            }
          });
        }
      }
    }
  } catch (error) {
    console.error("Error in detectGeneralSymptoms:", error);
    // Don't rethrow - we want the detection process to continue with other detectors
  }
};
