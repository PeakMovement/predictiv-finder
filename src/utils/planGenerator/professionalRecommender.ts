
import { ServiceCategory } from "./types";
import { identifySymptoms } from "./symptomDetector";
import { SYMPTOM_MAPPINGS } from "./symptomMappingsData";
import { detectProfessionalMentions } from "./professionalPhrases";

export const getProfessionalsForSymptoms = (
  userInput: string
): { 
  categories: ServiceCategory[],
  priorities: Record<ServiceCategory, number>,
  contraindicated: ServiceCategory[]
} => {
  const { symptoms, priorities: symptomPriorities, contraindications } = identifySymptoms(userInput);
  const categories = new Set<ServiceCategory>();
  const categoryPriorities: Record<ServiceCategory, number> = {} as Record<ServiceCategory, number>;
  
  console.log("Processing symptoms for professional recommendations:", symptoms);
  console.log("Contraindications identified:", contraindications);
  
  // Create a set of all contraindicated categories to ensure we don't add them
  const contraindicatedSet = new Set<ServiceCategory>(contraindications as ServiceCategory[]);
  
  // Process symptoms and add relevant professionals ONLY IF they are not contraindicated
  symptoms.forEach(symptom => {
    const mapping = SYMPTOM_MAPPINGS[symptom];
    if (mapping) {
      // Only add primary specialist if not contraindicated
      if (!contraindicatedSet.has(mapping.primary)) {
        categories.add(mapping.primary);
        const currentSymptomPriority = symptomPriorities[symptom] || mapping.priority;
        categoryPriorities[mapping.primary] = Math.max(
          currentSymptomPriority, 
          categoryPriorities[mapping.primary] || 0
        );
      } else {
        console.log(`Skipped contraindicated primary service: ${mapping.primary} for symptom ${symptom}`);
      }
      
      // Add other specialists with slightly lower priority if not contraindicated
      mapping.specialties.forEach(specialty => {
        if (!contraindicatedSet.has(specialty)) {
          categories.add(specialty);
          categoryPriorities[specialty] = Math.max(
            (symptomPriorities[symptom] || mapping.priority) * 0.9, 
            categoryPriorities[specialty] || 0
          );
        } else {
          console.log(`Skipped contraindicated specialty service: ${specialty} for symptom ${symptom}`);
        }
      });
      
      // Add secondary specialists with even lower priority if not contraindicated
      mapping.secondary?.forEach(secondary => {
        if (!contraindicatedSet.has(secondary)) {
          categories.add(secondary);
          categoryPriorities[secondary] = Math.max(
            (symptomPriorities[symptom] || mapping.priority) * 0.7, 
            categoryPriorities[secondary] || 0
          );
        } else {
          console.log(`Skipped contraindicated secondary service: ${secondary} for symptom ${symptom}`);
        }
      });
      
      // Add any additional contraindications from this symptom
      if (mapping.contraindications) {
        mapping.contraindications.forEach(category => {
          contraindicatedSet.add(category);
        });
      }
    }
  });
  
  // Directly add professionals that are explicitly mentioned
  const professionalMentions = detectProfessionalMentions(userInput);
  professionalMentions.forEach(({ category, count }) => {
    // Only add the mentioned professional if not contraindicated
    if (!contraindicatedSet.has(category)) {
      categories.add(category);
      
      // Explicitly mentioned professionals get a high priority boost based on mention frequency
      const mentionPriorityBoost = Math.min(0.2 + (count * 0.1), 0.5); // Capped at 0.5 boost
      categoryPriorities[category] = Math.max(
        (categoryPriorities[category] || 0.7) + mentionPriorityBoost,
        0.9 // Explicitly requested professionals get at least 0.9 priority
      );
      
      console.log(`Explicitly requested professional: ${category} with priority ${categoryPriorities[category]}`);
    } else {
      console.log(`Skipped explicitly mentioned but contraindicated service: ${category}`);
    }
  });
  
  // Special case for stomach pain/issues - ALWAYS enforced regardless of other mentions
  if (userInput.toLowerCase().includes('stomach') || 
      userInput.toLowerCase().includes('digestive') || 
      userInput.toLowerCase().includes('abdomen') ||
      userInput.toLowerCase().includes('gut')) {
    
    console.log("*** DETECTED STOMACH/DIGESTIVE ISSUES - APPLYING STRICT SPECIALIZATION RULES ***");
    
    // Always remove inappropriate services for stomach issues
    contraindicatedSet.add('biokineticist');
    contraindicatedSet.add('personal-trainer');
    categories.delete('biokineticist');
    categories.delete('personal-trainer');
    delete categoryPriorities['biokineticist'];
    delete categoryPriorities['personal-trainer'];
    
    // Ensure gastroenterology is prioritized
    categories.add("gastroenterology");
    categoryPriorities["gastroenterology"] = Math.max(categoryPriorities["gastroenterology"] || 0, 0.95);
    
    // Ensure family medicine is included
    categories.add("family-medicine");
    categoryPriorities["family-medicine"] = Math.max(categoryPriorities["family-medicine"] || 0, 0.9);
    
    // Ensure dietician is included
    categories.add("dietician");
    categoryPriorities["dietician"] = Math.max(categoryPriorities["dietician"] || 0, 0.85);
    
    console.log("Optimized professionals for stomach/digestive issues");
    console.log("Contraindicated categories:", Array.from(contraindicatedSet));
  }
  
  // Budget consideration - if user mentions budget under R1000
  const budgetMatch = userInput.toLowerCase().match(/r\s*(\d{1,4})/i);
  const budgetAmount = budgetMatch ? parseInt(budgetMatch[1], 10) : null;
  const hasBudgetConstraint = 
    userInput.toLowerCase().includes('tight budget') || 
    userInput.toLowerCase().includes("can't afford") ||
    userInput.toLowerCase().includes('affordable') ||
    budgetAmount !== null;
  
  console.log(`Detected budget constraint: ${budgetAmount || 'unspecified'}`);
  
  // If budget is very low (under R1000), strictly prioritize more affordable options
  if (budgetAmount && budgetAmount < 1000) {
    console.log("*** VERY TIGHT BUDGET DETECTED (R" + budgetAmount + ") - OPTIMIZING FOR AFFORDABILITY ***");
    
    // For stomach/digestive issues with tight budget, focus on family medicine only
    if (userInput.toLowerCase().includes('stomach') || 
        userInput.toLowerCase().includes('digestive')) {
      
      console.log("Applying strict budget optimization for stomach/digestive issues");
      
      // Ensure family medicine is included and prioritized as the most affordable relevant option
      categories.add("family-medicine");
      categoryPriorities["family-medicine"] = 1.0; // Give highest priority
      
      // Remove expensive specialists
      categories.delete("gastroenterology");
      delete categoryPriorities["gastroenterology"];
      
      // Only keep dietician if budget allows (R800+ can accommodate at least one session)
      if (budgetAmount < 800) {
        categories.delete("dietician");
        delete categoryPriorities["dietician"];
        console.log("Removed dietician due to extremely tight budget (under R800)");
      }
      
      // If online consultation specifically mentioned, prioritize family medicine even more
      if (userInput.toLowerCase().includes('online')) {
        console.log("Online consultation requested - optimizing for remote family medicine");
      }
    }
    
    // For very tight budgets, remove all expensive specialists
    const expensiveSpecialists: ServiceCategory[] = [
      'cardiology', 'neurology', 'gastroenterology', 'endocrinology', 
      'orthopedics', 'psychiatry', 'neurosurgery', 'oncology'
    ];
    
    expensiveSpecialists.forEach(specialist => {
      if (categories.has(specialist) && budgetAmount < 800) {
        categories.delete(specialist);
        delete categoryPriorities[specialist];
        console.log(`Removed expensive specialist ${specialist} due to tight budget`);
      }
    });
    
    // Special case for EXTREMELY tight budgets (under R600)
    if (budgetAmount < 600) {
      console.log("EXTREMELY tight budget detected - restricting to only family-medicine");
      
      // Keep ONLY family-medicine for extremely tight budgets
      const allCategories = Array.from(categories);
      allCategories.forEach(category => {
        if (category !== 'family-medicine') {
          categories.delete(category);
          delete categoryPriorities[category];
        }
      });
      
      // Ensure family medicine is included
      categories.add('family-medicine');
      categoryPriorities['family-medicine'] = 1.0;
    }
  }
  
  // Remove all contraindicated categories (final check)
  contraindicatedSet.forEach(category => {
    categories.delete(category);
    delete categoryPriorities[category];
  });
  
  // If no categories found, add default
  if (categories.size === 0) {
    categories.add('family-medicine');
    categoryPriorities['family-medicine'] = 0.9;
    
    // Only add dietician if not contraindicated
    if (!contraindicatedSet.has('dietician')) {
      categories.add('dietician');
      categoryPriorities['dietician'] = 0.7;
    }
  }
  
  // Sort by priority
  const sortedCategories = Array.from(categories)
    .sort((a, b) => (categoryPriorities[b] || 0) - (categoryPriorities[a] || 0));
  
  console.log("Final recommended categories:", sortedCategories);
  console.log("Final category priorities:", categoryPriorities);
  console.log("Final contraindicated categories:", Array.from(contraindicatedSet));
  
  return { 
    categories: sortedCategories, 
    priorities: categoryPriorities,
    contraindicated: Array.from(contraindicatedSet) as ServiceCategory[]
  };
};
