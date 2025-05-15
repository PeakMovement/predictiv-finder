
/**
 * Scenario handler for specific health patterns
 * Detects common health scenarios and provides tailored recommendations
 */

import { ServiceCategory } from "../types";
import { logger } from "@/utils/cache";

export interface ScenarioResult {
  scenario: string;
  confidence: number;
  recommendedServices: ServiceCategory[];
  description: string;
  // Add these properties to fix the type errors
  recommendations: {
    primaryProfessional: ServiceCategory;
    secondaryProfessional?: ServiceCategory;
    supportingProfessionals: ServiceCategory[];
    rationale: string;
  };
  mainIssue: string;
}

/**
 * Process user input to detect specific health scenarios
 * @param userInput User's description of their health needs
 * @returns Scenario result if a match is found, otherwise null
 */
export function processHealthScenario(userInput: string): ScenarioResult | null {
  const inputLower = userInput.toLowerCase();
  
  // Define common health scenarios with their patterns and recommended services
  const scenarios = [
    {
      name: "Running Injury",
      patterns: [
        "running injury",
        "injured while running",
        "hurt myself running",
        "pain when running"
      ],
      services: ["physiotherapist", "coaching"] as ServiceCategory[],
      description: "Recovery and rehabilitation plan for running-related injuries"
    },
    {
      name: "Weight Management",
      patterns: [
        "lose weight",
        "weight loss journey",
        "need to shed kilos",
        "diet plan to lose weight",
        "weight management"
      ],
      services: ["dietician", "personal-trainer"] as ServiceCategory[],
      description: "Personalized weight management program combining nutrition and exercise"
    },
    {
      name: "Back Pain Recovery",
      patterns: [
        "back pain",
        "lower back issues",
        "back problems",
        "spine pain",
        "back hurts"
      ],
      services: ["physiotherapist", "biokineticist"] as ServiceCategory[],
      description: "Comprehensive back pain management and rehabilitation program"
    },
    {
      name: "Marathon Preparation",
      patterns: [
        "train for marathon",
        "marathon preparation",
        "marathon training",
        "preparing for a marathon",
        "marathon help"
      ],
      services: ["coaching", "personal-trainer", "dietician"] as ServiceCategory[],
      description: "Complete marathon training support including nutrition and conditioning"
    },
    {
      name: "Digestive Health",
      patterns: [
        "stomach problems",
        "digestive issues",
        "gut health",
        "ibs symptoms",
        "food sensitivities"
      ],
      services: ["gastroenterology", "dietician"] as ServiceCategory[],
      description: "Comprehensive digestive health management and dietary support"
    }
  ];
  
  // Check for matching scenarios
  for (const scenario of scenarios) {
    for (const pattern of scenario.patterns) {
      if (inputLower.includes(pattern)) {
        logger.debug(`Matched health scenario: ${scenario.name}`);
        return {
          scenario: scenario.name,
          confidence: 0.85,
          recommendedServices: scenario.services,
          description: scenario.description,
          // Add these properties to make it compatible with the updated interface
          recommendations: {
            primaryProfessional: scenario.services[0],
            secondaryProfessional: scenario.services.length > 1 ? scenario.services[1] : undefined,
            supportingProfessionals: scenario.services.slice(2),
            rationale: `${scenario.name} typically requires ${scenario.services.join(", ")}`
          },
          mainIssue: scenario.name
        };
      }
    }
  }
  
  // If no precise match, check for partial matches
  for (const scenario of scenarios) {
    for (const pattern of scenario.patterns) {
      const words = pattern.split(' ');
      const matchCount = words.filter(word => inputLower.includes(word)).length;
      
      if (matchCount >= 2 && words.length >= 2) {
        logger.debug(`Partial match for health scenario: ${scenario.name}`);
        return {
          scenario: scenario.name,
          confidence: 0.7,
          recommendedServices: scenario.services,
          description: scenario.description,
          // Add these properties to make it compatible with the updated interface
          recommendations: {
            primaryProfessional: scenario.services[0],
            secondaryProfessional: scenario.services.length > 1 ? scenario.services[1] : undefined,
            supportingProfessionals: scenario.services.slice(2),
            rationale: `${scenario.name} typically requires ${scenario.services.join(", ")}`
          },
          mainIssue: scenario.name
        };
      }
    }
  }
  
  return null;
}
