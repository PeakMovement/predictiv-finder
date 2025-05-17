
import { ServiceCategory } from "../types";
import { ScenarioResult } from "./types";

/**
 * Process user input to detect if it matches a specific health scenario
 * @param userInput User's query text
 * @returns ScenarioResult if a scenario is detected, null otherwise
 */
export function processHealthScenario(userInput: string): ScenarioResult | null {
  const normalizedInput = userInput.toLowerCase();
  
  // Check for common health scenarios
  const scenarios = [
    {
      name: "Marathon Training",
      keywords: ["marathon", "half-marathon", "training plan", "running program", "race preparation"],
      primaryProfessional: "coaching" as ServiceCategory,
      secondaryProfessional: "physiotherapist" as ServiceCategory,
      supportingProfessionals: ["nutrition-coaching", "biokineticist"] as ServiceCategory[],
      rationale: "A running coach will develop your training plan, supported by physiotherapy for injury prevention."
    },
    {
      name: "Post Surgery Recovery",
      keywords: ["surgery recovery", "post-op", "after surgery", "surgical recovery", "operation recovery"],
      primaryProfessional: "physiotherapist" as ServiceCategory,
      secondaryProfessional: "biokineticist" as ServiceCategory,
      supportingProfessionals: ["general-practitioner"] as ServiceCategory[],
      rationale: "Physiotherapy is essential for post-surgical rehabilitation, with biokineticist support for functional training."
    },
    {
      name: "Weight Loss Journey",
      keywords: ["weight loss", "lose weight", "diet plan", "slimming", "fat loss"],
      primaryProfessional: "dietician" as ServiceCategory,
      secondaryProfessional: "personal-trainer" as ServiceCategory,
      supportingProfessionals: ["psychology", "nutrition-coaching"] as ServiceCategory[],
      rationale: "A dietician will create a sustainable nutrition plan, with personal training for exercise guidance."
    },
    {
      name: "Chronic Pain Management",
      keywords: ["chronic pain", "persistent pain", "long-term pain", "pain management", "ongoing pain"],
      primaryProfessional: "pain-management" as ServiceCategory,
      secondaryProfessional: "physiotherapist" as ServiceCategory,
      supportingProfessionals: ["psychology", "general-practitioner"] as ServiceCategory[],
      rationale: "Specialized pain management services combined with physiotherapy and psychological support."
    },
    {
      name: "Sports Performance",
      keywords: ["performance improvement", "athletic performance", "sports enhancement", "competitive athlete", "performance boost"],
      primaryProfessional: "biokineticist" as ServiceCategory,
      secondaryProfessional: "sport-physician" as ServiceCategory,
      supportingProfessionals: ["nutrition-coaching", "personal-trainer"] as ServiceCategory[],
      rationale: "A biokineticist will optimize your movement patterns, supported by sport-specific medical oversight."
    },
    {
      name: "Mental Wellness",
      keywords: ["anxiety", "depression", "stress", "mental health", "psychological", "emotional wellbeing"],
      primaryProfessional: "psychology" as ServiceCategory,
      secondaryProfessional: "psychiatry" as ServiceCategory,
      supportingProfessionals: ["coaching"] as ServiceCategory[],
      rationale: "Psychological counseling provides techniques for managing mental health challenges."
    }
  ];
  
  // Check each scenario for matches
  for (const scenario of scenarios) {
    const matchCount = scenario.keywords.filter(keyword => 
      normalizedInput.includes(keyword.toLowerCase())
    ).length;
    
    const matchRatio = matchCount / scenario.keywords.length;
    
    // If we have a strong match, return the scenario
    if (matchRatio > 0.3 || matchCount >= 2) {
      return {
        scenarioName: scenario.name,
        confidence: Math.min(matchRatio + 0.3, 0.95),
        mainIssue: scenario.name,
        recommendations: {
          primaryProfessional: scenario.primaryProfessional,
          secondaryProfessional: scenario.secondaryProfessional,
          supportingProfessionals: scenario.supportingProfessionals,
          rationale: scenario.rationale
        }
      };
    }
  }
  
  return null; // No specific scenario detected
}
