
import { ServiceCategory } from "../types";

/**
 * Structure for scenario detection results
 */
interface ScenarioResult {
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
 * Common health scenarios for quick matching
 */
const COMMON_SCENARIOS = [
  {
    name: "desk worker posture pain",
    keyPhrases: ["desk", "sit", "sitting", "computer", "neck pain", "shoulder pain", "posture"],
    mainIssue: "desk-related posture issues",
    primaryProfessional: "physiotherapist" as ServiceCategory,
    secondaryProfessional: "biokineticist" as ServiceCategory,
    supportingProfessionals: ["personal-trainer" as ServiceCategory],
    rationale: "Address postural issues first, then develop exercise program to maintain improvements"
  },
  {
    name: "weight loss after injury",
    keyPhrases: ["weight gain", "injury", "overweight", "can't exercise", "diet", "lost fitness"],
    mainIssue: "weight management with injury limitations",
    primaryProfessional: "dietician" as ServiceCategory,
    secondaryProfessional: "physiotherapist" as ServiceCategory,
    supportingProfessionals: ["personal-trainer" as ServiceCategory],
    rationale: "Manage nutrition while rehabilitating injury before returning to exercise"
  },
  {
    name: "digestive issues",
    keyPhrases: ["bloating", "digestive", "gut health", "stomach", "tired", "energy", "food sensitivities"],
    mainIssue: "digestive health optimization",
    primaryProfessional: "dietician" as ServiceCategory,
    secondaryProfessional: "gastroenterology" as ServiceCategory,
    supportingProfessionals: [],
    rationale: "Dietary interventions to improve gut function and energy levels"
  },
  {
    name: "runner with pain",
    keyPhrases: ["running", "marathon", "race", "calf pain", "shin splints", "knee pain", "training"],
    mainIssue: "running-related injuries",
    primaryProfessional: "physiotherapist" as ServiceCategory,
    secondaryProfessional: "biokineticist" as ServiceCategory,
    supportingProfessionals: ["coaching" as ServiceCategory],
    rationale: "Treat pain first, then address biomechanics and training program"
  },
  {
    name: "postpartum recovery",
    keyPhrases: ["birth", "baby", "postpartum", "diastasis", "pelvic floor", "core", "pregnancy"],
    mainIssue: "postpartum rehabilitation",
    primaryProfessional: "physiotherapist" as ServiceCategory,
    secondaryProfessional: "personal-trainer" as ServiceCategory,
    supportingProfessionals: [],
    rationale: "Specialized postpartum rehabilitation before returning to general fitness"
  }
];

/**
 * Process user input to check if it matches a common health scenario
 * @param userInput User's query text
 * @returns Scenario result if matched with high confidence, undefined otherwise
 */
export function processHealthScenario(userInput: string): ScenarioResult | undefined {
  const input = userInput.toLowerCase();
  
  // Check each scenario for matches
  for (const scenario of COMMON_SCENARIOS) {
    let matchCount = 0;
    
    // Count how many key phrases match
    for (const phrase of scenario.keyPhrases) {
      if (input.includes(phrase.toLowerCase())) {
        matchCount++;
      }
    }
    
    // Calculate confidence based on percentage of matching phrases
    const confidence = matchCount / scenario.keyPhrases.length;
    
    // If confidence is high enough, return the scenario match
    if (confidence >= 0.4) {
      return {
        scenario: scenario.name,
        confidence,
        recommendations: {
          primaryProfessional: scenario.primaryProfessional,
          secondaryProfessional: scenario.secondaryProfessional,
          supportingProfessionals: scenario.supportingProfessionals,
          rationale: scenario.rationale
        },
        mainIssue: scenario.mainIssue
      };
    }
  }
  
  return undefined;
}
