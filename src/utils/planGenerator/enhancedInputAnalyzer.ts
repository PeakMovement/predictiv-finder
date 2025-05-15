
import { ServiceCategory } from "./types";
import { detectProfessionalMentions } from "./inputAnalyzer/professionalMentions";
import { findAllServicesByKeyword } from "./professionalKeywords";
import { CO_MORBIDITY_MAPPINGS } from "./serviceMappings";

/**
 * Enhanced user input analyzer with advanced keyword detection
 * @param userInput User text describing their health needs
 * @returns Detailed analysis of user input
 */
export function enhancedAnalyzeUserInput(userInput: string) {
  const inputLower = userInput.toLowerCase();
  
  // Detect professional mentions with our enhanced detection system
  const professionalMentions = detectProfessionalMentions(inputLower);
  
  // Build suggested categories from professional mentions
  const suggestedCategories = professionalMentions.map(mention => mention.serviceCategory);
  
  // Extract potential medical conditions from the text
  const medicalConditions = extractMedicalConditions(inputLower);
  
  // Determine primary issue
  const primaryIssue = determinePrimaryIssue(inputLower, medicalConditions, professionalMentions);
  
  // Extract budget information
  const budget = extractBudget(inputLower);
  
  // Extract specific goals
  const specificGoals = extractSpecificGoals(inputLower);
  
  // Extract location preferences
  const locationInfo = extractLocationInfo(inputLower);
  
  // Determine service priorities based on detection confidence
  const servicePriorities: Record<string, number> = {};
  professionalMentions.forEach(mention => {
    servicePriorities[mention.serviceCategory] = mention.confidence;
  });
  
  // Determine if we have enough information for recommendations
  const hasEnoughInformation = 
    (medicalConditions.length > 0 || suggestedCategories.length > 0 || specificGoals.length > 0);
  
  console.log("Enhanced analysis results:", {
    suggestedCategories,
    medicalConditions,
    primaryIssue,
    budget,
    specificGoals,
    hasEnoughInformation
  });
  
  return {
    suggestedCategories,
    medicalConditions,
    primaryIssue,
    budget,
    hasEnoughInformation,
    locationInfo,
    specificGoals,
    servicePriorities
  };
}

/**
 * Check for co-morbidities (multiple conditions that interact)
 * @param conditions Array of detected medical conditions
 * @returns Array of additional services needed for co-morbidities
 */
export function checkCoMorbidities(conditions: string[]): ServiceCategory[] {
  if (conditions.length < 2) return [];
  
  const additionalServices: ServiceCategory[] = [];
  
  // Check each co-morbidity mapping
  Object.values(CO_MORBIDITY_MAPPINGS).forEach(mapping => {
    // Check if all required conditions are present
    const hasAllConditions = mapping.conditions.every(condition =>
      conditions.some(c => c.toLowerCase().includes(condition.toLowerCase()))
    );
    
    if (hasAllConditions) {
      // Add the recommended additional services
      mapping.additionalServices.forEach(service => {
        if (!additionalServices.includes(service)) {
          additionalServices.push(service);
        }
      });
    }
  });
  
  return additionalServices;
}

/**
 * Extract medical conditions from user input
 */
function extractMedicalConditions(inputLower: string): string[] {
  const conditions = new Set<string>();
  
  // Common medical condition keywords
  const conditionKeywords = [
    "pain", "injury", "strain", "sprain", "diabetes", "hypertension",
    "back pain", "knee pain", "shoulder pain", "anxiety", "depression",
    "stress", "insomnia", "overweight", "arthritis", "asthma", "fatigue"
  ];
  
  // Check for condition keywords
  conditionKeywords.forEach(keyword => {
    if (inputLower.includes(keyword.toLowerCase())) {
      conditions.add(keyword);
    }
  });
  
  // Check for specific body part + pain combinations
  const bodyParts = ["back", "knee", "shoulder", "neck", "hip", "ankle", "wrist", "elbow"];
  bodyParts.forEach(part => {
    if (inputLower.includes(`${part} pain`) || 
        inputLower.includes(`${part} injury`) || 
        inputLower.includes(`${part} problem`)) {
      conditions.add(`${part} pain`);
    }
  });
  
  return Array.from(conditions);
}

/**
 * Determine the primary health issue from the input
 */
function determinePrimaryIssue(
  inputLower: string, 
  conditions: string[], 
  professionalMentions: Array<{serviceCategory: ServiceCategory, confidence: number}>
): string {
  // If we have conditions, use the most prominently mentioned one
  if (conditions.length > 0) {
    // Simple algorithm: condition mentioned first or most often is likely primary
    const conditionCounts = conditions.map(condition => ({
      condition,
      firstIndex: inputLower.indexOf(condition.toLowerCase()),
      count: (inputLower.match(new RegExp(condition.toLowerCase(), 'g')) || []).length
    }));
    
    // Sort by first appearance, then by count
    conditionCounts.sort((a, b) => {
      if (a.firstIndex !== b.firstIndex) {
        return a.firstIndex - b.firstIndex; // Earlier mention comes first
      }
      return b.count - a.count; // More mentions come first
    });
    
    if (conditionCounts.length > 0) {
      return conditionCounts[0].condition;
    }
  }
  
  // If no conditions but we have professional mentions, infer from highest confidence
  if (professionalMentions.length > 0) {
    const highestConfidenceMention = professionalMentions.sort((a, b) => 
      b.confidence - a.confidence
    )[0];
    
    // Map professional to general issue
    const professionalToIssue: Partial<Record<ServiceCategory, string>> = {
      "physiotherapist": "Pain or mobility issue",
      "biokineticist": "Movement or rehabilitation need",
      "coaching": "Performance or fitness goals",
      "dietician": "Nutrition or diet concerns",
      "personal-trainer": "Fitness or strength goals",
      "family-medicine": "General health concern",
      "psychiatry": "Mental health concern"
    };
    
    return professionalToIssue[highestConfidenceMention.serviceCategory] || "Health optimization";
  }
  
  // Default
  return "General health concerns";
}

/**
 * Extract budget information from user input
 */
function extractBudget(inputLower: string): number | undefined {
  const budgetMatches = inputLower.match(/r\s*(\d+)/i) || 
                         inputLower.match(/pay\s*r?\s*(\d+)/i) || 
                         inputLower.match(/budget.*?(\d+)/i) ||
                         inputLower.match(/afford.*?(\d+)/i) ||
                         inputLower.match(/spend.*?(\d+)/i);
  
  if (budgetMatches && budgetMatches[1]) {
    const amount = parseInt(budgetMatches[1], 10);
    return amount;
  }
  
  // Check for budget constraints even with no specific amount
  const budgetTerms = [
    'low budget', 'tight budget', 'limited budget', 'cheap', 'affordable', 
    'low cost', "can't afford", 'budget constraint'
  ];
  
  if (budgetTerms.some(term => inputLower.includes(term))) {
    // Return a modest default budget
    return 1000;
  }
  
  return undefined;
}

/**
 * Extract specific goals from user input
 */
function extractSpecificGoals(inputLower: string): string[] {
  const goals = new Set<string>();
  
  // Check for weight loss goals
  const weightLossMatch = inputLower.match(/lose\s+(\d+)\s*(kg|kgs|pounds|lbs)/i);
  if (weightLossMatch) {
    goals.add(`Lose ${weightLossMatch[1]} ${weightLossMatch[2]}`);
  } else if (inputLower.includes("lose weight") || inputLower.includes("weight loss")) {
    goals.add("Weight loss");
  }
  
  // Check for fitness goals
  if (inputLower.includes("get fit") || inputLower.includes("fitness")) {
    goals.add("Improve fitness");
  }
  
  // Check for strength goals
  if (inputLower.includes("stronger") || inputLower.includes("build muscle") || 
      inputLower.includes("strength")) {
    goals.add("Build strength");
  }
  
  // Check for pain management goals
  if (inputLower.includes("pain") && (
      inputLower.includes("manage") || inputLower.includes("relief") || 
      inputLower.includes("reduce") || inputLower.includes("help with")
  )) {
    goals.add("Pain management");
  }
  
  // Check for running/race goals
  const raceMatch = inputLower.match(/(5k|10k|half marathon|marathon|race)/i);
  if (raceMatch) {
    goals.add(`${raceMatch[1]} preparation`);
  }
  
  return Array.from(goals);
}

/**
 * Extract location information from user input
 */
function extractLocationInfo(inputLower: string): { location?: string; isRemote: boolean } {
  // Check for remote preferences
  const remoteTerms = ['online', 'virtual', 'remote', 'zoom', 'video'];
  const isRemote = remoteTerms.some(term => inputLower.includes(term));
  
  // Try to extract location
  let location: string | undefined = undefined;
  
  const locationMatches = inputLower.match(/\bin\s+([a-z\s]+?)(?:\s+and|\s+or|\s+but|\.|\,|\s+with|\s+for|\s+to|\s+from|\s+$)/i);
  if (locationMatches && locationMatches[1]) {
    const possibleLocation = locationMatches[1].trim();
    // Filter out common non-location phrases
    const nonLocationPhrases = ['general', 'particular', 'specific', 'the area', 'mind', 'my experience'];
    if (!nonLocationPhrases.some(phrase => possibleLocation.includes(phrase))) {
      location = possibleLocation;
    }
  }
  
  return {
    location,
    isRemote
  };
}
