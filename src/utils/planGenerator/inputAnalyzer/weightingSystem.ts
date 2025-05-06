
import { ServiceCategory } from "../types";

// Define types for weighting system
export type WeightFactor = {
  value: number;      // Base weight value
  multiplier: number; // How much this factor affects the final score
  reason?: string;    // Optional reason for logging/explanation
};

export type ConditionWeights = Record<string, WeightFactor>;

/**
 * Calculates weights for conditions based on various factors in the user input
 */
export function calculateConditionWeights(
  conditions: string[],
  inputText: string,
  timeframeDays?: number
): { conditionWeights: ConditionWeights; urgencyLevel: number } {
  const conditionWeights: ConditionWeights = {};
  let overallUrgencyLevel = 0;
  
  // Base weights for common conditions - adjusted based on medical urgency
  const baseWeights: Record<string, number> = {
    // Pain conditions (high urgency)
    'pain': 0.8,
    'back pain': 0.85,
    'knee pain': 0.8,
    'joint pain': 0.75,
    'chronic pain': 0.9,
    'headaches': 0.75,
    'migraine': 0.85,
    'injury': 0.85,
    
    // Mental health conditions (medium-high urgency)
    'anxiety': 0.75,
    'depression': 0.8,
    'stress': 0.7,
    'mental health': 0.75,
    'sleep issues': 0.65,
    
    // Digestive conditions (medium urgency)
    'stomach issues': 0.65,
    'digestive problems': 0.65,
    'gut health': 0.6,
    'bloating': 0.5,
    'constipation': 0.6,
    'diarrhea': 0.7,
    
    // Fitness goals (lower urgency, more preference based)
    'weight loss': 0.5,
    'fitness goals': 0.45,
    'muscle building': 0.45,
    'strength': 0.45,
    'endurance': 0.5,
    'race preparation': 0.65,
    'general health': 0.4,
    
    // Chronic conditions (high priority but varied urgency)
    'diabetes': 0.75,
    'hypertension': 0.7,
    'asthma': 0.7,
    'chronic fatigue': 0.65
  };
  
  // Initialize weights for all conditions
  conditions.forEach(condition => {
    let baseWeight = 0.5; // Default weight if not in our mapping
    
    // Get weight from our base weights if available
    if (baseWeights[condition.toLowerCase()]) {
      baseWeight = baseWeights[condition.toLowerCase()];
    }
    
    conditionWeights[condition] = {
      value: baseWeight,
      multiplier: 1.0,
      reason: `Base importance: ${baseWeight}`
    };
  });
  
  // Apply urgency modifiers based on text analysis
  const urgencyIndicators = [
    { terms: ['urgent', 'emergency', 'immediately', 'asap', 'right now', 'right away'], multiplier: 1.5, urgencyAdd: 0.9 },
    { terms: ['soon', 'quickly', 'fast', 'hurry', 'prompt'], multiplier: 1.3, urgencyAdd: 0.6 },
    { terms: ['getting worse', 'worsening', 'deteriorating', 'not improving'], multiplier: 1.4, urgencyAdd: 0.7 },
    { terms: ['severe', 'extreme', 'intense', 'terrible', 'unbearable', 'excruciating'], multiplier: 1.5, urgencyAdd: 0.8 },
    { terms: ['difficult', 'hard', 'struggle', 'challenging'], multiplier: 1.2, urgencyAdd: 0.5 },
    { terms: ['unable', 'cannot', 'can\'t', 'not able'], multiplier: 1.3, urgencyAdd: 0.6 }
  ];
  
  // Check for urgency indicators and apply multipliers
  urgencyIndicators.forEach(indicator => {
    indicator.terms.forEach(term => {
      if (inputText.toLowerCase().includes(term)) {
        // Apply to all pain or acute conditions
        conditions.forEach(condition => {
          if (conditionWeights[condition] && (
              condition.toLowerCase().includes('pain') || 
              condition.toLowerCase().includes('injury') || 
              condition.toLowerCase().includes('acute'))) {
            
            conditionWeights[condition].multiplier *= indicator.multiplier;
            conditionWeights[condition].reason = 
              (conditionWeights[condition].reason || '') + 
              ` + urgency factor (${term}): x${indicator.multiplier}`;
              
            console.log(`Applied urgency multiplier to ${condition} due to term "${term}"`);
          }
        });
        
        // Increase overall urgency level
        overallUrgencyLevel = Math.max(overallUrgencyLevel, indicator.urgencyAdd);
      }
    });
  });
  
  // Apply timeline-based modifiers
  if (timeframeDays !== undefined) {
    conditions.forEach(condition => {
      if (!conditionWeights[condition]) return;
      
      if (timeframeDays <= 7) {
        // Very short timeframe, high urgency for all conditions
        conditionWeights[condition].multiplier *= 1.4;
        conditionWeights[condition].reason += ' + very urgent timeline (within a week): x1.4';
        overallUrgencyLevel = Math.max(overallUrgencyLevel, 0.8);
      } else if (timeframeDays <= 30) {
        // Short timeframe, especially important for event preparation
        conditionWeights[condition].multiplier *= 1.2;
        conditionWeights[condition].reason += ' + urgent timeline (within a month): x1.2';
        overallUrgencyLevel = Math.max(overallUrgencyLevel, 0.6);
      } else if (timeframeDays <= 90) {
        // Medium timeframe
        if (condition.toLowerCase().includes('race') || 
            condition.toLowerCase().includes('event') || 
            condition.toLowerCase().includes('wedding')) {
          // Special bump for preparation events
          conditionWeights[condition].multiplier *= 1.3;
          conditionWeights[condition].reason += ' + event preparation (3 months): x1.3';
        }
      }
    });
  }
  
  // Apply intensity modifiers for specific condition mentions
  const conditionIntensityPhrases: Record<string, {terms: string[], multiplier: number}> = {
    'pain': {
      terms: ['severe pain', 'intense pain', 'unbearable pain', 'terrible pain', 'excruciating pain', 'worst pain'],
      multiplier: 1.5
    },
    'anxiety': {
      terms: ['severe anxiety', 'intense anxiety', 'panic attacks', 'debilitating anxiety', 'crippling anxiety'],
      multiplier: 1.5
    },
    'depression': {
      terms: ['severe depression', 'major depression', 'clinical depression', 'debilitating depression'],
      multiplier: 1.5
    },
    'digestive problems': {
      terms: ['severe digestive issues', 'chronic digestive problems', 'constant stomach pain'],
      multiplier: 1.4
    }
  };
  
  // Check for specific intensity phrases
  Object.entries(conditionIntensityPhrases).forEach(([condition, {terms, multiplier}]) => {
    terms.forEach(term => {
      if (inputText.toLowerCase().includes(term.toLowerCase())) {
        // Find the actual condition name used in the array that matches this category
        const matchingCondition = conditions.find(c => 
          c.toLowerCase().includes(condition.toLowerCase())
        );
        
        if (matchingCondition && conditionWeights[matchingCondition]) {
          conditionWeights[matchingCondition].multiplier *= multiplier;
          conditionWeights[matchingCondition].reason += 
            ` + intensity factor (${term}): x${multiplier}`;
            
          // Update overall urgency
          overallUrgencyLevel = Math.max(overallUrgencyLevel, 0.7);
          
          console.log(`Applied intensity multiplier to ${matchingCondition} due to term "${term}"`);
        }
      }
    });
  });
  
  // Apply impact modifiers - how the condition affects daily life
  const impactPhrases = [
    { terms: ['can\'t work', 'unable to work', 'missed work', 'affecting my job', 'affecting my work'], multiplier: 1.4 },
    { terms: ['can\'t sleep', 'unable to sleep', 'affecting my sleep', 'wakes me up'], multiplier: 1.3 },
    { terms: ['can\'t walk', 'trouble walking', 'difficulty moving', 'hard to move'], multiplier: 1.4 },
    { terms: ['can\'t exercise', 'unable to train', 'stopped training'], multiplier: 1.2 },
    { terms: ['affecting my life', 'quality of life', 'daily life', 'day to day'], multiplier: 1.3 },
    { terms: ['can\'t focus', 'trouble concentrating', 'difficulty focusing', 'brain fog'], multiplier: 1.2 }
  ];
  
  // Check for impact phrases
  impactPhrases.forEach(({terms, multiplier}) => {
    terms.forEach(term => {
      if (inputText.toLowerCase().includes(term.toLowerCase())) {
        // Apply to all conditions since this affects overall life quality
        conditions.forEach(condition => {
          if (conditionWeights[condition]) {
            conditionWeights[condition].multiplier *= multiplier;
            conditionWeights[condition].reason += 
              ` + life impact factor (${term}): x${multiplier}`;
              
            // Update overall urgency
            overallUrgencyLevel = Math.max(overallUrgencyLevel, 0.75);
            
            console.log(`Applied life impact multiplier to ${condition} due to term "${term}"`);
          }
        });
      }
    });
  });
  
  return { conditionWeights, urgencyLevel: overallUrgencyLevel };
}

/**
 * Converts condition weights to service priorities
 * This helps determine which services should be prioritized in the plan
 */
export function mapWeightsToServicePriorities(
  conditionWeights: ConditionWeights,
  urgencyLevel: number
): Record<ServiceCategory, number> {
  // Default priorities
  const servicePriorities: Partial<Record<ServiceCategory, number>> = {};
  
  // Condition to service mappings with urgency considerations
  const conditionServiceMappings: Record<string, {categories: ServiceCategory[], urgencyMultiplier: number}> = {
    // Pain conditions
    'pain': {
      categories: ['physiotherapist', 'pain-management'],
      urgencyMultiplier: 1.4
    },
    'back pain': {
      categories: ['physiotherapist', 'biokineticist', 'pain-management'],
      urgencyMultiplier: 1.3
    },
    'knee pain': {
      categories: ['physiotherapist', 'biokineticist', 'orthopedics'],
      urgencyMultiplier: 1.3
    },
    'headaches': {
      categories: ['neurology', 'pain-management', 'family-medicine'],
      urgencyMultiplier: 1.2
    },
    'injury': {
      categories: ['physiotherapist', 'orthopedics'],
      urgencyMultiplier: 1.5
    },
    
    // Mental health
    'anxiety': {
      categories: ['psychiatry', 'coaching', 'family-medicine'],
      urgencyMultiplier: 1.2
    },
    'depression': {
      categories: ['psychiatry', 'coaching', 'family-medicine'],
      urgencyMultiplier: 1.3
    },
    'stress': {
      categories: ['coaching', 'psychiatry'],
      urgencyMultiplier: 1.1
    },
    'sleep issues': {
      categories: ['psychiatry', 'family-medicine'],
      urgencyMultiplier: 1.1
    },
    
    // Digestive issues
    'stomach issues': {
      categories: ['gastroenterology', 'dietician', 'family-medicine'],
      urgencyMultiplier: 1.2
    },
    'digestive problems': {
      categories: ['gastroenterology', 'dietician', 'family-medicine'],
      urgencyMultiplier: 1.2
    },
    
    // Fitness goals
    'weight loss': {
      categories: ['dietician', 'personal-trainer', 'coaching'],
      urgencyMultiplier: 0.9
    },
    'fitness goals': {
      categories: ['personal-trainer', 'coaching', 'dietician'],
      urgencyMultiplier: 0.9
    },
    'race preparation': {
      categories: ['personal-trainer', 'coaching', 'physiotherapist'],
      urgencyMultiplier: 1.1
    },
    
    // Chronic conditions
    'diabetes': {
      categories: ['endocrinology', 'dietician', 'family-medicine'],
      urgencyMultiplier: 1.2
    },
    'hypertension': {
      categories: ['cardiology', 'family-medicine', 'dietician'],
      urgencyMultiplier: 1.2
    }
  };
  
  // Process each condition, calculate service weights
  Object.entries(conditionWeights).forEach(([condition, weight]) => {
    // Calculate final weight for this condition
    const finalWeight = weight.value * weight.multiplier;
    
    // Find relevant services for this condition
    let mappedServices: {categories: ServiceCategory[], urgencyMultiplier: number} | undefined;
    
    // Try direct match first
    if (conditionServiceMappings[condition.toLowerCase()]) {
      mappedServices = conditionServiceMappings[condition.toLowerCase()];
    } else {
      // Try partial match
      for (const [key, value] of Object.entries(conditionServiceMappings)) {
        if (condition.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(condition.toLowerCase())) {
          mappedServices = value;
          break;
        }
      }
    }
    
    // If we found matching services, add them to priorities
    if (mappedServices) {
      const urgencyAdjustedWeight = finalWeight * 
        (urgencyLevel > 0.7 ? mappedServices.urgencyMultiplier : 1.0);
      
      mappedServices.categories.forEach((category, index) => {
        // Primary categories get full weight, secondary get reduced
        const positionMultiplier = index === 0 ? 1.0 : index === 1 ? 0.9 : 0.8;
        const serviceWeight = urgencyAdjustedWeight * positionMultiplier;
        
        // Update service priority, taking the highest value if already set
        servicePriorities[category] = Math.max(
          servicePriorities[category] || 0,
          serviceWeight
        );
        
        console.log(`Set service priority for ${category} to ${serviceWeight.toFixed(2)} from condition ${condition}`);
      });
    } else {
      // Fallback for conditions without specific mappings
      console.log(`No specific service mapping found for condition: ${condition}`);
      
      // Add a default mapping to family medicine
      servicePriorities['family-medicine'] = Math.max(
        servicePriorities['family-medicine'] || 0,
        finalWeight * 0.8
      );
    }
  });
  
  // Normalize priorities to be between 0-1
  const maxPriority = Math.max(...Object.values(servicePriorities), 0.1);
  const normalizedPriorities: Partial<Record<ServiceCategory, number>> = {};
  
  Object.entries(servicePriorities).forEach(([service, priority]) => {
    normalizedPriorities[service as ServiceCategory] = priority / maxPriority;
  });
  
  return normalizedPriorities as Record<ServiceCategory, number>;
}

/**
 * Extracts a rough estimate of days until a mentioned event or deadline
 */
export function extractTimeframe(inputText: string): number | undefined {
  const inputLower = inputText.toLowerCase();
  
  // Check for explicit timeframes
  const timeExpressions = [
    { regex: /(\d+)\s*days?/i, multiplier: 1 },
    { regex: /(\d+)\s*weeks?/i, multiplier: 7 },
    { regex: /(\d+)\s*months?/i, multiplier: 30 },
    { regex: /next\s*week/i, value: 7 },
    { regex: /next\s*month/i, value: 30 },
    { regex: /couple\s*weeks?/i, value: 14 },
    { regex: /few\s*weeks?/i, value: 21 },
    { regex: /couple\s*days?/i, value: 2 },
    { regex: /few\s*days?/i, value: 3 },
    { regex: /tomorrow/i, value: 1 },
    { regex: /coming\s*weekend/i, value: 5 },
    { regex: /next\s*weekend/i, value: 7 },
    { regex: /in\s*a\s*week/i, value: 7 }
  ];
  
  // Try to find a match for time expressions
  for (const expr of timeExpressions) {
    const match = inputLower.match(expr.regex);
    
    if (match) {
      if ('value' in expr) {
        console.log(`Found timeframe: ${expr.value} days`);
        return expr.value;
      } else if (match[1]) {
        const value = parseInt(match[1]) * expr.multiplier;
        console.log(`Found timeframe: ${value} days (${match[1]} × ${expr.multiplier})`);
        return value;
      }
    }
  }
  
  // Check for event-based timeframes
  const eventPhrases = [
    { regex: /wedding\s*in\s*(\d+)\s*(weeks?|months?|days?)/i, defaultDays: 90 },
    { regex: /race\s*in\s*(\d+)\s*(weeks?|months?|days?)/i, defaultDays: 60 },
    { regex: /marathon\s*in\s*(\d+)\s*(weeks?|months?|days?)/i, defaultDays: 90 },
    { regex: /competition\s*in\s*(\d+)\s*(weeks?|months?|days?)/i, defaultDays: 60 },
    { regex: /event\s*in\s*(\d+)\s*(weeks?|months?|days?)/i, defaultDays: 30 },
    { regex: /vacation\s*in\s*(\d+)\s*(weeks?|months?|days?)/i, defaultDays: 30 },
    { regex: /trip\s*in\s*(\d+)\s*(weeks?|months?|days?)/i, defaultDays: 30 }
  ];
  
  // Try to find event-based timeframes
  for (const event of eventPhrases) {
    const match = inputLower.match(event.regex);
    
    if (match) {
      if (match[1] && match[2]) {
        // Calculate days based on the specified unit
        let multiplier = 1; // days
        if (match[2].startsWith('week')) multiplier = 7;
        if (match[2].startsWith('month')) multiplier = 30;
        
        const days = parseInt(match[1]) * multiplier;
        console.log(`Found event timeframe: ${days} days until ${match[0]}`);
        return days;
      } else {
        // Use default days for this event type
        console.log(`Found event with default timeframe: ${event.defaultDays} days`);
        return event.defaultDays;
      }
    }
  }
  
  // No explicit timeframe found
  return undefined;
}
