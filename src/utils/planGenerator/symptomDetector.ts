
import { ServiceCategory } from "./types";
import { SYMPTOM_MAPPINGS } from "./symptomMappingsData";
import { detectProfessionalMentions } from "./professionalPhrases";

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
  
  // IMPORTANT: First check for stomach/digestive issues as a high priority check
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
  
  // Check for specific body parts mentioned with pain keywords
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
  
  // Budget detection - strict approach for low budgets
  const budgetMatch = inputLower.match(/r\s*(\d{1,4})/i) || 
                     inputLower.match(/budget[^0-9]*(\d{1,4})/i) ||
                     inputLower.match(/afford[^0-9]*(\d{1,4})/i);
  
  if (budgetMatch && budgetMatch[1]) {
    const budget = parseInt(budgetMatch[1], 10);
    console.log(`*** DETECTED SPECIFIC BUDGET: R${budget} ***`);
    
    if (budget < 1000) {
      // For very low budgets, avoid expensive specialists
      const expensiveSpecialists: ServiceCategory[] = [
        'cardiology', 'neurology', 'gastroenterology', 'orthopedics', 
        'psychiatry', 'neurosurgery', 'oncology'
      ];
      
      expensiveSpecialists.forEach(specialist => {
        if (!contraindications.includes(specialist)) {
          contraindications.push(specialist);
          console.log(`Added ${specialist} to contraindications due to tight budget of R${budget}`);
        }
      });
      
      // For extremely tight budgets under R600, contraindicate everything except family medicine
      if (budget < 600) {
        const allSpecialists: ServiceCategory[] = [
          'dietician', 'personal-trainer', 'physiotherapist', 'coaching',
          'biokineticist', 'endocrinology', 'cardiology', 'neurology', 
          'gastroenterology', 'orthopedics', 'psychiatry'
        ];
        
        allSpecialists.forEach(specialist => {
          if (specialist !== 'family-medicine' && !contraindications.includes(specialist)) {
            contraindications.push(specialist);
            console.log(`Added ${specialist} to contraindications due to extremely tight budget of R${budget}`);
          }
        });
      }
    }
  }
  
  // Online preference detection - prioritize remote-friendly services
  if (inputLower.includes('online') || 
      inputLower.includes('remote') || 
      inputLower.includes('virtual')) {
    console.log("*** DETECTED PREFERENCE FOR ONLINE SERVICES ***");
    
    // Less suitable for online delivery
    const lessOnlineSuitable: ServiceCategory[] = [
      'physiotherapist', 'biokineticist', 'personal-trainer'
    ];
    
    // If stomach issues are detected with online preference, physiotherapy and biokineticist are even less suitable
    if (hasStomachReference) {
      lessOnlineSuitable.forEach(specialist => {
        if (!contraindications.includes(specialist)) {
          contraindications.push(specialist);
          console.log(`Added ${specialist} to contraindications due to online preference for stomach issue`);
        }
      });
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
          if (inputLower.includes("run") || inputLower.includes("running") || inputLower.includes("marathon")) {
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
