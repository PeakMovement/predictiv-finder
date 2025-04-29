
import { ServiceCategory } from "../types";

export const detectStomachIssues = (
  inputLower: string,
  symptoms: string[],
  priorities: Record<string, number>,
  contraindications: ServiceCategory[]
): void => {
  const stomachKeywords = ['stomach', 'digestive', 'digestion', 'gut', 'abdomen', 'belly', 'bowel', 
                          'intestine', 'gastro', 'constipation', 'diarrhea', 'nausea', 'vomit'];
  const painKeywords = ['pain', 'ache', 'hurt', 'discomfort', 'issue', 'problem'];
  
  // Direct check for stomach/digestive issues
  const hasStomachReference = stomachKeywords.some(keyword => inputLower.includes(keyword));
  const hasPainReference = painKeywords.some(keyword => inputLower.includes(keyword));
  
  if (hasStomachReference && hasPainReference) {
    console.log("*** DETECTED STOMACH/DIGESTIVE ISSUES AS PRIORITY CONCERN ***");
    
    // Add stomach pain as primary symptom with high priority
    symptoms.push("stomach pain");
    priorities["stomach pain"] = 1.0; // Maximum priority
    
    // Add contraindications for inappropriate services
    ['biokineticist', 'personal-trainer'].forEach(category => {
      if (!contraindications.includes(category as ServiceCategory)) {
        contraindications.push(category as ServiceCategory);
        console.log(`Added ${category} to contraindications for stomach issue`);
      }
    });
    
    console.log("Added stomach pain as primary symptom with contraindications");
  }
  else if (hasStomachReference) {
    // Add stomach issues with high priority
    symptoms.push("stomach issues");
    priorities["stomach issues"] = 0.9;
    
    // Add contraindications for inappropriate services
    ['biokineticist', 'personal-trainer'].forEach(category => {
      if (!contraindications.includes(category as ServiceCategory)) {
        contraindications.push(category as ServiceCategory);
        console.log(`Added ${category} to contraindications for stomach issue`);
      }
    });
    
    console.log("Added stomach issues as symptom with contraindications");
  }
};
