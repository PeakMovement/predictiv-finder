
import { AIHealthPlan } from "@/types";

// Helper function to determine plan type
export function determinePlanType(
  conditions: string[],
  primaryIssue?: string,
  tierName?: string
): AIHealthPlan['planType'] {
  // Special case for knee pain + race prep
  const hasKneePain = conditions.some(c => c.toLowerCase().includes('knee'));
  const hasRacePrep = conditions.some(c => c.toLowerCase().includes('race'));
  
  if (hasKneePain && hasRacePrep) {
    return 'progressive';
  }
  
  if (primaryIssue === 'race preparation' || conditions.includes('race preparation')) {
    return 'progressive';
  }
  
  if (primaryIssue === 'event preparation' || conditions.includes('fitness goals')) {
    return 'progressive';
  }
  
  if (primaryIssue === 'shoulder pain' || primaryIssue === 'knee pain' || 
      primaryIssue === 'back pain' || conditions.includes('sports injury')) {
    return 'high-impact';
  }
  
  if (tierName === 'low') {
    return 'best-fit';
  }
  
  return 'progressive';
}
