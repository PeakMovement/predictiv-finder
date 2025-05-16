
import { ServiceCategory } from "./types";
import { analyzeUserInput } from "./inputAnalyzer";
import { detectBudgetConstraints, isBudgetMajorConcern, applyBudgetAwareSelection } from "./detectors/budgetDetector";
import { detectUserProblems } from "./detectors/userProblemDetector";
import { analyzeGoalComprehensively } from "./professionalRecommendation/enhancedGoalAnalyzer";
import { detectSpecialCase } from "./detectors/specialCaseDetector";

export interface EnhancedAnalysisResult {
  medicalConditions: string[];
  primaryIssue?: string;
  secondaryIssues?: string[];
  suggestedCategories: string[];
  budget?: number;
  isBudgetConstrained: boolean;
  location?: string;
  preferOnline?: boolean;
  urgency: 'low' | 'medium' | 'high';
  complexity: number;
  requiredSpecialists: ServiceCategory[];
  contraindications: ServiceCategory[];
  recommendedApproaches: string[];
  detectedProblems: {
    problem: string;
    confidence: number;
    severity: 'mild' | 'moderate' | 'severe';
  }[];
}

/**
 * Enhanced user input analysis that combines multiple detection strategies
 * for more accurate and comprehensive health plan generation
 * 
 * @param userInput Raw text input from the user
 * @returns Detailed analysis of user needs and constraints
 */
export function enhancedAnalyzeUserInput(userInput: string): EnhancedAnalysisResult {
  console.log("Running enhanced input analyzer on:", userInput);
  const inputLower = userInput.toLowerCase();
  
  // Initialize result structure
  const result: EnhancedAnalysisResult = {
    medicalConditions: [],
    suggestedCategories: [],
    isBudgetConstrained: false,
    urgency: 'low',
    complexity: 0.5,
    requiredSpecialists: [],
    contraindications: [],
    recommendedApproaches: [],
    detectedProblems: []
  };
  
  // Run the base analyzer for backward compatibility
  const baseAnalysis = analyzeUserInput(userInput);
  
  // Get the deep goal analysis
  const goalAnalysis = analyzeGoalComprehensively(userInput);
  
  // Detect user problems with the specialized detector
  const detectedProblems = detectUserProblems(userInput);
  
  // Check for special cases (emergency, chronic, etc.)
  const specialCase = detectSpecialCase(userInput);
  
  // Detect budget constraints
  const detectedBudget = detectBudgetConstraints(inputLower, result.contraindications);
  const isBudgetConcern = isBudgetMajorConcern(inputLower);
  
  // Process the base analysis
  if (baseAnalysis.medicalConditions && baseAnalysis.medicalConditions.length > 0) {
    result.medicalConditions = baseAnalysis.medicalConditions;
  }
  
  if (baseAnalysis.budget) {
    result.budget = baseAnalysis.budget;
    result.isBudgetConstrained = true;
  } else if (detectedBudget) {
    result.budget = detectedBudget;
    result.isBudgetConstrained = true;
  } else if (isBudgetConcern) {
    // Default conservative budget when it's a concern but no specific amount
    result.budget = 1500;
    result.isBudgetConstrained = true;
  }
  
  // Process location and preference info
  result.location = baseAnalysis.location;
  result.preferOnline = baseAnalysis.preferOnline;
  
  // Process goal analysis
  if (goalAnalysis.primaryGoal) {
    result.primaryIssue = goalAnalysis.primaryGoal;
  }
  
  if (goalAnalysis.secondaryGoals && goalAnalysis.secondaryGoals.length > 0) {
    result.secondaryIssues = goalAnalysis.secondaryGoals;
  }
  
  result.urgency = goalAnalysis.urgency;
  
  // Process detected problems
  if (detectedProblems.length > 0) {
    // Add problems to the result
    result.detectedProblems = detectedProblems.map(p => ({
      problem: p.problem,
      confidence: p.confidence,
      severity: p.severity
    }));
    
    // If we don't have a primary issue yet, use the highest confidence problem
    if (!result.primaryIssue && detectedProblems[0]) {
      result.primaryIssue = detectedProblems[0].problem;
    }
    
    // Add all detected medical conditions
    detectedProblems.forEach(p => {
      // Extract the base problem without the category prefix
      const problemParts = p.problem.split(': ');
      const baseProblem = problemParts.length > 1 ? problemParts[1] : problemParts[0];
      
      if (!result.medicalConditions.includes(baseProblem)) {
        result.medicalConditions.push(baseProblem);
      }
    });
    
    // Collect suggested approaches
    detectedProblems.forEach(p => {
      if (p.suggestedApproach && !result.recommendedApproaches.includes(p.suggestedApproach)) {
        result.recommendedApproaches.push(p.suggestedApproach);
      }
    });
    
    // Calculate complexity based on number and severity of problems
    const severityMap = { 'mild': 0.3, 'moderate': 0.6, 'severe': 0.9 };
    const complexityScore = detectedProblems.reduce((sum, p) => 
      sum + p.confidence * (severityMap[p.severity] || 0.5), 0);
    
    result.complexity = Math.min(1, complexityScore / 2);
  }
  
  // Process special case detection
  if (specialCase) {
    // Add any special case services
    specialCase.requiredServices.forEach(service => {
      if (!result.requiredSpecialists.includes(service)) {
        result.requiredSpecialists.push(service);
      }
    });
    
    // Update urgency if the special case is urgent
    if (specialCase.urgencyLevel > 0.7) {
      result.urgency = 'high';
    } else if (specialCase.urgencyLevel > 0.4) {
      result.urgency = 'medium';
    }
    
    // Use the special case budget if available
    if (specialCase.budget && !result.budget) {
      result.budget = specialCase.budget.recommended;
      result.isBudgetConstrained = true;
    }
  }
  
  // Collect service categories from all sources
  const serviceSet = new Set<ServiceCategory>();
  
  // Add services from base analysis
  if (baseAnalysis.suggestedCategories) {
    baseAnalysis.suggestedCategories.forEach(service => 
      serviceSet.add(service as ServiceCategory));
  }
  
  // Add services from detected problems
  detectedProblems.forEach(problem => {
    problem.relatedCategories.forEach(service => serviceSet.add(service));
  });
  
  // Add required specialists
  result.requiredSpecialists.forEach(service => serviceSet.add(service));
  
  // Apply budget-aware selection if budget is constrained
  if (result.budget && result.isBudgetConstrained) {
    const { prioritizedServices } = applyBudgetAwareSelection(
      result.budget,
      Array.from(serviceSet)
    );
    
    // Use the budget-optimized services
    result.suggestedCategories = prioritizedServices;
  } else {
    // Use all collected services
    result.suggestedCategories = Array.from(serviceSet);
  }
  
  // Filter out contraindicated services
  result.suggestedCategories = result.suggestedCategories.filter(
    service => !result.contraindications.includes(service as ServiceCategory)
  );
  
  console.log("Enhanced analysis result:", result);
  return result;
}

/**
 * Detect co-morbid conditions that require coordinated care
 * @param conditions Array of detected health conditions 
 * @returns Additional service categories needed
 */
export function checkCoMorbidities(conditions: string[]): ServiceCategory[] {
  if (conditions.length <= 1) return [];
  
  const additionalServices: Set<ServiceCategory> = new Set();
  
  // Define co-morbidity groups that require special handling
  const comorbidityGroups = [
    {
      conditions: ['diabetes', 'heart', 'blood pressure', 'cholesterol'],
      services: ['cardiology', 'endocrinology', 'dietician']
    },
    {
      conditions: ['anxiety', 'depression', 'sleep', 'stress'],
      services: ['psychiatry', 'psychology']
    },
    {
      conditions: ['back pain', 'neck pain', 'joint pain', 'arthritis'],
      services: ['physiotherapist', 'pain-management', 'orthopedics']
    },
    {
      conditions: ['ibs', 'stomach', 'digestive', 'reflux', 'gut'],
      services: ['gastroenterology', 'dietician']
    },
    {
      conditions: ['weight', 'fitness', 'nutrition', 'diet'],
      services: ['dietician', 'personal-trainer']
    }
  ];
  
  // Check each group for matches
  comorbidityGroups.forEach(group => {
    // Count how many conditions in this group match
    const matchCount = conditions.filter(condition => 
      group.conditions.some(gc => condition.toLowerCase().includes(gc.toLowerCase()))
    ).length;
    
    // If multiple matches from a group, add all related services
    if (matchCount >= 2) {
      console.log(`Detected co-morbid condition group with ${matchCount} matches`);
      group.services.forEach(service => additionalServices.add(service as ServiceCategory));
    }
  });
  
  // Special handling for certain combinations
  if (conditions.some(c => c.includes('pain')) && 
      conditions.some(c => c.includes('anxiety') || c.includes('depression'))) {
    console.log("Detected pain with psychological factors");
    additionalServices.add('psychology');
    additionalServices.add('pain-management');
  }
  
  if (conditions.some(c => c.includes('weight')) && 
      conditions.some(c => c.includes('diabetes') || c.includes('thyroid'))) {
    console.log("Detected weight issues with metabolic factors");
    additionalServices.add('endocrinology');
  }
  
  return Array.from(additionalServices);
}
