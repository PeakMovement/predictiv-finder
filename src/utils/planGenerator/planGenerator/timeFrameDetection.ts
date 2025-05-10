
import { PlanContext } from "../types";

/**
 * Determines the appropriate timeframe for a plan based on context
 */
export const determineTimeFrame = (context: PlanContext): string => {
  // Special case for knee pain + race prep
  const hasKneePain = context.medicalConditions?.some(c => 
    c.toLowerCase().includes('knee') && c.toLowerCase().includes('pain')
  );
  
  const hasRacePrep = context.goal?.toLowerCase().includes('race') || 
                      context.goal?.toLowerCase().includes('run') ||
                      context.medicalConditions?.some(c => c.toLowerCase().includes('race preparation'));
  
  if (hasKneePain && hasRacePrep) {
    // Check if there's a specific timeframe mentioned for the race
    const raceMatch = context.goal?.match(/(\d+)\s*(weeks?|months?|days?)(.*?)(race|run|marathon|event)/i) ||
                       context.goal?.match(/(race|run|marathon|event)(.*?)(\d+)\s*(weeks?|months?|days?)/i);
                    
    if (raceMatch) {
      const amount = parseInt(raceMatch[1] || raceMatch[3], 10);
      const unit = (raceMatch[2] || raceMatch[4]).toLowerCase();
      return `${amount} ${unit}`;
    }
    
    // Default timeframe for knee pain + race prep
    return "8 weeks"; // Standard combined rehab + training timeframe
  }
  
  // For standard knee pain without race prep
  if (hasKneePain) {
    return "6 weeks"; // Standard knee rehabilitation timeframe
  }
  
  // For race prep without injury
  if (hasRacePrep) {
    return "4 weeks"; // Standard race preparation timeframe
  }
  
  return "8 weeks"; // Default timeframe
};
