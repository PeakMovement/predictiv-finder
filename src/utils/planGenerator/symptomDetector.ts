
import { ServiceCategory } from "./types";
import { SYMPTOM_MAPPINGS } from "./symptomMappingsData";
import { 
  detectBodyPainAssociations,
  detectStomachIssues,
  detectBudgetConstraints,
  detectOnlinePreference,
  detectSpecialCases,
  detectGeneralSymptoms,
  detectSymptomsFromProfessionals,
  detectTimeframes
} from "./detectors";

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
  
  // Detect stomach or digestive issues first (high priority)
  detectStomachIssues(inputLower, symptoms, priorities, contraindications);
  
  // Detect specific body part pain associations
  detectBodyPainAssociations(inputLower, words, symptoms, priorities, contraindications);
  
  // Detect budget constraints
  detectBudgetConstraints(inputLower, contraindications);
  
  // Check for online preference
  const hasStomachReference = inputLower.includes('stomach') || inputLower.includes('digestive') || 
                             inputLower.includes('gut') || inputLower.includes('abdomen');
  detectOnlinePreference(inputLower, contraindications, hasStomachReference);
  
  // Detect special case combinations
  detectSpecialCases(inputLower, symptoms, priorities, contraindications);
  
  // General symptoms detection from symptom mappings
  detectGeneralSymptoms(inputLower, symptoms, priorities, contraindications);
  
  // Infer symptoms based on professionals mentioned
  detectSymptomsFromProfessionals(userInput, symptoms, priorities);
  
  // Check for timeframes
  detectTimeframes(inputLower, symptoms, priorities);
  
  // If no symptoms found, add some defaults
  if (symptoms.length === 0) {
    symptoms.push("general health");
    priorities["general health"] = SYMPTOM_MAPPINGS["general health"]?.priority || 0.5;
  }

  return { symptoms, priorities, contraindications };
};
