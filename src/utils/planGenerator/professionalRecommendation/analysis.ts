
/**
 * Functions for analyzing user input and generating recommendations
 */

import { ServiceCategory } from "../types";
import { ProfessionalRecommendation, CategoryRecommendation } from "./types";
import { identifySymptoms } from "../symptomDetector";
import { extractGoals } from "./goalExtractor";
import { calculateSeverityScores, extractLocationDetails } from "../inputAnalyzer/weightingSystem";
import { extractBudget } from "../inputAnalyzer/budgetExtractor";
import { processHealthScenario } from "./scenarioHandler";
import { logger } from "@/utils/cache";

export interface SymptomAnalysisResult {
  symptoms: string[];
  priorities: Record<string, number>;
  contraindications: ServiceCategory[];
}

// Fix the TypeScript error by making location optional in the interface
export interface LocationAnalysis {
  location?: string;
  isRemote: boolean;
}

export interface BudgetAnalysis {
  budget: number | undefined;
  hasBudgetConstraint: boolean;
}

/**
 * Analyzes user input to extract key health information
 */
export function analyzeUserHealth(userInput: string) {
  logger.debug("Analyzing user health information from input:", userInput);
  
  try {
    // Check for specific health scenarios first
    const scenarioResult = processHealthScenario(userInput);
    if (scenarioResult && scenarioResult.confidence > 0.8) {
      logger.debug("Detected specific health scenario:", scenarioResult.scenario);
      return { scenarioResult, isSpecificScenario: true };
    }
    
    // If no specific scenario matched, continue with standard analysis
    logger.debug("No specific health scenario detected, proceeding with standard analysis.");
    
    // Extract conditions and symptoms with error handling
    let symptomAnalysisResult: SymptomAnalysisResult;
    try {
      symptomAnalysisResult = identifySymptoms(userInput);
    } catch (error) {
      logger.error("Error identifying symptoms:", error);
      throw new Error("Failed to analyze health symptoms. Please try different wording.");
    }
    
    const { symptoms, priorities, contraindications } = symptomAnalysisResult;
    logger.debug("Identified symptoms:", symptoms);
    logger.debug("Contraindicated services:", contraindications);
    
    if (symptoms.length === 0) {
      logger.warn("No symptoms identified from input");
    }
    
    // Extract goals with error handling
    let goals;
    try {
      goals = extractGoals(userInput);
    } catch (error) {
      logger.error("Error extracting goals:", error);
      goals = [];
    }
    logger.debug("Extracted goals:", goals);
    
    // Calculate severity scores for each condition with error handling
    let severityScores;
    try {
      severityScores = calculateSeverityScores(symptoms, userInput);
    } catch (error) {
      logger.error("Error calculating severity scores:", error);
      severityScores = symptoms.reduce((acc, symptom) => {
        acc[symptom] = 0.5; // Default medium severity
        return acc;
      }, {} as Record<string, number>);
    }
    logger.debug("Severity scores:", severityScores);
    
    // Extract location and online preference with error handling
    let locationInfo: LocationAnalysis;
    try {
      locationInfo = extractLocationDetails(userInput);
    } catch (error) {
      logger.error("Error extracting location details:", error);
      locationInfo = { location: undefined, isRemote: false };
    }
    logger.debug("Location info:", locationInfo);
    
    // Extract budget information with error handling
    let budget;
    let hasBudgetConstraint;
    try {
      budget = extractBudget(userInput);
      hasBudgetConstraint = budget !== undefined;
    } catch (error) {
      logger.error("Error extracting budget information:", error);
      budget = undefined;
      hasBudgetConstraint = false;
    }
    logger.debug("Budget info:", { budget, hasBudgetConstraint });
    
    return {
      symptoms,
      priorities,
      contraindications,
      goals,
      severityScores,
      locationInfo,
      budget,
      hasBudgetConstraint,
      isSpecificScenario: false
    };
  } catch (error) {
    logger.error("Error in analyzeUserHealth:", error);
    throw error;
  }
}
