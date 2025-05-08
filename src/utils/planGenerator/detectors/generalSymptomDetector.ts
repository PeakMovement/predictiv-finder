
import { ServiceCategory } from "../../types";
import { SYMPTOM_MAPPINGS } from "../symptomMappingsData";

export const detectGeneralSymptoms = (
  inputLower: string,
  symptoms: string[],
  priorities: Record<string, number>,
  contraindications: ServiceCategory[]
): void => {
  // Check for general health symptoms from symptom mappings
  for (const symptomKey in SYMPTOM_MAPPINGS) {
    const symptomData = SYMPTOM_MAPPINGS[symptomKey];
    
    // Skip symptoms we've already matched via specific detectors
    if (symptoms.includes(symptomKey)) continue;
    
    const keywordMatches = symptomData.keywords.some(keyword => 
      inputLower.includes(keyword.toLowerCase())
    );
    
    if (keywordMatches) {
      // Add the symptom to our list
      symptoms.push(symptomKey);
      priorities[symptomKey] = symptomData.priority || 0.5;
      
      console.log(`Detected general symptom: ${symptomKey} via keywords`);
      
      // Add any contraindications
      if (symptomData.contraindications) {
        symptomData.contraindications.forEach(category => {
          if (!contraindications.includes(category)) {
            contraindications.push(category);
            console.log(`Added contraindication: ${category} from symptom ${symptomKey}`);
          }
        });
      }
    }
  }
};
