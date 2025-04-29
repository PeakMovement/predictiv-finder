
// Helper function to determine timeframe
export function determineTimeFrame(
  conditions: string[],
  userQuery: string,
  contextualFactors: string[] = [],
  isKneePainRacePrep: boolean = false
): string {
  // Special case for knee pain + race prep
  if (isKneePainRacePrep) {
    // Check for specific race timeframes in the query
    const raceMatch = userQuery.match(/(\d+)\s*(weeks?|months?|days?)(.*?)(race|run|marathon|event)/i) ||
                    userQuery.match(/(race|run|marathon|event)(.*?)(\d+)\s*(weeks?|months?|days?)/i);
                    
    if (raceMatch) {
      const amount = parseInt(raceMatch[1] || raceMatch[3], 10);
      const unit = (raceMatch[2] || raceMatch[4]).toLowerCase();
      return `${amount} ${unit}`;
    }
    
    return '8 weeks'; // Standard combined rehab + training timeframe
  }
  
  // Check for specific race timeframes in the query
  const raceMatch = userQuery.match(/(\d+)\s*(weeks?|months?|days?)(.*?)(race|run|marathon|event)/i) ||
                    userQuery.match(/(race|run|marathon|event)(.*?)(\d+)\s*(weeks?|months?|days?)/i);
                    
  if (raceMatch) {
    const amount = parseInt(raceMatch[1] || raceMatch[3], 10);
    const unit = (raceMatch[2] || raceMatch[4]).toLowerCase();
    return `${amount} ${unit}`;
  }
  
  // Check for general timeframes in the query
  const timeMatch = userQuery.match(/(\d+)\s*(weeks?|months?|days?)/i);
  if (timeMatch) {
    const amount = parseInt(timeMatch[1], 10);
    const unit = timeMatch[2].toLowerCase();
    return `${amount} ${unit}`;
  }
  
  // Based on primary issue
  if (contextualFactors.includes('event-preparation')) {
    return '8 weeks'; // Standard event prep timeframe
  }
  
  if (conditions.includes('sports injury') || 
      conditions.includes('shoulder strain') ||
      conditions.includes('knee pain') ||
      conditions.includes('back pain')) {
    return '6 weeks'; // Standard injury rehabilitation timeframe
  }
  
  if (conditions.includes('weight loss')) {
    return '12 weeks'; // Standard weight loss timeframe
  }
  
  if (conditions.includes('race preparation')) {
    return '4 weeks'; // Short race prep timeframe
  }
  
  return '8 weeks'; // Default timeframe
}
