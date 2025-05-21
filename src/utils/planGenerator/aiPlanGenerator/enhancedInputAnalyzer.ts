
import { useState, useEffect } from 'react';
import { extractHealthData, HealthDataExtractionOptions } from '../../healthDataExtraction';
import { extractHealthDataWithLocalModel } from '../../healthDataExtraction/localModelExtractor';

/**
 * Enhanced analyzer that leverages the unified health data extraction system
 * @param userInput - The user's query or health description
 * @param options - Options for extraction methods to use
 * @returns Comprehensive analysis of the input
 */
export async function enhancedHealthDataAnalysis(
  userInput: string,
  options: HealthDataExtractionOptions = {}
) {
  // Use the unified extraction function with provided options
  const extractedData = await extractHealthData(userInput, options);
  
  // Transform the unified format into the format expected by the plan generator
  return {
    medicalConditions: extractedData.symptoms,
    primaryIssue: extractedData.goals.length > 0 ? extractedData.goals[0] : undefined,
    suggestedCategories: extractedData.suggestedCategories,
    budget: extractedData.budget,
    timeframe: extractedData.timeframe,
    location: extractedData.location,
    extractionSource: extractedData.source,
    
    // Additional fields required by the plan generator
    hasEnoughInformation: 
      extractedData.symptoms.length > 0 || 
      extractedData.goals.length > 0 || 
      extractedData.suggestedCategories.length > 0,
    preferOnline: userInput.toLowerCase().includes('online') || 
                  userInput.toLowerCase().includes('remote') || 
                  userInput.toLowerCase().includes('virtual'),
    hasBudgetConstraint: !!extractedData.budget,
    appSource: 'enhanced analyzer',
  };
}

/**
 * Wrapper for backward compatibility with existing code
 */
export function enhancedAnalyzeUserInput(userInput: string) {
  // Use the local model by default for backward compatibility
  const localResult = extractHealthDataWithLocalModel(userInput);
  
  return {
    medicalConditions: localResult.symptoms,
    primaryIssue: localResult.goals.length > 0 ? localResult.goals[0] : undefined,
    suggestedCategories: localResult.suggestedCategories,
    budget: localResult.budget,
    location: localResult.location,
    preferOnline: userInput.toLowerCase().includes('online') || 
                  userInput.toLowerCase().includes('remote') || 
                  userInput.toLowerCase().includes('virtual'),
    hasEnoughInformation: 
      localResult.symptoms.length > 0 || 
      localResult.goals.length > 0 || 
      localResult.suggestedCategories.length > 0,
    hasBudgetConstraint: !!localResult.budget,
  };
}
