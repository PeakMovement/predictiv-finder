
import { ServiceCategory } from "../../types";
import { SYMPTOM_MAPPINGS } from "../symptomMappingsData";

// Function to check for specific body parts mentioned with pain keywords
export const detectBodyPainAssociations = (
  inputLower: string,
  words: string[],
  symptoms: string[],
  priorities: Record<string, number>,
  contraindications: ServiceCategory[]
): void => {
  const painKeywords = ['pain', 'ache', 'hurt', 'discomfort', 'issue', 'problem'];
  const bodyParts = ["shoulder", "knee", "back", "neck", "hip", "elbow", "wrist", "ankle", "joint"];
  
  for (const bodyPart of bodyParts) {
    if (inputLower.includes(bodyPart)) {
      // Check if there's a pain keyword within 5 words of the body part
      const bodyPartIndex = words.findIndex(w => w.includes(bodyPart));
      if (bodyPartIndex >= 0) {
        const start = Math.max(0, bodyPartIndex - 5);
        const end = Math.min(words.length, bodyPartIndex + 5);
        
        for (let i = start; i < end; i++) {
          if (painKeywords.some(pk => words[i].includes(pk))) {
            const specificSymptom = `${bodyPart} pain`;
            if (!symptoms.includes(specificSymptom) && SYMPTOM_MAPPINGS[specificSymptom]) {
              symptoms.push(specificSymptom);
              priorities[specificSymptom] = SYMPTOM_MAPPINGS[specificSymptom].priority * 1.2; // Boost specific matches
              
              // Add contraindications
              SYMPTOM_MAPPINGS[specificSymptom].contraindications?.forEach(category => {
                if (!contraindications.includes(category)) {
                  contraindications.push(category);
                }
              });
              
              console.log(`Found specific symptom: ${specificSymptom}`);
            }
          }
        }
      }
    }
  }
};
