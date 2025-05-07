
import { ServiceCategory } from "../types";
import { ProfessionalRecommendation, CategoryRecommendation } from "./types";
import { identifySymptoms } from "../symptomDetector";
import { matchPractitionersToNeeds } from "../categoryMatcher";
import { calculateSeverityScores, extractLocationDetails } from "../inputAnalyzer/weightingSystem";
import { extractBudget } from "../inputAnalyzer/budgetExtractor";
import { extractGoals } from "./goalExtractor";
import { calculateIdealSessions } from "./sessionCalculator";
import { calculateBudget, detectBudgetConstraint, baseCosts } from "./budgetEstimator";
import { determineIdealTiming } from "./timingRecommender";
import { generateRecommendationNotes, generatePreferredTraits } from "./notesGenerator";

/**
 * Generates comprehensive professional recommendations based on user input
 * @param userInput Text input from the user describing their needs
 * @returns Array of professional recommendations with scores and details
 */
export function generateProfessionalRecommendations(
  userInput: string
): ProfessionalRecommendation[] {
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
  const hasBudgetConstraint = detectBudgetConstraint(userInput, budget);
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
      const conditionSeverity = primaryCondition ? (severityScores[primaryCondition] || 0.5) : 0.5;
      const idealSessions = calculateIdealSessions(category, conditionSeverity);
      
      // Use base cost or default to 600
      const sessionCost = baseCosts[category] || 600;
      const estimatedBudget = calculateBudget(category, idealSessions);
      
      // Determine ideal timing
      const idealTiming = determineIdealTiming(category, conditionSeverity);
      
      // Generate recommendation notes
      const notes = generateRecommendationNotes(
        category,
        primaryCondition,
        conditionSeverity,
        goals,
        hasBudgetConstraint,
        sessionCost
      );
      
      // Preferred traits for professionals
      const preferredTraits = generatePreferredTraits(primaryCondition, goals);
      
      return {
        category,
        score,
        primaryCondition,
        idealSessions,
        estimatedBudget,
        idealTiming,
        severity: conditionSeverity,
        notes,
        preferredTraits
      };
    });
  
  return recommendations;
}
