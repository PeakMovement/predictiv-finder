
import { ServiceCategory, ComorbidityGroup, SpecialPopulation, UserPreference } from "../types";
import { ServiceMatchResult } from "./serviceMatchTypes";

// Define the evidence level type to help with TypeScript errors
type EvidenceLevel = 'high' | 'medium' | 'low';

// Define a partial evidence level mapping type that won't cause strict TypeScript errors
type EvidenceLevelMapping = Partial<Record<ServiceCategory, EvidenceLevel>>;

// Define the special population overrides type with optional fields
type SpecialPopulationOverrides = Partial<Record<'child' | 'elderly' | 'athlete' | 'pregnant', {
  recommended: ServiceCategory[];
  contraindicated?: ServiceCategory[];
}>>;

/**
 * Enhanced condition/symptom to service mapping with evidence levels and specialized populations
 */
interface EnhancedServiceMapping {
  primaryServices: ServiceCategory[];
  secondaryServices: ServiceCategory[];
  evidenceLevels: EvidenceLevelMapping;
  specialPopulationOverrides?: SpecialPopulationOverrides;
  urgentCareServices?: ServiceCategory[];
}

/**
 * Advanced condition to service mapping
 */
const ENHANCED_CONDITION_MAPPINGS: Record<string, EnhancedServiceMapping> = {
  'knee pain': {
    primaryServices: ['physiotherapist', 'orthopedic-surgeon'],
    secondaryServices: ['personal-trainer', 'biokineticist', 'pain-management'],
    evidenceLevels: {
      'physiotherapist': 'high',
      'orthopedic-surgeon': 'high',
      'personal-trainer': 'medium',
      'biokineticist': 'medium',
      'pain-management': 'medium'
    },
    specialPopulationOverrides: {
      'elderly': {
        recommended: ['physiotherapist', 'pain-management'],
        contraindicated: ['personal-trainer']
      },
      'athlete': {
        recommended: ['sports-medicine', 'physiotherapist', 'biokineticist'],
      },
      'child': {
        recommended: ['pediatrics', 'physiotherapist'],
        contraindicated: ['orthopedic-surgeon', 'pain-management']
      }
    }
  },
  'back pain': {
    primaryServices: ['physiotherapist', 'chiropractor'],
    secondaryServices: ['pain-management', 'orthopedic-surgeon', 'massage-therapy'],
    evidenceLevels: {
      'physiotherapist': 'high',
      'chiropractor': 'medium',
      'pain-management': 'medium',
      'orthopedic-surgeon': 'medium',
      'massage-therapy': 'medium'
    },
    specialPopulationOverrides: {
      'elderly': {
        recommended: ['physiotherapist', 'pain-management'],
        contraindicated: ['chiropractor']
      },
      'pregnant': {
        recommended: ['physiotherapist'],
        contraindicated: ['chiropractor', 'orthopedic-surgeon']
      }
    }
  },
  'weight management': {
    primaryServices: ['dietician', 'personal-trainer'],
    secondaryServices: ['coaching', 'psychology', 'endocrinology'],
    evidenceLevels: {
      'dietician': 'high',
      'personal-trainer': 'high',
      'coaching': 'medium',
      'psychology': 'medium',
      'endocrinology': 'medium'
    },
    specialPopulationOverrides: {
      'child': {
        recommended: ['pediatrics', 'dietician'],
        contraindicated: ['personal-trainer']
      },
      'elderly': {
        recommended: ['dietician', 'geriatrics'],
        contraindicated: []
      }
    }
  },
  'diabetes management': {
    primaryServices: ['endocrinology', 'dietician'],
    secondaryServices: ['coaching', 'general-practitioner', 'podiatrist'],
    evidenceLevels: {
      'endocrinology': 'high',
      'dietician': 'high',
      'coaching': 'medium',
      'general-practitioner': 'medium',
      'podiatrist': 'medium'
    },
    urgentCareServices: ['endocrinology']
  },
  'cardiovascular health': {
    primaryServices: ['cardiology', 'general-practitioner'],
    secondaryServices: ['dietician', 'personal-trainer', 'psychology'],
    evidenceLevels: {
      'cardiology': 'high',
      'general-practitioner': 'high',
      'dietician': 'medium',
      'personal-trainer': 'medium',
      'psychology': 'low'
    },
    urgentCareServices: ['cardiology']
  },
  'anxiety': {
    primaryServices: ['psychology', 'psychiatry'],
    secondaryServices: ['coaching', 'general-practitioner'],
    evidenceLevels: {
      'psychology': 'high',
      'psychiatry': 'high',
      'coaching': 'medium',
      'general-practitioner': 'medium'
    }
  },
  'sports performance': {
    primaryServices: ['sports-medicine', 'personal-trainer'],
    secondaryServices: ['physiotherapist', 'biokineticist', 'dietician'],
    evidenceLevels: {
      'sports-medicine': 'high',
      'personal-trainer': 'high',
      'physiotherapist': 'medium',
      'biokineticist': 'medium',
      'dietician': 'medium'
    },
    specialPopulationOverrides: {
      'child': {
        recommended: ['pediatrics', 'sports-medicine'],
        contraindicated: []
      }
    }
  },
  'digestive issues': {
    primaryServices: ['gastroenterology', 'dietician'],
    secondaryServices: ['general-practitioner', 'nutrition-coaching'],
    evidenceLevels: {
      'gastroenterology': 'high',
      'dietician': 'high',
      'general-practitioner': 'medium',
      'nutrition-coaching': 'low'
    }
  }
};

/**
 * Defines groups of conditions that commonly occur together and require special handling
 */
const COMORBIDITY_GROUPS: ComorbidityGroup[] = [
  {
    name: 'Cardiometabolic Syndrome',
    conditions: ['diabetes', 'hypertension', 'obesity', 'cardiovascular'],
    recommendedServices: ['cardiology', 'endocrinology', 'dietician'],
    specialConsiderations: [
      'Requires coordinated care between specialists',
      'Regular monitoring of multiple vital parameters',
      'Comprehensive lifestyle modification program'
    ]
  },
  {
    name: 'Musculoskeletal Pain Complex',
    conditions: ['back pain', 'knee pain', 'joint pain', 'arthritis', 'fibromyalgia'],
    recommendedServices: ['physiotherapist', 'pain-management', 'rheumatology'],
    specialConsiderations: [
      'Multi-modal pain management approach needed',
      'Focus on functional improvement, not just pain reduction',
      'Consider psychological impact of chronic pain'
    ]
  },
  {
    name: 'Mental Health and Chronic Pain',
    conditions: ['anxiety', 'depression', 'chronic pain', 'back pain'],
    recommendedServices: ['psychology', 'psychiatry', 'pain-management', 'physiotherapist'],
    specialConsiderations: [
      'Integrated treatment plan addressing both physical and mental aspects',
      'Higher frequency of sessions initially recommended',
      'Mindfulness and cognitive behavioral approaches'
    ]
  },
  {
    name: 'Digestive and Stress Disorders',
    conditions: ['digestive issues', 'ibs', 'anxiety', 'stress'],
    recommendedServices: ['gastroenterology', 'psychology', 'dietician'],
    specialConsiderations: [
      'Mind-gut connection focus',
      'Stress reduction strategies essential',
      'Elimination diet may be beneficial'
    ]
  }
];

/**
 * Definitions for special populations that need customized care approaches
 */
const SPECIAL_POPULATIONS: SpecialPopulation[] = [
  {
    type: 'child',
    ageRange: [0, 12],
    recommendedServices: ['pediatrics', 'family-medicine', 'nutrition-coaching'],
    contraindicatedServices: ['psychiatry', 'pain-management'],
    specializedProviders: ['pediatrics', 'family-medicine']
  },
  {
    type: 'elderly',
    ageRange: [65, 120],
    recommendedServices: ['geriatrics', 'physiotherapist', 'family-medicine'],
    contraindicatedServices: ['sports-medicine', 'personal-trainer'],
    specializedProviders: ['geriatrics', 'family-medicine']
  },
  {
    type: 'athlete',
    recommendedServices: ['sports-medicine', 'physiotherapist', 'biokineticist', 'dietician'],
    specializedProviders: ['sports-medicine', 'biokineticist']
  },
  {
    type: 'pregnant',
    recommendedServices: ['family-medicine', 'dietician', 'physiotherapist'],
    contraindicatedServices: ['chiropractor', 'psychiatry'],
    specializedProviders: ['family-medicine']
  },
  {
    type: 'chronic',
    recommendedServices: ['family-medicine', 'psychology', 'dietician', 'physiotherapist'],
    specializedProviders: ['family-medicine', 'psychology']
  }
];

/**
 * Detects which special population a user might belong to based on their input
 */
export function detectSpecialPopulation(
  userInput: string, 
  userAge?: number
): SpecialPopulation | null {
  const inputLower = userInput.toLowerCase();
  
  // Check for age-based populations first if age is provided
  if (typeof userAge === 'number') {
    const childPopulation = SPECIAL_POPULATIONS.find(p => 
      p.type === 'child' && p.ageRange && userAge >= p.ageRange[0] && userAge <= p.ageRange[1]
    );
    if (childPopulation) return childPopulation;
    
    const elderlyPopulation = SPECIAL_POPULATIONS.find(p => 
      p.type === 'elderly' && p.ageRange && userAge >= p.ageRange[0] && userAge <= p.ageRange[1]
    );
    if (elderlyPopulation) return elderlyPopulation;
  }
  
  // Check for keyword-based populations
  if (inputLower.includes('child') || inputLower.includes('kid') || 
      inputLower.includes('son') || inputLower.includes('daughter')) {
    return SPECIAL_POPULATIONS.find(p => p.type === 'child') || null;
  }
  
  if (inputLower.includes('elder') || inputLower.includes('senior') || 
      inputLower.includes('old age') || inputLower.includes('retirement')) {
    return SPECIAL_POPULATIONS.find(p => p.type === 'elderly') || null;
  }
  
  if (inputLower.includes('athlete') || inputLower.includes('sport') || 
      inputLower.includes('competition') || inputLower.includes('training') || 
      inputLower.includes('marathon') || inputLower.includes('triathlon')) {
    return SPECIAL_POPULATIONS.find(p => p.type === 'athlete') || null;
  }
  
  if (inputLower.includes('pregnant') || inputLower.includes('pregnancy') || 
      inputLower.includes('expecting') || inputLower.includes('trimester')) {
    return SPECIAL_POPULATIONS.find(p => p.type === 'pregnant') || null;
  }
  
  if (inputLower.includes('chronic') || inputLower.includes('long-term') || 
      inputLower.includes('ongoing condition') || inputLower.includes('years of')) {
    return SPECIAL_POPULATIONS.find(p => p.type === 'chronic') || null;
  }
  
  return null;
}

/**
 * Detects comorbidities based on identified conditions
 */
export function detectComorbidities(conditions: string[]): ComorbidityGroup[] {
  return COMORBIDITY_GROUPS.filter(group => {
    // Check if multiple conditions from this group are present
    const matchingConditions = group.conditions.filter(groupCondition => 
      conditions.some(userCondition => 
        userCondition.toLowerCase().includes(groupCondition.toLowerCase())
      )
    );
    
    // Return this group if two or more conditions match
    return matchingConditions.length >= 2;
  });
}

/**
 * Advanced service matcher that considers special populations, comorbidities,
 * user preferences, and evidence-based practice
 */
export function matchServicesToConditionsAdvanced(
  conditions: string[],
  userInput: string,
  urgency: number = 0,
  userAge?: number,
  userPreference?: UserPreference
): ServiceMatchResult[] {
  console.log("Advanced service matching for conditions:", conditions);
  
  // Step 1: Detect special population
  const specialPopulation = detectSpecialPopulation(userInput, userAge);
  console.log("Detected special population:", specialPopulation?.type || "none");
  
  // Step 2: Detect comorbidities
  const comorbidities = detectComorbidities(conditions);
  console.log("Detected comorbidities:", comorbidities.map(c => c.name));
  
  // Step 3: Initialize results collection
  // Use a partial type to avoid TypeScript errors when building this dynamically
  const serviceScores: Record<string, { 
    score: number;
    factors: string[];
    primaryCondition?: string;
    evidenceLevel: EvidenceLevel;
    isContraindicated: boolean;
  }> = {};
  
  // Step 4: Score services based on conditions
  conditions.forEach(condition => {
    // Find matching condition in our mappings
    const matchingCondition = Object.keys(ENHANCED_CONDITION_MAPPINGS).find(
      key => condition.toLowerCase().includes(key.toLowerCase())
    );
    
    if (matchingCondition) {
      const mapping = ENHANCED_CONDITION_MAPPINGS[matchingCondition];
      
      // Add primary services with high scores
      mapping.primaryServices.forEach(service => {
        if (!serviceScores[service]) {
          serviceScores[service] = { 
            score: 0, 
            factors: [], 
            evidenceLevel: mapping.evidenceLevels[service] || 'medium',
            isContraindicated: false
          };
        }
        
        // Higher score for primary services
        serviceScores[service].score += 0.8;
        serviceScores[service].factors.push(`Primary service for ${matchingCondition}`);
        
        // Set this as the primary condition if it has the highest score so far
        if (!serviceScores[service].primaryCondition) {
          serviceScores[service].primaryCondition = matchingCondition;
        }
      });
      
      // Add secondary services with lower scores
      mapping.secondaryServices.forEach(service => {
        if (!serviceScores[service]) {
          serviceScores[service] = { 
            score: 0, 
            factors: [], 
            evidenceLevel: mapping.evidenceLevels[service] || 'low',
            isContraindicated: false
          };
        }
        
        // Lower score for secondary services
        serviceScores[service].score += 0.4;
        serviceScores[service].factors.push(`Supporting service for ${matchingCondition}`);
      });
      
      // Handle urgent care if specified
      if (urgency > 0.5 && mapping.urgentCareServices) {
        mapping.urgentCareServices.forEach(service => {
          if (serviceScores[service]) {
            serviceScores[service].score += urgency * 0.5;
            serviceScores[service].factors.push(`Urgent care prioritization`);
          }
        });
      }
    }
  });
  
  // Step 5: Apply special population adjustments
  if (specialPopulation) {
    // Add recommended services for this population
    specialPopulation.recommendedServices.forEach(service => {
      if (!serviceScores[service]) {
        serviceScores[service] = { 
          score: 0.4, 
          factors: [], 
          evidenceLevel: 'medium',
          isContraindicated: false
        };
      }
      
      serviceScores[service].score += 0.3;
      serviceScores[service].factors.push(
        `Recommended for ${specialPopulation.type} population`
      );
    });
    
    // Mark contraindicated services
    if (specialPopulation.contraindicatedServices) {
      specialPopulation.contraindicatedServices.forEach(service => {
        if (serviceScores[service]) {
          serviceScores[service].isContraindicated = true;
          serviceScores[service].factors.push(
            `Caution: May not be appropriate for ${specialPopulation.type} population`
          );
        }
      });
    }
    
    // Adjust scores based on condition-specific population overrides
    conditions.forEach(condition => {
      const matchingCondition = Object.keys(ENHANCED_CONDITION_MAPPINGS).find(
        key => condition.toLowerCase().includes(key.toLowerCase())
      );
      
      if (matchingCondition) {
        const mapping = ENHANCED_CONDITION_MAPPINGS[matchingCondition];
        const populationOverride = mapping.specialPopulationOverrides?.[
          specialPopulation.type as 'child' | 'elderly' | 'athlete' | 'pregnant'
        ];
        
        if (populationOverride) {
          // Boost recommended services
          populationOverride.recommended.forEach(service => {
            if (!serviceScores[service]) {
              serviceScores[service] = { 
                score: 0.3, 
                factors: [], 
                evidenceLevel: 'medium',
                isContraindicated: false
              };
            }
            
            serviceScores[service].score += 0.4;
            serviceScores[service].factors.push(
              `Specifically recommended for ${specialPopulation.type} with ${matchingCondition}`
            );
          });
          
          // Mark contraindicated services
          if (populationOverride.contraindicated) {
            populationOverride.contraindicated.forEach(service => {
              if (serviceScores[service]) {
                serviceScores[service].isContraindicated = true;
                serviceScores[service].factors.push(
                  `Not recommended for ${specialPopulation.type} with ${matchingCondition}`
                );
              }
            });
          }
        }
      }
    });
  }
  
  // Step 6: Apply comorbidity adjustments
  comorbidities.forEach(comorbidity => {
    // Boost recommended services for this comorbidity group
    comorbidity.recommendedServices.forEach(service => {
      if (!serviceScores[service]) {
        serviceScores[service] = { 
          score: 0.5, 
          factors: [], 
          evidenceLevel: 'medium',
          isContraindicated: false
        };
      }
      
      serviceScores[service].score += 0.5; // Significant boost for comorbidities
      serviceScores[service].factors.push(
        `Recommended for ${comorbidity.name} comorbidity`
      );
    });
  });
  
  // Step 7: Apply user preference adjustments
  if (userPreference) {
    // Boost preferred services
    userPreference.preferredServiceTypes?.forEach(service => {
      if (serviceScores[service]) {
        serviceScores[service].score += 0.2;
        serviceScores[service].factors.push('User preference');
      }
    });
    
    // Lower scores for avoided services
    userPreference.avoidServiceTypes?.forEach(service => {
      if (serviceScores[service]) {
        serviceScores[service].score -= 0.4;
        serviceScores[service].factors.push('User preference to avoid');
      }
    });
    
    // Adjust based on previous service experiences
    userPreference.previouslyUsedServices?.forEach(previous => {
      if (serviceScores[previous.serviceType]) {
        // Boost for positive outcomes, reduce for negative
        const outcomeAdjustment = 
          previous.outcome === 'positive' ? 0.3 : 
          previous.outcome === 'negative' ? -0.3 : 0;
        
        // Usage count adjustment - familiar services get a small boost
        const usageAdjustment = Math.min(previous.usageCount * 0.05, 0.15);
        
        serviceScores[previous.serviceType].score += outcomeAdjustment + usageAdjustment;
        serviceScores[previous.serviceType].factors.push(
          `Previous experience (${previous.outcome}, ${previous.usageCount} times)`
        );
      }
    });
  }
  
  // Step 8: Generate final results
  const results: ServiceMatchResult[] = Object.entries(serviceScores)
    .filter(([_, data]) => !data.isContraindicated) // Filter out contraindicated services
    .map(([category, data]) => ({
      category: category as ServiceCategory,
      score: data.score,
      relevanceFactors: data.factors,
      primaryCondition: data.primaryCondition,
      evidenceLevel: data.evidenceLevel,
      // Add alternative options for each service
      alternativeOptions: findAlternativeServices(category as ServiceCategory, conditions)
    }))
    .sort((a, b) => b.score - a.score); // Sort by score descending
  
  return results;
}

/**
 * Finds alternative services for a given service category
 */
function findAlternativeServices(
  serviceCategory: ServiceCategory, 
  conditions: string[]
): ServiceCategory[] {
  // Define a partial record for service alternatives to avoid TypeScript errors
  const SERVICE_ALTERNATIVES: Partial<Record<ServiceCategory, ServiceCategory[]>> = {
    'physiotherapist': ['biokineticist', 'physical-therapy', 'chiropractor'],
    'biokineticist': ['physiotherapist', 'personal-trainer'],
    'dietician': ['nutrition-coaching', 'coaching'],
    'personal-trainer': ['biokineticist', 'coaching'],
    'psychology': ['psychiatry', 'coaching'],
    'psychiatry': ['psychology', 'general-practitioner'],
    'gastroenterology': ['dietician', 'general-practitioner'],
    'sports-medicine': ['orthopedic-surgeon', 'physiotherapist'],
    'cardiology': ['general-practitioner', 'sports-medicine'],
    'pain-management': ['physiotherapist', 'psychology'],
    'general-practitioner': ['family-medicine', 'nurse-practitioner'],
    'orthopedic-surgeon': ['sports-medicine', 'physiotherapist'],
    'family-medicine': ['general-practitioner', 'nurse-practitioner']
  };
  
  // Get base alternatives from the mapping
  const baseAlternatives = SERVICE_ALTERNATIVES[serviceCategory] || [];
  
  // Find condition-specific alternatives
  const conditionAlternatives = new Set<ServiceCategory>();
  
  conditions.forEach(condition => {
    const matchingCondition = Object.keys(ENHANCED_CONDITION_MAPPINGS).find(
      key => condition.toLowerCase().includes(key.toLowerCase())
    );
    
    if (matchingCondition) {
      const mapping = ENHANCED_CONDITION_MAPPINGS[matchingCondition];
      
      // If this service is a primary service for this condition,
      // other primary services are good alternatives
      if (mapping.primaryServices.includes(serviceCategory)) {
        mapping.primaryServices.forEach(s => {
          if (s !== serviceCategory) conditionAlternatives.add(s);
        });
      }
      
      // If this is a secondary service, add other secondaries
      if (mapping.secondaryServices.includes(serviceCategory)) {
        mapping.secondaryServices.forEach(s => {
          if (s !== serviceCategory) conditionAlternatives.add(s);
        });
      }
    }
  });
  
  // Combine base and condition alternatives and return unique set
  return [...new Set([...baseAlternatives, ...conditionAlternatives])];
}

/**
 * Public API: Main function to get personalized service recommendations
 */
export function getPersonalizedServiceRecommendations(
  userInput: string,
  conditions: string[],
  urgencyLevel: number = 0,
  userAge?: number,
  userPreferences?: UserPreference
): ServiceMatchResult[] {
  // Basic validation
  if (!userInput || !conditions.length) {
    console.log("Invalid input for personalized recommendations");
    return [];
  }
  
  console.log("Getting personalized service recommendations for:", userInput);
  console.log("Identified conditions:", conditions);
  console.log("Urgency level:", urgencyLevel);
  
  // Use our advanced matching algorithm
  try {
    const recommendations = matchServicesToConditionsAdvanced(
      conditions,
      userInput,
      urgencyLevel,
      userAge,
      userPreferences
    );
    
    console.log("Generated recommendations:", recommendations.length);
    return recommendations;
  } catch (error) {
    console.error("Error generating service recommendations:", error);
    return [];
  }
}
