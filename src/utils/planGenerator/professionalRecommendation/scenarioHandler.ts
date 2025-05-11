
import { ServiceCategory } from "../types";
import { extractBudget } from "../inputAnalyzer/budgetExtractor";

/**
 * Common health scenarios that may need special handling
 */
export enum HealthScenario {
  DESK_WORKER_NECK_PAIN = "desk-worker-neck-pain",
  WEIGHT_GAIN_AFTER_INJURY = "weight-gain-after-injury",
  DIGESTIVE_ISSUES = "digestive-issues",
  RUNNING_CALF_PAIN = "running-calf-pain",
  POSTPARTUM_RECOVERY = "postpartum-recovery"
}

/**
 * Scenario detection result
 */
interface ScenarioDetectionResult {
  detectedScenario?: HealthScenario;
  confidence: number;
  mainIssue?: string;
  secondaryIssues: string[];
}

/**
 * Scenario-specific professional recommendations
 */
interface ScenarioRecommendation {
  primaryProfessional: ServiceCategory;
  secondaryProfessional?: ServiceCategory;
  supportingProfessionals: ServiceCategory[];
  rationale: string;
}

/**
 * Detects common health scenarios from user input
 * 
 * @param userInput User's query text
 * @returns Scenario detection result
 */
export function detectHealthScenario(userInput: string): ScenarioDetectionResult {
  const input = userInput.toLowerCase();
  const result: ScenarioDetectionResult = {
    confidence: 0,
    secondaryIssues: []
  };
  
  // Desk worker with neck/shoulder pain
  if ((input.includes("desk") || input.includes("sit") || input.includes("computer")) && 
      (input.includes("neck pain") || input.includes("shoulder pain"))) {
    
    result.detectedScenario = HealthScenario.DESK_WORKER_NECK_PAIN;
    result.mainIssue = "neck and shoulder pain from desk work";
    result.confidence = 0.85;
    
    if (input.includes("posture")) {
      result.confidence += 0.1;
      result.secondaryIssues.push("posture problems");
    }
    
    if (input.includes("exercise")) {
      result.secondaryIssues.push("needs exercise guidance");
    }
  }
  
  // Weight gain after injury
  else if (input.includes("weight") && 
           (input.includes("gain") || input.includes("gained")) && 
           input.includes("injury")) {
    
    result.detectedScenario = HealthScenario.WEIGHT_GAIN_AFTER_INJURY;
    result.mainIssue = "weight gain following injury";
    result.confidence = 0.8;
    
    if (input.includes("knee")) {
      result.confidence += 0.1;
      result.secondaryIssues.push("knee injury");
    }
    
    if (input.includes("strength") || input.includes("rebuild")) {
      result.secondaryIssues.push("needs strength rebuilding");
    }
  }
  
  // Digestive issues
  else if ((input.includes("bloat") || input.includes("digest") || input.includes("stomach")) && 
           (input.includes("dietician") || input.includes("nutrition"))) {
    
    result.detectedScenario = HealthScenario.DIGESTIVE_ISSUES;
    result.mainIssue = "digestive issues";
    result.confidence = 0.8;
    
    if (input.includes("energy") || input.includes("tired") || input.includes("fatigue")) {
      result.confidence += 0.1;
      result.secondaryIssues.push("low energy");
    }
    
    if (input.includes("gut")) {
      result.confidence += 0.05;
      result.secondaryIssues.push("gut health concerns");
    }
  }
  
  // Running with calf/back pain
  else if (input.includes("run") && 
           (input.includes("calf") || input.includes("back")) && 
           (input.includes("pain") || input.includes("stiff"))) {
    
    result.detectedScenario = HealthScenario.RUNNING_CALF_PAIN;
    result.mainIssue = "running-related musculoskeletal pain";
    result.confidence = 0.85;
    
    if (input.includes("training")) {
      result.confidence += 0.05;
      result.secondaryIssues.push("training program");
    }
    
    if (input.includes("10k") || input.includes("race")) {
      result.confidence += 0.1;
      result.secondaryIssues.push("race preparation");
    }
  }
  
  // Postpartum recovery
  else if ((input.includes("birth") || input.includes("postpartum")) && 
           (input.includes("core") || input.includes("back") || input.includes("pain"))) {
    
    result.detectedScenario = HealthScenario.POSTPARTUM_RECOVERY;
    result.mainIssue = "postpartum recovery";
    result.confidence = 0.9;
    
    if (input.includes("core weakness") || input.includes("weak core")) {
      result.confidence += 0.05;
      result.secondaryIssues.push("core weakness");
    }
    
    if (input.includes("fitness") || input.includes("return to")) {
      result.secondaryIssues.push("return to fitness");
    }
  }
  
  return result;
}

/**
 * Gets scenario-specific professional recommendations
 * 
 * @param scenario Detected health scenario
 * @param budget Optional budget constraint
 * @returns Professional recommendations optimized for the scenario
 */
export function getScenarioRecommendations(
  scenario: HealthScenario,
  budget?: number
): ScenarioRecommendation {
  switch (scenario) {
    case HealthScenario.DESK_WORKER_NECK_PAIN:
      // Desk worker with neck/shoulder pain - Physiotherapist primary
      return {
        primaryProfessional: 'physiotherapist',
        secondaryProfessional: 'biokineticist',
        supportingProfessionals: ['personal-trainer'],
        rationale: "Neck and shoulder pain from desk work primarily requires physiotherapy intervention for pain management and postural correction. A biokineticist can provide specialized exercise programs to address underlying weaknesses. A personal trainer can help maintain proper form during general fitness activities."
      };
      
    case HealthScenario.WEIGHT_GAIN_AFTER_INJURY:
      // Weight gain after injury - Dietician primary, with physiotherapy support
      return {
        primaryProfessional: 'dietician',
        secondaryProfessional: 'physiotherapist',
        supportingProfessionals: ['personal-trainer'],
        rationale: "Weight gain following injury requires a dual approach: dietary guidance from a dietician to manage nutrition and weight, plus rehabilitation from a physiotherapist to address the injury. A personal trainer can help with safe exercise progression once the injury is sufficiently rehabilitated."
      };
      
    case HealthScenario.DIGESTIVE_ISSUES:
      // Digestive issues - Dietician primary, with possible gastroenterology referral
      return budget && budget < 1300 ? {
        primaryProfessional: 'dietician',
        supportingProfessionals: ['family-medicine'],
        rationale: "Digestive issues with fatigue can often be addressed through dietary interventions. For lower budgets, starting with a dietician is most cost-effective, with a possible general practitioner consultation if issues persist."
      } : {
        primaryProfessional: 'dietician',
        secondaryProfessional: 'gastroenterology',
        supportingProfessionals: [],
        rationale: "Digestive issues with fatigue may require both dietary interventions and medical assessment. A dietician can address nutritional factors impacting gut health, while a gastroenterology consultation can rule out underlying medical conditions."
      };
      
    case HealthScenario.RUNNING_CALF_PAIN:
      // Running with calf/back pain - Physio primary, with coaching support
      return {
        primaryProfessional: 'physiotherapist',
        secondaryProfessional: 'biokineticist',
        supportingProfessionals: ['coaching'],
        rationale: "Running-related calf and back pain requires physiotherapy as the primary intervention to address pain and biomechanical issues. A biokineticist can analyze running form and develop corrective exercise programs. Run coaching provides training structure that accounts for the physical limitations."
      };
      
    case HealthScenario.POSTPARTUM_RECOVERY:
      // Postpartum recovery - Women's health physio primary
      return {
        primaryProfessional: 'physiotherapist',
        secondaryProfessional: 'personal-trainer',
        supportingProfessionals: [],
        rationale: "Postpartum recovery with core weakness and back pain requires specialized physiotherapy intervention from a women's health physiotherapist. Once initial rehabilitation is complete, a personal trainer with postnatal certification can help progress fitness safely."
      };
      
    default:
      // Default recommendation if no specific scenario is matched
      return {
        primaryProfessional: 'family-medicine',
        supportingProfessionals: [],
        rationale: "When no specific scenario is clearly matched, a general practitioner assessment is recommended as a starting point to guide further specialized care."
      };
  }
}

/**
 * Processes user input to identify health scenarios and make targeted professional recommendations
 * 
 * @param userInput User's query text
 * @returns Professional recommendations with rationales or null if no scenario matched
 */
export function processHealthScenario(userInput: string): {
  recommendations: ScenarioRecommendation;
  scenario: HealthScenario;
  confidence: number;
  mainIssue: string;
  secondaryIssues: string[];
} | null {
  // Detect scenario
  const detectionResult = detectHealthScenario(userInput);
  
  // If we didn't detect a specific scenario or confidence is low, return null
  if (!detectionResult.detectedScenario || detectionResult.confidence < 0.7) {
    return null;
  }
  
  // Extract budget if present
  const budget = extractBudget(userInput);
  
  // Get recommendations for the scenario
  const recommendations = getScenarioRecommendations(
    detectionResult.detectedScenario, 
    budget
  );
  
  return {
    recommendations,
    scenario: detectionResult.detectedScenario,
    confidence: detectionResult.confidence,
    mainIssue: detectionResult.mainIssue || "",
    secondaryIssues: detectionResult.secondaryIssues
  };
}
