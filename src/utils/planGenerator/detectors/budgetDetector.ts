
import { ServiceCategory } from "../types";
import { createServiceCategoryRecord } from "../helpers/serviceRecordInitializer";

/**
 * Enhanced budget detection with improved context sensitivity
 * 
 * @param inputLower Lowercased user input text
 * @param contraindications Output array to append service contraindications based on budget
 * @returns Detected budget amount or null if not found
 */
export const detectBudgetConstraints = (
  inputLower: string,
  contraindications: ServiceCategory[]
): number | null => {
  // Budget detection - multiple regex patterns for different ways people mention budget
  const budgetMatch = inputLower.match(/r\s*(\d{1,6})/i) || 
                     inputLower.match(/budget.*?(\d{1,6})/i) ||
                     inputLower.match(/afford.*?(\d{1,6})/i) ||
                     inputLower.match(/cost.*?(\d{1,6})/i) ||
                     inputLower.match(/spend.*?(\d{1,6})/i) ||
                     inputLower.match(/pay.*?(\d{1,6})/i) ||
                     // Handle numeric budget with currency
                     inputLower.match(/\$(\d{1,6})/i) ||
                     inputLower.match(/(\d{1,6})\s*rand/i);
  
  if (budgetMatch && budgetMatch[1]) {
    const budget = parseInt(budgetMatch[1], 10);
    console.log(`*** DETECTED SPECIFIC BUDGET: R${budget} ***`);
    
    // Budget tiers with refined thresholds - better handling for tight budgets
    if (budget < 1500) {
      console.log("Budget is in LOW tier (<R1500)");
      // For low budgets, avoid expensive specialists
      const expensiveSpecialists: ServiceCategory[] = [
        'cardiology', 'neurology', 'gastroenterology', 'orthopedics', 
        'psychiatry', 'neurosurgery', 'oncology', 'plastic-surgery'
      ];
      
      // Only add to contraindications if not already present
      expensiveSpecialists.forEach(specialist => {
        if (!contraindications.includes(specialist)) {
          contraindications.push(specialist);
          console.log(`Added ${specialist} to contraindications due to tight budget of R${budget}`);
        }
      });
      
      // For extremely tight budgets under R800, prioritize even more carefully
      if (budget < 800) {
        console.log("Budget is extremely limited (<R800)");
        
        // Keep only most essential and affordable services
        const allSpecialists: ServiceCategory[] = [
          'dietician', 'personal-trainer', 'physiotherapist', 'coaching',
          'biokineticist', 'endocrinology', 'cardiology', 'neurology', 
          'gastroenterology', 'orthopedics', 'psychiatry', 'rheumatology',
          'podiatrist', 'pain-management', 'sport-physician', 'orthopedic-surgeon'
        ];
        
        // Exclude all specialists except family medicine and the most affordable options
        allSpecialists.forEach(specialist => {
          if (!['family-medicine', 'coaching', 'nutrition-coaching'].includes(specialist) && 
              !contraindications.includes(specialist)) {
            contraindications.push(specialist);
            console.log(`Added ${specialist} to contraindications due to extremely tight budget of R${budget}`);
          }
        });
      }
    } else if (budget < 3000) {
      console.log("Budget is in MEDIUM tier (R1500-R3000)");
      // For medium budgets, avoid only the most expensive specialists
      const veryExpensiveSpecialists: ServiceCategory[] = [
        'neurosurgery', 'orthopedic-surgeon', 'plastic-surgery'
      ];
      
      veryExpensiveSpecialists.forEach(specialist => {
        if (!contraindications.includes(specialist)) {
          contraindications.push(specialist);
          console.log(`Added ${specialist} to contraindications due to medium budget of R${budget}`);
        }
      });
    } else {
      console.log("Budget is in HIGH tier (R3000+) - no service exclusions");
      // No contraindications for high budgets
    }
    
    return budget;
  }
  
  // Check for budget constraint language even if no specific number is mentioned
  const budgetConstraintTerms = [
    'tight budget', 'limited budget', 'cheap', 'affordable', 
    'low cost', "can't afford", 'budget constraint', 'expensive',
    'low price', 'reasonable price', 'cost effective', 'inexpensive',
    'save money', 'economical', 'financial constraints', 'money is tight'
  ];
  
  const hasBudgetConstraintLanguage = budgetConstraintTerms.some(term => inputLower.includes(term));
  
  if (hasBudgetConstraintLanguage) {
    console.log("Detected budget constraint language without specific amount");
    
    // Default conservative budget when constraints are mentioned without amount
    const defaultBudget = 1200;
    
    // Apply same logic as for tight budgets
    const expensiveSpecialists: ServiceCategory[] = [
      'cardiology', 'neurology', 'gastroenterology', 'orthopedics', 
      'psychiatry', 'neurosurgery', 'oncology'
    ];
    
    expensiveSpecialists.forEach(specialist => {
      if (!contraindications.includes(specialist)) {
        contraindications.push(specialist);
        console.log(`Added ${specialist} to contraindications due to implied budget constraints`);
      }
    });
    
    // Check for extreme budget sensitivity terms
    const extremeConstraintTerms = [
      'very tight budget', 'extremely limited', 'cheapest possible',
      'can\'t afford much', 'minimal cost', 'no money', 'broke'
    ];
    
    const hasExtremeConstraint = extremeConstraintTerms.some(term => inputLower.includes(term));
    
    if (hasExtremeConstraint) {
      console.log("Detected extreme budget sensitivity language");
      // Return an even lower budget
      return 800;
    }
    
    return defaultBudget;
  }
  
  return null;
};

/**
 * Determines if budget is a major concern based on input language
 * 
 * @param inputLower Lowercased user input text
 * @returns Boolean indicating if budget is a major concern
 */
export const isBudgetMajorConcern = (inputLower: string): boolean => {
  // Count budget-related terms
  const budgetTerms = [
    'budget', 'afford', 'cost', 'price', 'expensive', 'cheap', 'money',
    'financial', 'economical', 'save', 'spend', 'payment', 'rand', 'r'
  ];
  
  let budgetTermCount = 0;
  
  budgetTerms.forEach(term => {
    // Count all occurrences of the term
    const regex = new RegExp(term, 'gi');
    const matches = inputLower.match(regex);
    if (matches) {
      budgetTermCount += matches.length;
    }
  });
  
  // Check for strong budget statements
  const strongBudgetStatements = [
    'limited budget', 'tight budget', 'can\'t afford', 'too expensive',
    'cheaper option', 'budget is important', 'cost is a factor',
    'need affordable', 'cost is a concern', 'money is tight'
  ];
  
  const hasStrongStatement = strongBudgetStatements.some(statement => 
    inputLower.includes(statement)
  );
  
  // Budget is a major concern if mentioned multiple times or with strong statements
  return budgetTermCount >= 3 || hasStrongStatement;
};

/**
 * Apply budget-aware service selection logic
 * 
 * @param detectedBudget Detected budget amount
 * @param serviceCategories Array of service categories
 * @returns Prioritized service categories with budget-friendly alternatives
 */
export const applyBudgetAwareSelection = (
  detectedBudget: number | null, 
  serviceCategories: ServiceCategory[]
): {
  prioritizedServices: ServiceCategory[];
  alternatives: Record<ServiceCategory, ServiceCategory[]>;
} => {
  // Initialize result with empty alternatives record
  const result = {
    prioritizedServices: [...serviceCategories],
    alternatives: createServiceCategoryRecord([] as ServiceCategory[])
  };
  
  // If no budget detected, return original services
  if (!detectedBudget) {
    return result;
  }
  
  // Budget-friendly alternatives for expensive services - define for those that have alternatives
  // This now uses a map variable instead of a full Record declaration
  const budgetAlternativesMappings: Array<[ServiceCategory, ServiceCategory[]]> = [
    ['psychiatry', ['psychology', 'coaching']],
    ['orthopedic-surgeon', ['orthopedics', 'physiotherapist']],
    ['neurosurgery', ['neurology', 'pain-management']],
    ['cardiology', ['family-medicine', 'internal-medicine']],
    ['gastroenterology', ['family-medicine', 'dietician']],
    ['dermatology', ['family-medicine']],
    ['rheumatology', ['family-medicine', 'pain-management']],
    ['endocrinology', ['family-medicine', 'dietician']]
  ];
  
  // Apply mappings to our result.alternatives
  budgetAlternativesMappings.forEach(([category, alternatives]) => {
    result.alternatives[category] = alternatives;
  });
  
  // Service costs (approximate per session)
  const serviceCosts: Record<ServiceCategory, number> = {
    'family-medicine': 600,
    'physiotherapist': 700,
    'dietician': 550,
    'personal-trainer': 450,
    'psychiatry': 1200,
    'orthopedic-surgeon': 1800,
    'orthopedics': 1200,
    'neurosurgery': 2200,
    'neurology': 1300,
    'cardiology': 1400,
    'gastroenterology': 1400,
    'coaching': 500,
    'psychology': 900,
    'pain-management': 900,
    'dermatology': 1000,
    'rheumatology': 1000,
    'endocrinology': 1200,
    'nutrition-coaching': 450,
    'biokineticist': 700,
    'sports-medicine': 1100,
    'internal-medicine': 1000,
    'physical-therapy': 750,
    'chiropractor': 600,
    'podiatrist': 750,
    'general-practitioner': 600,
    'sport-physician': 1200,
    'massage-therapy': 500,
    'occupational-therapy': 700,
    'nurse-practitioner': 500,
    'urology': 1100,
    'oncology': 1600,
    'pediatrics': 900,
    'geriatrics': 950,
    'infectious-disease': 1300,
    'plastic-surgery': 2100,
    'obstetrics-gynecology': 1100,
    'emergency-medicine': 1500,
    'anesthesiology': 1700,
    'radiology': 1200,
    'geriatric-medicine': 900,
    'strength-coaching': 550,
    'run-coaching': 600,
    'all': 0
  };
  
  // For tight budgets, replace expensive services with alternatives
  if (detectedBudget < 2000) {
    const updatedServices: ServiceCategory[] = [];
    
    serviceCategories.forEach(service => {
      const serviceCost = serviceCosts[service] || 1000;
      
      // If service is expensive and has alternatives
      if (serviceCost > detectedBudget/2 && result.alternatives[service] && result.alternatives[service].length > 0) {
        // Add the first affordable alternative
        const alternativeService = result.alternatives[service].find(
          alt => (serviceCosts[alt] || 1000) <= detectedBudget/2
        );
        
        if (alternativeService) {
          updatedServices.push(alternativeService);
          console.log(`Replacing ${service} with budget-friendly ${alternativeService}`);
        } else {
          // Keep original if no affordable alternative
          updatedServices.push(service);
        }
      } else {
        // Keep affordable services
        updatedServices.push(service);
      }
    });
    
    result.prioritizedServices = updatedServices;
  }
  
  // Prioritize services by affordability within the detected budget
  result.prioritizedServices.sort((a, b) => {
    const costA = serviceCosts[a] || 1000;
    const costB = serviceCosts[b] || 1000;
    
    // Calculate sessions available within budget
    const sessionsA = Math.floor(detectedBudget / costA);
    const sessionsB = Math.floor(detectedBudget / costB);
    
    // Sort by number of possible sessions (value for money)
    return sessionsB - sessionsA;
  });
  
  return result;
};
