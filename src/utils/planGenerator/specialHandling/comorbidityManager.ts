
import { ServiceCategory } from '@/types';

/**
 * Interface defining a group of related medical conditions
 */
interface ComorbidityGroup {
  name: string;
  conditions: string[];
  recommendedServices: ServiceCategory[];
  specialConsiderations?: string[];
}

/**
 * Common co-morbidity groups with their recommended service bundles
 */
export const COMORBIDITY_GROUPS: ComorbidityGroup[] = [
  {
    name: "Knee Pain + Race Preparation",
    conditions: ["knee pain", "race preparation", "marathon training"],
    recommendedServices: ["physiotherapist", "coaching", "personal-trainer"],
    specialConsiderations: [
      "Prioritize knee rehabilitation before increasing running volume",
      "Focus on strengthening surrounding muscles"
    ]
  },
  {
    name: "Anxiety + Nutrition",
    conditions: ["anxiety", "nutrition", "diet", "stress eating"],
    recommendedServices: ["dietician", "psychology", "coaching"],
    specialConsiderations: [
      "Address relationship between mood and eating patterns",
      "Focus on sustainable lifestyle changes rather than restrictive dieting"
    ]
  },
  {
    name: "Back Pain + Sedentary Lifestyle",
    conditions: ["back pain", "sedentary", "desk job", "sitting", "office work"],
    recommendedServices: ["physiotherapist", "personal-trainer", "ergonomic assessment"],
    specialConsiderations: [
      "Workplace ergonomics assessment recommended",
      "Focus on core strengthening and posture correction"
    ]
  },
  {
    name: "Diabetes + Weight Management",
    conditions: ["diabetes", "weight", "obesity", "blood sugar"],
    recommendedServices: ["dietician", "endocrinology", "personal-trainer"],
    specialConsiderations: [
      "Careful glucose monitoring during exercise",
      "Specialized nutrition plan required"
    ]
  },
  {
    name: "Hypertension + Stress",
    conditions: ["hypertension", "blood pressure", "stress", "anxiety"],
    recommendedServices: ["cardiology", "psychology", "dietician"],
    specialConsiderations: [
      "Regular blood pressure monitoring",
      "Stress management techniques are essential"
    ]
  }
];

/**
 * Detects co-occurring conditions that require specialized service bundles
 */
export function detectComorbidities(conditions: string[]): ComorbidityGroup[] {
  if (!conditions || conditions.length < 2) {
    return [];
  }

  // Normalize conditions for matching
  const normalizedConditions = conditions.map(c => c.toLowerCase());
  
  // Match against known co-morbidity groups
  return COMORBIDITY_GROUPS.filter(group => {
    // Count how many conditions from this group are present
    const matchCount = group.conditions.filter(groupCondition => 
      normalizedConditions.some(userCondition => 
        userCondition.includes(groupCondition) || groupCondition.includes(userCondition)
      )
    ).length;
    
    // Consider it a match if at least 2 conditions from the group are present
    return matchCount >= 2;
  });
}

/**
 * Generates service recommendations for detected co-morbidity groups
 */
export function generateComorbidityRecommendations(
  detectedGroups: ComorbidityGroup[],
  budget: number
): {
  services: ServiceCategory[];
  specialConsiderations: string[];
  estimatedCost: number;
} {
  // Default empty result
  const result = {
    services: [] as ServiceCategory[],
    specialConsiderations: [] as string[],
    estimatedCost: 0
  };
  
  if (!detectedGroups || detectedGroups.length === 0) {
    return result;
  }
  
  // Collect all recommended services and special considerations
  const allServices: ServiceCategory[] = [];
  const allConsiderations: string[] = [];
  
  detectedGroups.forEach(group => {
    group.recommendedServices.forEach(service => {
      if (!allServices.includes(service)) {
        allServices.push(service);
      }
    });
    
    if (group.specialConsiderations) {
      group.specialConsiderations.forEach(consideration => {
        if (!allConsiderations.includes(consideration)) {
          allConsiderations.push(consideration);
        }
      });
    }
  });
  
  // Estimate cost based on number of services and budget
  const serviceCosts: Record<ServiceCategory, number> = {
    'physiotherapist': 600,
    'biokineticist': 550,
    'dietician': 500,
    'personal-trainer': 450,
    'pain-management': 700,
    'coaching': 400,
    'psychology': 800,
    'psychiatry': 1000,
    'podiatrist': 550,
    'general-practitioner': 600,
    'sport-physician': 800,
    'orthopedic-surgeon': 1200,
    'family-medicine': 550,
    'gastroenterology': 900,
    'massage-therapy': 350,
    'nutrition-coach': 400,
    'occupational-therapy': 500,
    'physical-therapy': 550,
    'chiropractor': 450,
    'nurse-practitioner': 400,
    'cardiology': 900,
    'dermatology': 700,
    'neurology': 850,
    'endocrinology': 800,
    'urology': 750,
    'oncology': 1100,
    'rheumatology': 750,
    'pediatrics': 600,
    'geriatrics': 650,
    'sports-medicine': 700,
    'internal-medicine': 700,
    'orthopedics': 900,
    'neurosurgery': 1500,
    'infectious-disease': 850,
    'plastic-surgery': 1400,
    'obstetrics-gynecology': 750,
    'emergency-medicine': 1000,
    'anesthesiology': 1100,
    'radiology': 800,
    'geriatric-medicine': 650,
    'all': 500
  };
  
  // Calculate estimated total cost (2 sessions per service)
  const estimatedCost = allServices.reduce(
    (total, service) => total + (serviceCosts[service] || 500) * 2,
    0
  );
  
  // If cost exceeds budget, prioritize services
  let finalServices = [...allServices];
  
  if (estimatedCost > budget && budget > 0) {
    // Sort services by priority for co-morbidity management
    const servicePriorities: Record<ServiceCategory, number> = {
      'physiotherapist': 5,
      'dietician': 4,
      'psychology': 4,
      'cardiology': 5,
      'endocrinology': 5,
      'personal-trainer': 3,
      'coaching': 2,
      'general-practitioner': 4
    } as Record<ServiceCategory, number>;
    
    // Sort services by priority (higher number = higher priority)
    finalServices.sort((a, b) => {
      const priorityA = servicePriorities[a] || 1;
      const priorityB = servicePriorities[b] || 1;
      return priorityB - priorityA;
    });
    
    // Keep adding services until we reach budget
    let runningCost = 0;
    finalServices = finalServices.filter(service => {
      const serviceCost = (serviceCosts[service] || 500) * 2;
      if (runningCost + serviceCost <= budget) {
        runningCost += serviceCost;
        return true;
      }
      return false;
    });
  }
  
  return {
    services: finalServices,
    specialConsiderations: allConsiderations,
    estimatedCost: Math.min(estimatedCost, budget || Infinity)
  };
}

/**
 * Checks for co-morbidities in a list of conditions
 * Returns an array of service categories that should be included
 */
export function checkCoMorbidities(conditions: string[] = []): ServiceCategory[] {
  // Default case if no conditions
  if (!conditions || conditions.length === 0) {
    return [];
  }
  
  // Normalize conditions for better matching
  const normalizedConditions = conditions.map(c => c.toLowerCase().trim());
  
  // Check for common condition pairs and return the recommended services
  
  // Knee pain + running/race preparation
  if (containsConditions(normalizedConditions, ['knee', 'pain']) &&
      containsConditions(normalizedConditions, ['run', 'race', 'marathon'])) {
    return ['physiotherapist', 'coaching', 'sport-physician'];
  }
  
  // Back pain + sedentary
  if (containsConditions(normalizedConditions, ['back', 'pain']) &&
      containsConditions(normalizedConditions, ['sitting', 'sedentary', 'desk'])) {
    return ['physiotherapist', 'biokineticist', 'occupational-therapy'];
  }
  
  // Anxiety + nutrition/diet
  if (containsConditions(normalizedConditions, ['anxiety', 'stress', 'depression']) &&
      containsConditions(normalizedConditions, ['diet', 'nutrition', 'eating', 'food'])) {
    return ['psychology', 'dietician', 'coaching'];
  }
  
  // Diabetes + weight management
  if (containsConditions(normalizedConditions, ['diabetes', 'blood sugar', 'insulin']) &&
      containsConditions(normalizedConditions, ['weight', 'obesity', 'BMI'])) {
    return ['endocrinology', 'dietician', 'personal-trainer'];
  }
  
  // Hypertension + stress
  if (containsConditions(normalizedConditions, ['hypertension', 'blood pressure', 'heart']) &&
      containsConditions(normalizedConditions, ['stress', 'anxiety', 'work'])) {
    return ['cardiology', 'psychology', 'coaching'];
  }
  
  // No specific co-morbidity detected
  return [];
}

/**
 * Helper function to check if an array contains any of the given terms
 */
function containsConditions(conditions: string[], terms: string[]): boolean {
  return conditions.some(condition => 
    terms.some(term => condition.includes(term))
  );
}
