
import { ServiceCategory } from "../types";
import { SYMPTOM_MAPPINGS } from "../symptomMappingsData";

export const detectSpecialCases = (
  inputLower: string,
  symptoms: string[],
  priorities: Record<string, number>,
  contraindications: ServiceCategory[]
): void => {
  // Special detection for mental health + nutrition + race preparation
  const mentalHealthKeywords = ["anxiety", "anxious", "mental health", "stress", "nervous", "worry"];
  const nutritionKeywords = ["eat", "eating", "diet", "food", "appetite", "meal", "nutrition", "hungry"];
  const raceKeywords = ["race", "run", "running", "marathon", "half marathon", "5k", "10k", "weeks until"];
  
  // Check for mental health + nutrition combination
  let hasAnxiety = false;
  let hasNutrition = false;
  let hasRace = false;
  
  for (const keyword of mentalHealthKeywords) {
    if (inputLower.includes(keyword)) {
      hasAnxiety = true;
      if (!symptoms.includes("anxiety")) {
        symptoms.push("anxiety");
        priorities["anxiety"] = SYMPTOM_MAPPINGS["anxiety"]?.priority || 0.8;
        console.log(`Found mental health symptom: anxiety`);
      }
      break;
    }
  }
  
  for (const keyword of nutritionKeywords) {
    if (inputLower.includes(keyword)) {
      hasNutrition = true;
      if (!symptoms.includes("nutrition")) {
        symptoms.push("nutrition");
        priorities["nutrition"] = SYMPTOM_MAPPINGS["nutrition"]?.priority || 0.7;
        console.log(`Found nutrition concern`);
      }
      break;
    }
  }
  
  for (const keyword of raceKeywords) {
    if (inputLower.includes(keyword)) {
      hasRace = true;
      if (!symptoms.includes("race preparation")) {
        symptoms.push("race preparation");
        // Give race preparation higher priority when explicitly mentioned
        priorities["race preparation"] = (SYMPTOM_MAPPINGS["race preparation"]?.priority || 0.7) * 1.2;
        console.log(`Found race preparation need`);
      }
      break;
    }
  }
  
  // Special case: anxiety + eating issues + race preparation
  if (hasAnxiety && hasNutrition && hasRace) {
    // Boost priority for dietician and coaching
    priorities["nutrition"] = (priorities["nutrition"] || 0) * 1.3;
    priorities["anxiety"] = (priorities["anxiety"] || 0) * 1.2;
    priorities["race preparation"] = (priorities["race preparation"] || 0) * 1.2;
    
    // Add contraindications for physiotherapy
    if (!contraindications.includes("physiotherapist")) {
      contraindications.push("physiotherapist");
      contraindications.push("biokineticist");
    }
    
    console.log("Found special case: anxiety + nutrition + race preparation");
  }
};
