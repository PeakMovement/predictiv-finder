
/**
 * Health scenario handling module
 * Manages the processing of specific health scenarios
 */

import { ServiceCategory } from "../types";
import { logger } from "@/utils/cache";
import { ProfessionalRecommendationResult } from "./types";

/**
 * Scenario result type definition
 */
export interface ScenarioResult {
  recommendations: {
    primaryProfessional: ServiceCategory;
    secondaryProfessional?: ServiceCategory;
    supportingProfessionals: ServiceCategory[];
    rationale: string;
  };
  mainIssue: string;
}

/**
 * Process common health scenarios with specialized logic
 * @param symptoms Array of detected symptoms
 * @param goals User's health goals
 * @param userInput Original user input text
 * @returns Scenario result or null if no specific scenario matches
 */
export function processSpecificScenario(
  symptoms: string[],
  goals: string[],
  userInput: string
): ScenarioResult | null {
  const input = userInput.toLowerCase();
  
  // Check for post-surgery recovery
  if (input.includes("surgery") && (input.includes("recovery") || input.includes("recovering"))) {
    return handlePostSurgeryScenario(input, symptoms);
  }
  
  // Check for sports injury
  if ((input.includes("sport") || input.includes("running") || input.includes("athlete")) && 
      (input.includes("injury") || input.includes("pain"))) {
    return handleSportsInjuryScenario(input, symptoms);
  }
  
  // Check for chronic condition management
  if (input.includes("chronic") || input.includes("long-term") || input.includes("ongoing")) {
    return handleChronicConditionScenario(input, symptoms);
  }
  
  // Check for mental health focus
  const mentalHealthTerms = ["anxiety", "depression", "stress", "mental health", "burnout"];
  if (mentalHealthTerms.some(term => input.includes(term))) {
    return handleMentalHealthScenario(input);
  }
  
  // No specific scenario detected
  return null;
}

/**
 * Handle post-surgery recovery scenario
 */
function handlePostSurgeryScenario(input: string, symptoms: string[]): ScenarioResult {
  // Determine surgery type
  let surgeryType = "general";
  if (input.includes("knee")) surgeryType = "knee";
  if (input.includes("hip")) surgeryType = "hip";
  if (input.includes("back") || input.includes("spine")) surgeryType = "spinal";
  if (input.includes("heart")) surgeryType = "cardiac";
  
  // Set primary recommendation based on surgery type
  let primaryProfessional: ServiceCategory = "physiotherapist";
  let secondaryProfessional: ServiceCategory | undefined = undefined;
  let supportingProfessionals: ServiceCategory[] = [];
  let rationale = `Recovery plan for ${surgeryType} surgery`;
  
  switch (surgeryType) {
    case "knee":
    case "hip":
      primaryProfessional = "physiotherapist";
      secondaryProfessional = "orthopedics";
      supportingProfessionals = ["biokineticist"];
      break;
    case "spinal":
      primaryProfessional = "physiotherapist";
      secondaryProfessional = "pain-management";
      supportingProfessionals = ["biokineticist"];
      break;
    case "cardiac":
      primaryProfessional = "cardiology";
      secondaryProfessional = "physiotherapist";
      supportingProfessionals = ["dietician"];
      rationale = "Cardiac rehabilitation program";
      break;
    default:
      primaryProfessional = "physiotherapist";
      supportingProfessionals = ["family-medicine"];
      rationale = "Post-surgery recovery and rehabilitation program";
  }
  
  return {
    recommendations: {
      primaryProfessional,
      secondaryProfessional,
      supportingProfessionals,
      rationale
    },
    mainIssue: `${surgeryType} surgery recovery`
  };
}

/**
 * Handle sports injury scenario
 */
function handleSportsInjuryScenario(input: string, symptoms: string[]): ScenarioResult {
  let injuryType = "general";
  let mainIssue = "sports injury";
  
  // Determine injury type
  if (input.includes("knee")) {
    injuryType = "knee";
    mainIssue = "knee injury";
  } else if (input.includes("ankle") || input.includes("sprain")) {
    injuryType = "ankle";
    mainIssue = "ankle injury";
  } else if (input.includes("shoulder")) {
    injuryType = "shoulder";
    mainIssue = "shoulder injury";
  } else if (input.includes("back")) {
    injuryType = "back";
    mainIssue = "back injury";
  }
  
  // Common treatment approach for sports injuries
  const primaryProfessional: ServiceCategory = "physiotherapist";
  let secondaryProfessional: ServiceCategory | undefined = "biokineticist";
  let supportingProfessionals: ServiceCategory[] = ["personal-trainer"];
  
  if (injuryType === "back") {
    secondaryProfessional = "orthopedics";
  }
  
  return {
    recommendations: {
      primaryProfessional,
      secondaryProfessional,
      supportingProfessionals,
      rationale: `Specialized treatment plan for ${mainIssue} rehabilitation and return to sports`
    },
    mainIssue
  };
}

/**
 * Handle chronic condition scenario
 */
function handleChronicConditionScenario(input: string, symptoms: string[]): ScenarioResult {
  let condition = "chronic condition";
  let primaryProfessional: ServiceCategory = "family-medicine";
  let secondaryProfessional: ServiceCategory | undefined;
  let supportingProfessionals: ServiceCategory[] = [];
  
  // Detect specific chronic conditions
  if (input.includes("diabetes")) {
    condition = "diabetes";
    primaryProfessional = "endocrinology";
    secondaryProfessional = "dietician";
    supportingProfessionals = ["coaching", "family-medicine"];
  } else if (input.includes("arthritis")) {
    condition = "arthritis";
    primaryProfessional = "rheumatology";
    secondaryProfessional = "physiotherapist";
    supportingProfessionals = ["pain-management"];
  } else if (input.includes("asthma")) {
    condition = "asthma";
    primaryProfessional = "pulmonology";
    supportingProfessionals = ["family-medicine"];
  } else if (input.includes("migraine") || input.includes("headache")) {
    condition = "migraines";
    primaryProfessional = "neurology";
    secondaryProfessional = "pain-management";
  } else if (input.includes("ibs") || input.includes("bowel") || input.includes("digestive")) {
    condition = "digestive condition";
    primaryProfessional = "gastroenterology";
    secondaryProfessional = "dietician";
  } else {
    // General chronic condition
    primaryProfessional = "family-medicine";
    supportingProfessionals = ["coaching"];
  }
  
  return {
    recommendations: {
      primaryProfessional,
      secondaryProfessional,
      supportingProfessionals,
      rationale: `Comprehensive management plan for ${condition}`
    },
    mainIssue: condition
  };
}

/**
 * Handle mental health scenario
 */
function handleMentalHealthScenario(input: string): ScenarioResult {
  let condition = "mental health concerns";
  let primaryProfessional: ServiceCategory = "psychiatry";
  let secondaryProfessional: ServiceCategory | undefined = "coaching";
  let supportingProfessionals: ServiceCategory[] = [];
  
  // Detect specific mental health conditions
  if (input.includes("anxiety")) {
    condition = "anxiety";
    supportingProfessionals = ["family-medicine"];
  } else if (input.includes("depression")) {
    condition = "depression";
    secondaryProfessional = "psychiatry";
    primaryProfessional = "family-medicine";
    supportingProfessionals = ["coaching"];
  } else if (input.includes("stress")) {
    condition = "stress management";
    primaryProfessional = "coaching";
    secondaryProfessional = "psychiatry";
    supportingProfessionals = ["personal-trainer"];
  } else if (input.includes("burnout")) {
    condition = "burnout";
    primaryProfessional = "psychiatry";
    secondaryProfessional = "coaching";
    supportingProfessionals = ["dietician"];
  }
  
  return {
    recommendations: {
      primaryProfessional,
      secondaryProfessional,
      supportingProfessionals,
      rationale: `Supportive care plan for ${condition}`
    },
    mainIssue: condition
  };
}

/**
 * Convert a scenario result to a professional recommendation result
 */
export function convertScenarioToRecommendation(scenario: ScenarioResult): ProfessionalRecommendationResult {
  const { recommendations, mainIssue } = scenario;
  
  // Build the response structure
  const result: ProfessionalRecommendationResult = {
    primaryRecommendations: [{
      category: recommendations.primaryProfessional,
      sessions: 4,
      priority: 'high',
      reasoning: recommendations.rationale
    }],
    notes: [recommendations.rationale]
  };
  
  // Add secondary professional if present
  if (recommendations.secondaryProfessional) {
    result.primaryRecommendations.push({
      category: recommendations.secondaryProfessional,
      sessions: 3,
      priority: 'medium',
      reasoning: recommendations.rationale
    });
  }
  
  // Add complementary recommendations
  if (recommendations.supportingProfessionals.length > 0) {
    result.complementaryRecommendations = recommendations.supportingProfessionals.map(category => ({
      category,
      sessions: 2,
      reasoning: "Supporting professional for your condition"
    }));
  }
  
  return result;
}
