
import { ServiceCategory } from "./types";
import { identifySymptoms } from "./symptomDetector";
import { SYMPTOM_MAPPINGS } from "./symptomMappingsData";

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
