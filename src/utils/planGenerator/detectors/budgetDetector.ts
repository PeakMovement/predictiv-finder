
import { ServiceCategory } from "../types";

export const detectBudgetConstraints = (
  inputLower: string,
  contraindications: ServiceCategory[]
): number | null => {
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
    
    return budget;
  }
  
  return null;
};
