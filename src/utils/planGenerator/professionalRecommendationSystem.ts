import { ServiceCategory } from "./types";
import { identifySymptoms } from "./symptomDetector";
import { matchPractitionersToNeeds, scoreProfessionalMatch } from "./categoryMatcher";
import { calculateSeverityScores, extractLocationDetails } from "./inputAnalyzer/weightingSystem";
import { extractBudget, detectBudgetConstraints } from "./inputAnalyzer/budgetExtractor";

export interface ProfessionalRecommendation {
  category: ServiceCategory;
  score: number;
  primaryCondition?: string;
  idealSessions: number;
  estimatedBudget: number;
  idealTiming: string;
  severity: number;
  notes: string[];
  preferredTraits?: string[];
}

/**
 * Extracts specific goals from user input
 * @param input User input text
 * @returns Array of identified goals
 */
function extractGoals(input: string): string[] {
  const inputLower = input.toLowerCase();
  const goals: string[] = [];
  
  // Goal patterns to detect
  const goalPatterns = [
    { regex: /run(?:ning)?\s+(?:a\s+)?(marathon|race|5k|10k|half|ultra)/i, goal: 'running' },
    { regex: /(?:lose|losing)\s+weight/i, goal: 'weight' },
    { regex: /(?:build|building|gain|gaining)\s+(?:muscle|strength)/i, goal: 'strength' },
    { regex: /training\s+for/i, goal: 'training' },
    { regex: /get(?:ting)?\s+fit(?:ter)?/i, goal: 'fitness' },
    { regex: /improve\s+(?:my\s+)?(?:health|wellness)/i, goal: 'health' },
    { regex: /(?:handle|managing|deal\s+with|reduce)\s+stress/i, goal: 'stress' },
    { regex: /(?:more|better|improve)\s+energy/i, goal: 'energy' },
    { regex: /(?:fix|improve|better)\s+(?:my\s+)?(?:diet|nutrition|eating)/i, goal: 'nutrition' },
    { regex: /(?:recover|recovery|rehab|rehabilitation)/i, goal: 'recovery' }
  ];
  
  // Check for matches
  goalPatterns.forEach(pattern => {
    if (pattern.regex.test(inputLower)) {
      goals.push(pattern.goal);
    }
  });
  
  // Special case for race preparation
  if (/race|marathon|5k|10k|half|event/i.test(inputLower)) {
    goals.push('race');
  }
  
  return goals;
}

/**
 * Generates comprehensive professional recommendations based on user input
 * @param userInput Text input from the user describing their needs
 * @returns Array of professional recommendations with scores and details
 */
export const generateProfessionalRecommendations = (
  userInput: string
): ProfessionalRecommendation[] => {
  console.log("Generating professional recommendations for input:", userInput);
  
  // Extract conditions and symptoms
  const { symptoms, priorities, contraindications } = identifySymptoms(userInput);
  console.log("Identified symptoms:", symptoms);
  console.log("Contraindicated services:", contraindications);
  
  // Extract goals
  const goals = extractGoals(userInput);
  console.log("Extracted goals:", goals);
  
  // Calculate severity scores for each condition
  const severityScores = calculateSeverityScores(symptoms, userInput);
  console.log("Severity scores:", severityScores);
  
  // Extract location and online preference
  const { location, isRemote } = extractLocationDetails(userInput);
  console.log("Location info:", { location, isRemote });
  
  // Extract budget information
  const budget = extractBudget(userInput);
  const hasBudgetConstraint = detectBudgetConstraints(userInput) || 
                             (budget !== undefined && budget < 1500);
  console.log("Budget info:", { budget, hasBudgetConstraint });
  
  // Match practitioners to needs
  const rankedCategories = matchPractitionersToNeeds(
    symptoms,
    severityScores,
    goals,
    location,
    isRemote,
    hasBudgetConstraint
  );
  
  console.log("Ranked professional categories:", rankedCategories);
  
  // Convert to detailed recommendations
  const recommendations: ProfessionalRecommendation[] = rankedCategories
    .filter(rc => !contraindications.includes(rc.category)) // Filter out contraindicated services
    .map(rankedCategory => {
      const { category, score, primaryCondition } = rankedCategory;
      
      // Calculate ideal number of sessions based on severity and professional type
      let idealSessions = 1; // Default
      const conditionSeverity = primaryCondition ? (severityScores[primaryCondition] || 0.5) : 0.5;
      
      if (conditionSeverity > 0.7) {
        // High severity conditions need more sessions
        if (['physiotherapist', 'personal-trainer', 'psychiatry'].includes(category)) {
          idealSessions = 4;
        } else if (['dietician', 'family-medicine', 'coaching'].includes(category)) {
          idealSessions = 2;
        } else {
          idealSessions = 3;
        }
      } else if (conditionSeverity > 0.4) {
        // Medium severity
        if (['physiotherapist', 'personal-trainer'].includes(category)) {
          idealSessions = 3;
        } else {
          idealSessions = 2;
        }
      } else {
        // Low severity
        if (['personal-trainer', 'coaching'].includes(category)) {
          idealSessions = 2;
        } else {
          idealSessions = 1;
        }
      }
      
      // Estimate budget based on professional type - Changed to Partial<Record> to fix TypeScript error
      const baseCosts: Partial<Record<ServiceCategory, number>> = {
        'dietician': 500,
        'personal-trainer': 350,
        'physiotherapist': 600,
        'coaching': 450,
        'family-medicine': 500,
        'biokineticist': 550,
        'psychiatry': 900,
        'cardiology': 1000,
        'gastroenterology': 900,
        'orthopedics': 900,
        'neurology': 1000,
        'pain-management': 750,
        'endocrinology': 800,
        'dermatology': 700
      };
      
      // Use base cost or default to 600
      const sessionCost = baseCosts[category] || 600;
      const estimatedBudget = sessionCost * idealSessions;
      
      // Determine ideal timing
      let idealTiming: string;
      if (conditionSeverity > 0.8) {
        idealTiming = "Immediate (within 1 week)";
      } else if (conditionSeverity > 0.6) {
        idealTiming = "Soon (1-2 weeks)";
      } else if (['cardiology', 'neurology', 'psychiatry', 'gastroenterology'].includes(category)) {
        idealTiming = "Within 3-4 weeks";
      } else {
        idealTiming = "Flexible (within 4-6 weeks)";
      }
      
      // Generate recommendation notes
      const notes: string[] = [];
      
      if (primaryCondition) {
        notes.push(`Recommended for ${primaryCondition}`);
      }
      
      if (conditionSeverity > 0.7) {
        notes.push("High priority based on condition severity");
      }
      
      if (goals.includes('race') && ['personal-trainer', 'coaching', 'physiotherapist'].includes(category)) {
        notes.push("Will help with race preparation");
      }
      
      if (hasBudgetConstraint && sessionCost > 600) {
        notes.push("Consider fewer sessions to accommodate budget");
      }
      
      // Preferred traits for professionals
      const preferredTraits: string[] = [];
      
      if (primaryCondition === 'knee pain') {
        preferredTraits.push('knee specialists', 'sports injuries');
      } else if (primaryCondition === 'back pain') {
        preferredTraits.push('spine specialists', 'posture correction');
      } else if (goals.includes('race')) {
        preferredTraits.push('running specialist', 'race preparation');
      } else if (primaryCondition === 'weight loss') {
        preferredTraits.push('weight management', 'body transformation');
      }
      
      return {
        category,
        score,
        primaryCondition,
        idealSessions,
        estimatedBudget,
        idealTiming,
        severity: conditionSeverity,
        notes,
        preferredTraits: preferredTraits.length > 0 ? preferredTraits : undefined
      };
    });
  
  return recommendations;
};
