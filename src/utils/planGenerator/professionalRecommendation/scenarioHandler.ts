
/**
 * Scenario handler for specific health patterns
 * Detects common health scenarios and provides tailored recommendations
 */

import { ServiceCategory } from "../types";
import { logger } from "@/utils/cache";

export interface ScenarioResult {
  scenario: string;
  confidence: number;
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
 * 
 * @param userInput User input text describing health needs
 * @returns Scenario result if detected, or null if no specific scenario matched
 */
export function processHealthScenario(userInput: string): ScenarioResult | null {
  const inputLower = userInput.toLowerCase();
  
  // Common health scenarios with specific recommendations
  const scenarios: Array<{
    pattern: RegExp | string[];
    scenario: string;
    confidence: number;
    recommendations: ScenarioResult["recommendations"];
    mainIssue: string;
  }> = [
    {
      pattern: [/knee pain.+running/i, /running.+knee pain/i],
      scenario: "runner_knee_pain",
      confidence: 0.85,
      recommendations: {
        primaryProfessional: "physiotherapist",
        secondaryProfessional: "personal-trainer",
        supportingProfessionals: ["coaching"],
        rationale: "Knee pain in runners typically benefits from physiotherapy assessment and treatment, supported by corrective exercise from a personal trainer and running form coaching."
      },
      mainIssue: "Runner's knee pain"
    },
    {
      pattern: [/weight loss.+diabetes/i, /diabetes.+weight/i],
      scenario: "diabetes_weight_management",
      confidence: 0.9,
      recommendations: {
        primaryProfessional: "dietician",
        secondaryProfessional: "endocrinology",
        supportingProfessionals: ["personal-trainer"],
        rationale: "Managing diabetes through weight loss requires dietary intervention first, medical supervision, and structured exercise for optimal results."
      },
      mainIssue: "Diabetes weight management"
    },
    {
      pattern: [/back pain.+(desk|sitting|work)/i, /(desk|sitting|work).+back pain/i],
      scenario: "desk_worker_back_pain",
      confidence: 0.85,
      recommendations: {
        primaryProfessional: "physiotherapist",
        secondaryProfessional: "biokineticist",
        supportingProfessionals: ["personal-trainer"],
        rationale: "Desk-related back pain typically requires physiotherapy assessment, ergonomic adjustments, and a specialized exercise program."
      },
      mainIssue: "Desk-related back pain"
    },
    {
      pattern: [/stress.+(anxiety|depression)/i, /(anxiety|depression).+stress/i],
      scenario: "stress_mental_health",
      confidence: 0.85,
      recommendations: {
        primaryProfessional: "psychiatry",
        secondaryProfessional: "coaching",
        supportingProfessionals: ["personal-trainer"],
        rationale: "Stress combined with anxiety or depression often benefits from professional mental health support, complemented by coaching and physical activity."
      },
      mainIssue: "Stress and mental health"
    },
    {
      pattern: [/marathon.+training/i, /training.+marathon/i, /half marathon/i],
      scenario: "marathon_training",
      confidence: 0.9,
      recommendations: {
        primaryProfessional: "coaching",
        secondaryProfessional: "personal-trainer",
        supportingProfessionals: ["dietician", "physiotherapist"],
        rationale: "Marathon training requires specialized running coaching, strength training support, nutritional guidance, and injury prevention."
      },
      mainIssue: "Marathon training preparation"
    }
  ];

  // Check for specific health scenarios
  for (const scenario of scenarios) {
    let matched = false;
    
    if (Array.isArray(scenario.pattern)) {
      // Check multiple patterns
      matched = scenario.pattern.some(pattern => {
        if (pattern instanceof RegExp) {
          return pattern.test(inputLower);
        } else {
          return inputLower.includes(pattern);
        }
      });
    } else {
      // Single pattern
      matched = scenario.pattern.test(inputLower);
    }
    
    if (matched) {
      logger.debug(`Matched health scenario: ${scenario.scenario}`);
      return {
        scenario: scenario.scenario,
        confidence: scenario.confidence,
        recommendations: scenario.recommendations,
        mainIssue: scenario.mainIssue
      };
    }
  }
  
  // No specific scenario matched
  return null;
}
