
import { ServiceCategory } from "../types";
import { SYMPTOM_MAPPINGS } from "../symptomMappingsData";
import { MENTAL_HEALTH_SYNONYMS, FITNESS_SYNONYMS, DIGESTIVE_SYNONYMS } from "../inputAnalyzer/synonymExpansion";

export const detectSpecialCases = (
  inputLower: string,
  symptoms: string[],
  priorities: Record<string, number>,
  contraindications: ServiceCategory[]
): void => {
  // Enhanced detection using our synonym maps for broader coverage
  const mentalHealthKeywords = MENTAL_HEALTH_SYNONYMS['anxiety'] || [];
  const nutritionKeywords = ['nutrition', 'eat', 'eating', 'diet', 'food', 'appetite', 'meal', 'hungry'].concat(
    DIGESTIVE_SYNONYMS['stomach'] || []
  );
  const raceKeywords = (GOAL_SYNONYMS['race'] || []).concat(['run', 'running', 'marathon', 'half marathon', '5k', '10k', 'weeks until']);
  
  // Check for mental health + nutrition combination
  let hasAnxiety = false;
  let hasNutrition = false;
  let hasRace = false;
  
  // Check for anxiety using expanded synonyms
  for (const keyword of mentalHealthKeywords) {
    if (inputLower.includes(keyword)) {
      hasAnxiety = true;
      if (!symptoms.includes("anxiety")) {
        symptoms.push("anxiety");
        priorities["anxiety"] = SYMPTOM_MAPPINGS["anxiety"]?.priority || 0.8;
        console.log(`Found mental health symptom: anxiety from keyword "${keyword}"`);
      }
      break;
    }
  }
  
  // Check for nutrition using expanded keywords
  for (const keyword of nutritionKeywords) {
    if (inputLower.includes(keyword)) {
      hasNutrition = true;
      if (!symptoms.includes("nutrition")) {
        symptoms.push("nutrition");
        priorities["nutrition"] = SYMPTOM_MAPPINGS["nutrition"]?.priority || 0.7;
        console.log(`Found nutrition concern from keyword "${keyword}"`);
      }
      break;
    }
  }
  
  // Check for race preparation using expanded keywords
  for (const keyword of raceKeywords) {
    if (inputLower.includes(keyword)) {
      hasRace = true;
      if (!symptoms.includes("race preparation")) {
        symptoms.push("race preparation");
        // Give race preparation higher priority when explicitly mentioned
        priorities["race preparation"] = (SYMPTOM_MAPPINGS["race preparation"]?.priority || 0.7) * 1.2;
        console.log(`Found race preparation need from keyword "${keyword}"`);
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
  
  // NEW: Enhanced special case detection - pain with urgency indicators
  const painKeywords = ['pain', 'ache', 'hurt', 'sore', 'discomfort'];
  const urgencyKeywords = ['urgent', 'immediately', 'right away', 'asap', 'emergency'];
  
  const hasPain = painKeywords.some(word => inputLower.includes(word));
  const hasUrgency = urgencyKeywords.some(word => inputLower.includes(word));
  
  if (hasPain && hasUrgency) {
    // This is an urgent pain situation - prioritize medical intervention
    if (!symptoms.includes("acute pain")) {
      symptoms.push("acute pain");
      priorities["acute pain"] = 0.95; // Very high priority
      console.log("Found urgent pain situation - adding acute pain with high priority");
    }
    
    // Ensure family medicine is not contraindicated
    const familyMedicineIndex = contraindications.indexOf("family-medicine");
    if (familyMedicineIndex !== -1) {
      contraindications.splice(familyMedicineIndex, 1);
      console.log("Removed family-medicine from contraindications due to urgent pain");
    }
  }
};
