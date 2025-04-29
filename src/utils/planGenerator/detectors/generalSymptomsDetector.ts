
import { ServiceCategory } from "../types";
import { SYMPTOM_MAPPINGS } from "../symptomMappingsData";

export const detectGeneralSymptoms = (
  inputLower: string,
  symptoms: string[],
  priorities: Record<string, number>,
  contraindications: ServiceCategory[]
): void => {
  // General mappings check
  Object.entries(SYMPTOM_MAPPINGS).forEach(([symptom, mapping]) => {
    // Skip if we already have stomach symptoms from earlier checks
    if ((symptom === "stomach pain" || symptom === "stomach issues" || symptom === "digestive problems") && 
        (symptoms.includes("stomach pain") || symptoms.includes("stomach issues"))) {
      return;
    }
    
    const hasMainKeyword = inputLower.includes(symptom.toLowerCase());
    let hasRelatedKeyword = false;
    let hasContextKeyword = false;
    
    // Check for any related keywords
    if (mapping.keywords) {
      hasRelatedKeyword = mapping.keywords.some(keyword => inputLower.includes(keyword.toLowerCase()));
    }
    
    // Check for context keywords if available
    if (mapping.context) {
      hasContextKeyword = mapping.context.some(context => inputLower.includes(context.toLowerCase()));
    }
    
    // Add symptom if we have a direct match or (related keyword and context)
    if (hasMainKeyword || (hasRelatedKeyword && (hasContextKeyword || !mapping.context))) {
      if (!symptoms.includes(symptom)) {
        symptoms.push(symptom);
        priorities[symptom] = mapping.priority;
        
        // Add contraindications
        mapping.contraindications?.forEach(category => {
          if (!contraindications.includes(category)) {
            contraindications.push(category);
          }
        });
        
        console.log(`Found symptom: ${symptom} (priority: ${mapping.priority})`);
      }
    }
  });
};
