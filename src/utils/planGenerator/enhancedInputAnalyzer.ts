
import { ServiceCategory } from "./types";
import { CONDITION_TO_SERVICES } from "./serviceMappings";
import { analyzeUserInput } from "./inputAnalyzer";
import { CO_MORBIDITY_MAPPINGS } from "./serviceMappings";
import { detectProfessionalPhrases } from "./professionalPhraseData";
import { extractGoals } from "./professionalRecommendation/goalExtractor";

/**
 * Enhanced version of user input analyzer with more comprehensive analysis
 */
export function enhancedAnalyzeUserInput(input: string) {
  const baseAnalysis = analyzeUserInput(input);
  
  // Override base analysis with more specific information
  const inputLower = input.toLowerCase();
  
  // Use the new detailed phrase detection
  const detectedProfessionals = detectProfessionalPhrases(inputLower);
  
  // Add professionals detected from comprehensive phrase analysis
  detectedProfessionals.forEach(detection => {
    if (!baseAnalysis.suggestedCategories.includes(detection.category)) {
      baseAnalysis.suggestedCategories.push(detection.category);
      console.log(`Added professional category from phrase detection: ${detection.category}`);
    }
  });
  
  // Extract more specific health goals
  const specificGoals = extractGoals(input);
  
  // Determine primary issue (most important condition/goal)
  let primaryIssue = determinePrimaryIssue(baseAnalysis.medicalConditions, specificGoals, input);
  
  // Calculate service priorities based on detected conditions and phrases
  const servicePriorities: Record<string, number> = {};
  
  // Set priorities based on professional phrase matches
  detectedProfessionals.forEach(detection => {
    servicePriorities[detection.category] = Math.min(0.5 + (detection.count * 0.1), 1.0);
  });
  
  // Analyze if we have enough information for a proper plan
  const hasEnoughInformation = baseAnalysis.suggestedCategories.length > 0 || 
                              baseAnalysis.medicalConditions.length > 0;
  
  // Extract location information properly
  const locationInfo = {
    location: baseAnalysis.location,
    isRemote: baseAnalysis.preferOnline || false
  };
  
  // Return enhanced analysis
  return {
    ...baseAnalysis,
    primaryIssue,
    hasEnoughInformation,
    locationInfo,
    specificGoals,
    servicePriorities,
    // Add optional empty arrays for properties that might not exist
    contraindicated: [] // Add empty array for contraindicated services
  };
}

/**
 * Check for co-morbidities (multiple conditions that together require special care)
 */
export function checkCoMorbidities(conditions: string[]): string[] {
  if (!conditions || conditions.length < 2) return [];
  
  const additionalServices: string[] = [];
  
  // Check each co-morbidity group
  Object.values(CO_MORBIDITY_MAPPINGS).forEach(mapping => {
    // Check if all conditions in this group are present
    const hasAllConditions = mapping.conditions.every(condition => 
      conditions.some(userCondition => 
        userCondition.toLowerCase().includes(condition.toLowerCase())
      )
    );
    
    if (hasAllConditions) {
      mapping.additionalServices.forEach(service => {
        if (!additionalServices.includes(service)) {
          additionalServices.push(service);
          console.log(`Added ${service} due to co-morbidity: ${mapping.conditions.join(', ')}`);
        }
      });
    }
  });
  
  return additionalServices;
}

/**
 * Determine the primary health issue from conditions and goals
 */
function determinePrimaryIssue(
  conditions: string[], 
  goals: string[], 
  input: string
): string {
  // Check for explicitly mentioned priorities
  const priorityPhrases = [
    { regex: /main(ly| concern| issue| problem)? is/i, bonus: 5 },
    { regex: /primarily|mostly|especially|particularly/i, bonus: 3 },
    { regex: /focus(ed)? on/i, bonus: 4 },
    { regex: /most important/i, bonus: 5 }
  ];
  
  // Score each condition and goal
  const issueScores: Record<string, number> = {};
  
  // Score conditions
  conditions.forEach(condition => {
    let score = 1;
    
    // Check for condition specific mentions
    if (input.toLowerCase().includes(condition.toLowerCase())) {
      score += 2;
      
      // Check for priority phrases near this condition
      priorityPhrases.forEach(phrase => {
        const phrasePos = input.toLowerCase().search(phrase.regex);
        if (phrasePos >= 0) {
          // Check if this phrase is close to the condition mention
          const conditionPos = input.toLowerCase().indexOf(condition.toLowerCase());
          if (Math.abs(phrasePos - conditionPos) < 50) {
            score += phrase.bonus;
          }
        }
      });
    }
    
    issueScores[condition] = score;
  });
  
  // Score goals
  goals.forEach(goal => {
    let score = 0.5; // Goals start with lower base score than conditions
    
    // Check for goal specific mentions
    if (input.toLowerCase().includes(goal.toLowerCase())) {
      score += 1;
      
      // Check for priority phrases near this goal
      priorityPhrases.forEach(phrase => {
        const phrasePos = input.toLowerCase().search(phrase.regex);
        if (phrasePos >= 0) {
          // Check if this phrase is close to the goal mention
          const goalPos = input.toLowerCase().indexOf(goal.toLowerCase());
          if (Math.abs(phrasePos - goalPos) < 50) {
            score += phrase.bonus;
          }
        }
      });
    }
    
    issueScores[goal] = score;
  });
  
  // Find highest scoring issue
  let highestScore = 0;
  let primaryIssue = conditions[0] || goals[0] || "general health";
  
  Object.entries(issueScores).forEach(([issue, score]) => {
    if (score > highestScore) {
      highestScore = score;
      primaryIssue = issue;
    }
  });
  
  return primaryIssue;
}
