
import { ServiceCategory, SpecialPopulation } from "../types";
import { detectSpecialPopulation } from "../serviceMatching/advancedServiceMatcher";

/**
 * Special considerations for different populations
 */
export interface SpecialPopulationConsideration {
  populationType: 'child' | 'elderly' | 'athlete' | 'pregnant' | 'chronic';
  title: string;
  description: string;
  recommendedApproach: string[];
  serviceModifications: {
    service: ServiceCategory;
    modification: string;
  }[];
  additionalNotes: string[];
}

/**
 * Map of special considerations by population type
 */
const SPECIAL_POPULATION_CONSIDERATIONS: Record<string, SpecialPopulationConsideration> = {
  'child': {
    populationType: 'child',
    title: 'Pediatric Care Considerations',
    description: 'Specialized approaches for children requiring developmental considerations and age-appropriate interventions.',
    recommendedApproach: [
      'Focus on developmentally appropriate activities and explanations',
      'Include parents/guardians in treatment planning and sessions',
      'Use play-based therapies when appropriate',
      'Consider school and social environment factors'
    ],
    serviceModifications: [
      { 
        service: 'physiotherapist',
        modification: 'Pediatric-focused techniques with emphasis on playful engagement'
      },
      {
        service: 'dietician',
        modification: 'Family-centered nutritional counseling with growth-focused goals'
      },
      {
        service: 'psychology',
        modification: 'Child psychology methods with appropriate cognitive level adjustments'
      }
    ],
    additionalNotes: [
      'Session length may need to be shorter for younger children',
      'Treatment progress may follow different patterns compared to adults',
      'Behavioral considerations are essential for treatment adherence'
    ]
  },
  'elderly': {
    populationType: 'elderly',
    title: 'Geriatric Care Considerations',
    description: 'Specialized approaches for older adults addressing age-related changes and comorbidities.',
    recommendedApproach: [
      'Consider reduced recovery capacity and potential comorbidities',
      'Focus on functional independence and quality of life',
      'Monitor medication interactions carefully',
      'Address fall prevention and mobility concerns'
    ],
    serviceModifications: [
      { 
        service: 'physiotherapist',
        modification: 'Lower intensity with more frequent shorter sessions focusing on functional movement'
      },
      {
        service: 'dietician',
        modification: 'Nutrition plans considering age-related changes in metabolism and nutritional needs'
      },
      {
        service: 'personal-trainer',
        modification: 'Modified exercises emphasizing balance, core strength and functional fitness'
      }
    ],
    additionalNotes: [
      'Transportation and accessibility considerations may be necessary',
      'Home-based services often beneficial',
      'Include family members or caregivers in treatment planning'
    ]
  },
  'athlete': {
    populationType: 'athlete',
    title: 'Athletic Performance Considerations',
    description: 'Specialized approaches for athletes focusing on performance optimization and sport-specific requirements.',
    recommendedApproach: [
      'Consider training and competition schedule in treatment planning',
      'Sport-specific functional assessments and interventions',
      'Performance-centered approach with measurable outcomes',
      'Periodized treatment planning aligned with competitive seasons'
    ],
    serviceModifications: [
      { 
        service: 'physiotherapist',
        modification: 'Sport-specific rehabilitation with performance testing and return-to-play protocols'
      },
      {
        service: 'dietician',
        modification: 'Performance nutrition with periodized plans aligned to training cycle'
      },
      {
        service: 'personal-trainer',
        modification: 'Advanced conditioning techniques with sport-specific movement patterns'
      },
      {
        service: 'biokineticist',
        modification: 'Biomechanical optimization for sport-specific movement efficiency'
      }
    ],
    additionalNotes: [
      'May require more intensive treatment schedule during specific training phases',
      'Consideration of anti-doping regulations for treatment modalities',
      'Mental performance aspects should be integrated into physical interventions'
    ]
  },
  'pregnant': {
    populationType: 'pregnant',
    title: 'Prenatal and Postnatal Care Considerations',
    description: 'Specialized approaches for pregnant individuals addressing changing physiological needs and safety concerns.',
    recommendedApproach: [
      'Trimester-specific modifications to all interventions',
      'Focus on safety while supporting maternal and fetal health',
      'Address pregnancy-related discomforts and functional changes',
      'Prepare for postpartum recovery and adjustment'
    ],
    serviceModifications: [
      { 
        service: 'physiotherapist',
        modification: 'Prenatal-specific techniques addressing pelvic stability, posture and pain management'
      },
      {
        service: 'dietician',
        modification: 'Nutrition counseling supporting maternal and fetal health needs by trimester'
      },
      {
        service: 'personal-trainer',
        modification: 'Pregnancy-safe exercise programs with emphasis on function and comfort'
      }
    ],
    additionalNotes: [
      'Regular reassessment is crucial as pregnancy progresses',
      'Coordination with obstetric healthcare providers recommended',
      'Postpartum care requires specific considerations for recovery'
    ]
  },
  'chronic': {
    populationType: 'chronic',
    title: 'Chronic Condition Management Considerations',
    description: 'Specialized approaches for individuals with chronic health conditions requiring ongoing management.',
    recommendedApproach: [
      'Integrated care coordination between healthcare providers',
      'Self-management education and support',
      'Focus on quality of life and functional improvement',
      'Regular monitoring and adapting to changing condition status'
    ],
    serviceModifications: [
      { 
        service: 'physiotherapist',
        modification: 'Energy conservation techniques and pacing strategies for sustainable activity'
      },
      {
        service: 'dietician',
        modification: 'Nutrition planning considering medication interactions and symptom management'
      },
      {
        service: 'psychology',
        modification: 'Cognitive behavioral strategies for pain and symptom management'
      }
    ],
    additionalNotes: [
      'Flare-up management strategies should be included in all care plans',
      'Social support and mental health aspects are crucial components',
      'Treatment expectations may need adjustment based on condition progression'
    ]
  }
};

/**
 * Analyzes user input to detect special population status and provide
 * appropriate recommendations
 */
export function analyzeSpecialPopulationNeeds(
  userInput: string, 
  detectedConditions: string[],
  userAge?: number
): {
  detectedPopulation: SpecialPopulation | null;
  considerations: SpecialPopulationConsideration | null;
  modifiedServices: {
    serviceType: ServiceCategory;
    modification: string;
  }[];
} {
  // Detect special population from user input
  const detectedPopulation = detectSpecialPopulation(userInput, userAge);
  
  // If no special population detected, return null results
  if (!detectedPopulation) {
    return {
      detectedPopulation: null,
      considerations: null,
      modifiedServices: []
    };
  }
  
  // Get considerations for this population
  const considerations = SPECIAL_POPULATION_CONSIDERATIONS[detectedPopulation.type] || null;
  
  // Create modified services based on detected population and conditions
  const modifiedServices = [];
  
  if (detectedPopulation.recommendedServices) {
    for (const service of detectedPopulation.recommendedServices) {
      const modification = considerations?.serviceModifications.find(
        mod => mod.service === service
      );
      
      if (modification) {
        modifiedServices.push({
          serviceType: service,
          modification: modification.modification
        });
      }
    }
  }
  
  return {
    detectedPopulation,
    considerations,
    modifiedServices
  };
}

/**
 * Generates explanatory content for special population considerations
 */
export function generateSpecialPopulationExplanation(
  populationType: 'child' | 'elderly' | 'athlete' | 'pregnant' | 'chronic'
): string {
  const considerations = SPECIAL_POPULATION_CONSIDERATIONS[populationType];
  
  if (!considerations) {
    return "Your health plan considers your specific needs.";
  }
  
  return `${considerations.title}: ${considerations.description} ${considerations.recommendedApproach.join('. ')}`;
}

/**
 * Adjusts service recommendations based on special population needs
 */
export function adjustServicesForSpecialPopulation(
  services: ServiceCategory[],
  populationType: 'child' | 'elderly' | 'athlete' | 'pregnant' | 'chronic'
): {
  recommendedServices: ServiceCategory[];
  removedServices: ServiceCategory[];
  addedServices: ServiceCategory[];
  explanation: string;
} {
  // Start with original services
  const recommendedServices = [...services];
  const removedServices: ServiceCategory[] = [];
  const addedServices: ServiceCategory[] = [];
  let explanation = "";
  
  // Get special population info
  const population = SPECIAL_POPULATIONS.find(p => p.type === populationType);
  
  if (!population) {
    return { 
      recommendedServices, 
      removedServices, 
      addedServices, 
      explanation: "No special adjustments needed."
    };
  }
  
  // Remove contraindicated services
  if (population.contraindicatedServices) {
    population.contraindicatedServices.forEach(service => {
      const index = recommendedServices.indexOf(service);
      if (index !== -1) {
        recommendedServices.splice(index, 1);
        removedServices.push(service);
      }
    });
  }
  
  // Add specialized services if not already included
  if (population.specializedProviders) {
    population.specializedProviders.forEach(service => {
      if (!recommendedServices.includes(service)) {
        recommendedServices.push(service);
        addedServices.push(service);
      }
    });
  }
  
  // Generate explanation
  const considerations = SPECIAL_POPULATION_CONSIDERATIONS[populationType];
  if (considerations) {
    explanation = `${considerations.title}: `;
    
    if (removedServices.length > 0) {
      explanation += `Some services have been adjusted or replaced with more appropriate options for ${populationType} care. `;
    }
    
    if (addedServices.length > 0) {
      explanation += `Specialized ${populationType}-focused services have been added to your plan. `;
    }
    
    explanation += considerations.recommendedApproach[0];
  }
  
  return {
    recommendedServices,
    removedServices,
    addedServices,
    explanation
  };
}
