
import { ServiceCategory } from "../types";
import { SYMPTOM_MAPPINGS } from "../symptomMappingsData";
import { detectProfessionalMentions } from "../professionalPhrases";

export const detectSymptomsFromProfessionals = (
  userInput: string,
  symptoms: string[],
  priorities: Record<string, number>
): void => {
  // Check for professional mentions in the text 
  // and use them to suggest relevant symptoms based on that professional's expertise
  const professionalMentions = detectProfessionalMentions(userInput);
  if (professionalMentions.length > 0) {
    console.log("Detected professional mentions:", professionalMentions);
    
    // Infer symptoms based on professionals mentioned
    professionalMentions.forEach(({ category, count }) => {
      // Each professional category suggests potential symptoms
      switch(category) {
        case "physiotherapist":
          if (!symptoms.some(s => s.includes('pain') || s.includes('injury'))) {
            symptoms.push("pain");
            priorities["pain"] = (SYMPTOM_MAPPINGS["pain"]?.priority || 0.8) * Math.min(1.0 + (count * 0.1), 1.5);
            console.log("Added symptom 'pain' based on physiotherapist mention");
          }
          break;
          
        case "dietician":
          if (!symptoms.includes("nutrition")) {
            symptoms.push("nutrition");
            priorities["nutrition"] = (SYMPTOM_MAPPINGS["nutrition"]?.priority || 0.8) * Math.min(1.0 + (count * 0.1), 1.5);
            console.log("Added symptom 'nutrition' based on dietician mention");
          }
          break;
          
        case "personal-trainer":
          if (!symptoms.includes("fitness") && !symptoms.includes("strength")) {
            symptoms.push("fitness");
            priorities["fitness"] = (SYMPTOM_MAPPINGS["fitness"]?.priority || 0.8) * Math.min(1.0 + (count * 0.1), 1.5);
            console.log("Added symptom 'fitness' based on personal trainer mention");
          }
          break;
          
        case "coaching":
          if (userInput.toLowerCase().includes("run") || userInput.toLowerCase().includes("running") || userInput.toLowerCase().includes("marathon")) {
            if (!symptoms.includes("race preparation")) {
              symptoms.push("race preparation");
              priorities["race preparation"] = (SYMPTOM_MAPPINGS["race preparation"]?.priority || 0.8) * Math.min(1.0 + (count * 0.1), 1.5);
              console.log("Added symptom 'race preparation' based on running coach mention");
            }
          } else if (!symptoms.includes("mental health") && !symptoms.includes("anxiety")) {
            symptoms.push("mental health");
            priorities["mental health"] = (SYMPTOM_MAPPINGS["mental health"]?.priority || 0.8) * Math.min(1.0 + (count * 0.1), 1.5);
            console.log("Added symptom 'mental health' based on coach mention");
          }
          break;
          
        case "family-medicine":
          if (!symptoms.includes("general health")) {
            symptoms.push("general health");
            priorities["general health"] = (SYMPTOM_MAPPINGS["general health"]?.priority || 0.6) * Math.min(1.0 + (count * 0.1), 1.5);
            console.log("Added symptom 'general health' based on doctor mention");
          }
          break;
      }
    });
  }
};
