
import { ServiceCategory } from "./types";
import { SYMPTOM_MAPPINGS } from "./symptomMappingsData";

export const identifySymptoms = (userInput: string): { 
  symptoms: string[], 
  priorities: Record<string, number>,
  contraindications: ServiceCategory[]
} => {
  const symptoms: string[] = [];
  const priorities: Record<string, number> = {};
  const contraindications: ServiceCategory[] = [];
  const inputLower = userInput.toLowerCase();
  const words = inputLower.split(/\s+/);
  
  console.log("Identifying symptoms from:", inputLower);
  
  // Check for specific body parts mentioned with pain keywords
  const painKeywords = ["pain", "ache", "hurt", "injury", "sore", "tight", "stiff"];
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
        priorities["anxiety"] = SYMPTOM_MAPPINGS["anxiety"].priority;
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
        priorities["nutrition"] = SYMPTOM_MAPPINGS["nutrition"].priority;
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
        priorities["race preparation"] = SYMPTOM_MAPPINGS["race preparation"].priority * 1.2;
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
    if (!contraindications.includes("physiotherapist" as ServiceCategory)) {
      contraindications.push("physiotherapist" as ServiceCategory);
      contraindications.push("biokineticist" as ServiceCategory);
    }
    
    console.log("Found special case: anxiety + nutrition + race preparation");
  }
  
  // General mappings check
  Object.entries(SYMPTOM_MAPPINGS).forEach(([symptom, mapping]) => {
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

  // Check for timeframes
  const weekMatches = inputLower.match(/(\d+)\s*weeks?/i);
  if (weekMatches && parseInt(weekMatches[1], 10) <= 4) {
    // Short timeframe (4 weeks or less) - prioritize coaching and specialized training
    console.log("Short timeframe detected, prioritizing rapid expertise");
    if (!symptoms.includes("race preparation")) {
      symptoms.push("race preparation");
      priorities["race preparation"] = 1.0; // Highest priority for short timeframe events
    }
  }
  
  // If no symptoms found, add some defaults
  if (symptoms.length === 0) {
    symptoms.push("general health");
    priorities["general health"] = SYMPTOM_MAPPINGS["general health"]?.priority || 0.5;
  }

  return { symptoms, priorities, contraindications };
};
