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
  
  // Process symptoms and add relevant professionals
  symptoms.forEach(symptom => {
    const mapping = SYMPTOM_MAPPINGS[symptom];
    if (mapping) {
      // Add primary specialist with highest priority
      categories.add(mapping.primary);
      const symptomPriority = symptomPriorities[symptom] || mapping.priority;
      categoryPriorities[mapping.primary] = Math.max(
        symptomPriority, 
        categoryPriorities[mapping.primary] || 0
      );
      
      // Add other specialists with slightly lower priority
      mapping.specialties.forEach(specialty => {
        categories.add(specialty);
        categoryPriorities[specialty] = Math.max(
          symptomPriority * 0.9, 
          categoryPriorities[specialty] || 0
        );
      });
      
      // Add secondary specialists with even lower priority
      mapping.secondary?.forEach(secondary => {
        categories.add(secondary);
        categoryPriorities[secondary] = Math.max(
          symptomPriority * 0.7, 
          categoryPriorities[secondary] || 0
        );
      });
    }
  });
  
  // Directly add professionals that are explicitly mentioned
  const professionalMentions = detectProfessionalMentions(userInput);
  professionalMentions.forEach(({ category, count }) => {
    categories.add(category);
    
    // Explicitly mentioned professionals get a high priority boost based on mention frequency
    const mentionPriorityBoost = Math.min(0.2 + (count * 0.1), 0.5); // Capped at 0.5 boost
    categoryPriorities[category] = Math.max(
      (categoryPriorities[category] || 0.7) + mentionPriorityBoost,
      0.9 // Explicitly requested professionals get at least 0.9 priority
    );
    
    console.log(`Explicitly requested professional: ${category} with priority ${categoryPriorities[category]}`);
  });
  
  // Special case for anxiety + eating + race prep
  if (symptoms.includes("anxiety") && symptoms.includes("nutrition") && 
      (symptoms.includes("race preparation") || symptoms.includes("event preparation"))) {
    
    // Ensure dietician is prioritized for eating issues with anxiety
    categories.add("dietician");
    categoryPriorities["dietician"] = Math.max(categoryPriorities["dietician"] || 0, 0.95);
    
    // Ensure personal trainer is there for race prep
    categories.add("personal-trainer");
    categoryPriorities["personal-trainer"] = Math.max(categoryPriorities["personal-trainer"] || 0, 0.9);
    
    // Add coaching for anxiety support
    categories.add("coaching");
    categoryPriorities["coaching"] = Math.max(categoryPriorities["coaching"] || 0, 0.85);
    
    // Explicitly remove physiotherapy if not needed
    categories.delete("physiotherapist");
    delete categoryPriorities["physiotherapist"];
    
    console.log("Optimized profile for anxiety + nutrition + race preparation");
  }
  
  // Special case for stomach pain/issues
  if (symptoms.includes("stomach pain") || symptoms.includes("stomach issues") || 
      symptoms.includes("digestive problems")) {
    
    console.log("Detected stomach pain or digestive issues, ensuring appropriate recommendations");
    
    // Ensure gastroenterology is prioritized
    categories.add("gastroenterology");
    categoryPriorities["gastroenterology"] = Math.max(categoryPriorities["gastroenterology"] || 0, 0.95);
    
    // Ensure family medicine is included
    categories.add("family-medicine");
    categoryPriorities["family-medicine"] = Math.max(categoryPriorities["family-medicine"] || 0, 0.9);
    
    // Ensure dietician is included
    categories.add("dietician");
    categoryPriorities["dietician"] = Math.max(categoryPriorities["dietician"] || 0, 0.85);
    
    // Remove inappropriate services for stomach issues
    categories.delete("biokineticist");
    delete categoryPriorities["biokineticist"];
    categories.delete("personal-trainer");
    delete categoryPriorities["personal-trainer"];
    
    console.log("Optimized professionals for stomach/digestive issues");
  }
  
  // Budget consideration - if user mentions budget under R1000
  if (userInput.toLowerCase().match(/r\s*\d{1,3}00/) || 
      userInput.toLowerCase().includes("budget") || 
      userInput.toLowerCase().includes("afford")) {
    
    const budgetMatch = userInput.match(/r\s*(\d{1,4})/i);
    const budgetAmount = budgetMatch ? parseInt(budgetMatch[1], 10) : null;
    
    console.log(`Detected budget constraint: ${budgetAmount || 'unspecified'}`);
    
    // If budget is very low (under R1000), prioritize more affordable options
    if (budgetAmount && budgetAmount < 1000) {
      console.log("Very tight budget detected, optimizing for affordability");
      
      // Ensure family medicine is included for medical issues as it's more affordable
      if (symptoms.includes("stomach pain") || symptoms.includes("stomach issues") || 
          symptoms.includes("digestive problems")) {
        
        categories.add("family-medicine");
        categoryPriorities["family-medicine"] = Math.max(categoryPriorities["family-medicine"] || 0, 0.95);
        
        // If budget is extremely tight, focus on the most essential service
        if (budgetAmount < 600) {
          // Keep only family-medicine and dietician for very low budgets
          const essentialCategories: ServiceCategory[] = ["family-medicine", "dietician"];
          
          // Remove non-essential categories
          Array.from(categories).forEach(category => {
            if (!essentialCategories.includes(category)) {
              categories.delete(category);
              delete categoryPriorities[category];
            }
          });
          
          console.log("Restricted to only essential services for extremely tight budget");
        }
      }
    }
  }
  
  // Remove contraindicated categories
  contraindications.forEach(category => {
    categories.delete(category as ServiceCategory);
    delete categoryPriorities[category as ServiceCategory];
  });
  
  // If no categories found, add default
  if (categories.size === 0) {
    categories.add('dietician');
    categoryPriorities['dietician'] = 0.8;
    
    categories.add('personal-trainer');
    categoryPriorities['personal-trainer'] = 0.7;
  }
  
  // Sort by priority
  const sortedCategories = Array.from(categories)
    .sort((a, b) => (categoryPriorities[b] || 0) - (categoryPriorities[a] || 0));
  
  return { 
    categories: sortedCategories, 
    priorities: categoryPriorities,
    contraindicated: contraindications as ServiceCategory[]
  };
};
