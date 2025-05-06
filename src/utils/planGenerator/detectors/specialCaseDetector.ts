
import { ServiceCategory } from "../types";
import { SYMPTOM_MAPPINGS } from "../symptomMappingsData";
import { 
  MENTAL_HEALTH_SYNONYMS, 
  FITNESS_SYNONYMS, 
  DIGESTIVE_SYNONYMS,
  GOAL_SYNONYMS 
} from "../inputAnalyzer/synonymExpansion";

/**
 * Detects and handles special combinations of symptoms or conditions
 * that require tailored treatment approaches
 */
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
  let hasPain = false;
  let hasKneePain = false;
  let hasChronicPain = false;
  let hasSleepIssue = false;
  
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
  
  // Check for pain-related keywords
  const painKeywords = ['pain', 'ache', 'hurt', 'sore', 'discomfort', 'injury', 'strain'];
  const kneeKeywords = ['knee', 'patella', 'kneecap', 'runner\'s knee', 'jumper\'s knee', 'knee joint'];
  const chronicKeywords = ['chronic', 'persistent', 'ongoing', 'constant', 'recurring'];
  const sleepKeywords = ['sleep', 'insomnia', 'rest', 'tired', 'fatigue', 'exhausted', 'can\'t sleep'];
  
  // Detect general pain
  hasPain = painKeywords.some(keyword => inputLower.includes(keyword));
  
  // Detect knee pain specifically
  hasKneePain = kneeKeywords.some(keyword => inputLower.includes(keyword)) && hasPain;
  
  // Detect chronic pain
  hasChronicPain = chronicKeywords.some(keyword => inputLower.includes(keyword)) && hasPain;
  
  // Detect sleep issues
  hasSleepIssue = sleepKeywords.some(keyword => inputLower.includes(keyword));
  
  // SPECIAL CASE COMBINATIONS:
  
  // Special case 1: anxiety + eating issues + race preparation
  if (hasAnxiety && hasNutrition && hasRace) {
    // Boost priority for dietician and coaching
    priorities["nutrition"] = (priorities["nutrition"] || 0) * 1.3;
    priorities["anxiety"] = (priorities["anxiety"] || 0) * 1.2;
    priorities["race preparation"] = (priorities["race preparation"] || 0) * 1.2;
    
    // Add contraindications for physiotherapy if no physical pain is mentioned
    if (!hasPain && !contraindications.includes("physiotherapist")) {
      contraindications.push("physiotherapist");
      contraindications.push("biokineticist");
    }
    
    // Ensure coaching and dietician are prioritized
    if (!symptoms.includes("coaching needs")) {
      symptoms.push("coaching needs");
      priorities["coaching needs"] = 0.85;
    }
    
    console.log("Found special case: anxiety + nutrition + race preparation");
  }
  
  // Special case 2: knee pain + race preparation
  if (hasKneePain && hasRace) {
    // This is a critical combination that needs special attention
    if (!symptoms.includes("knee pain")) {
      symptoms.push("knee pain");
      priorities["knee pain"] = 0.9;
    }
    
    // Add specialized symptoms
    if (!symptoms.includes("sports injury")) {
      symptoms.push("sports injury");
      priorities["sports injury"] = 0.85;
    }
    
    // Ensure physiotherapy is prioritized
    priorities["physiotherapist"] = Math.max(priorities["physiotherapist"] || 0, 0.9);
    priorities["coaching"] = Math.max(priorities["coaching"] || 0, 0.8);
    
    // If it's an upcoming race (time sensitivity)
    if (inputLower.includes("week") || inputLower.includes("soon") || inputLower.includes("upcoming")) {
      priorities["physiotherapist"] = 0.95; // Critical priority
      console.log("Detected time-sensitive knee pain + race preparation");
      
      if (!symptoms.includes("urgent care")) {
        symptoms.push("urgent care");
        priorities["urgent care"] = 0.9;
      }
    }
    
    console.log("Found special case: knee pain + race preparation");
  }
  
  // Special case 3: chronic pain with sleep issues
  if (hasChronicPain && hasSleepIssue) {
    // This combination requires multidisciplinary approach
    if (!symptoms.includes("chronic pain")) {
      symptoms.push("chronic pain");
      priorities["chronic pain"] = 0.85;
    }
    
    if (!symptoms.includes("sleep issues")) {
      symptoms.push("sleep issues");
      priorities["sleep issues"] = 0.8;
    }
    
    // Ensure pain management is included
    priorities["pain-management"] = Math.max(priorities["pain-management"] || 0, 0.9);
    
    // Often needs mental health support
    if (!contraindications.includes("psychiatry")) {
      priorities["psychiatry"] = Math.max(priorities["psychiatry"] || 0, 0.7);
    }
    
    console.log("Found special case: chronic pain + sleep issues");
  }
  
  // Special case 4: anxiety with physical symptoms
  if (hasAnxiety && hasPain && !hasKneePain) {
    // Psychosomatic symptoms need integrated care
    priorities["psychiatry"] = Math.max(priorities["psychiatry"] || 0, 0.85);
    priorities["family-medicine"] = Math.max(priorities["family-medicine"] || 0, 0.8);
    
    if (!symptoms.includes("integrated care")) {
      symptoms.push("integrated care");
      priorities["integrated care"] = 0.8;
    }
    
    console.log("Found special case: anxiety + physical pain (possible psychosomatic symptoms)");
  }
  
  // Enhanced special case detection - pain with urgency indicators
  const urgencyKeywords = ['urgent', 'immediately', 'right away', 'asap', 'emergency'];
  
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
