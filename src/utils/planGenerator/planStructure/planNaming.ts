// Function to generate more specific plan names
export function generatePlanName(
  tierName: string, 
  conditions: string[], 
  primaryIssue?: string,
  isKneePainRacePrep: boolean = false
): string {
  const tierPrefix = `${tierName.charAt(0).toUpperCase() + tierName.slice(1)} Budget:`;
  
  // Special case for knee pain + race preparation
  if (isKneePainRacePrep) {
    return `${tierPrefix} Knee-Safe Race Preparation Plan`;
  }
  
  // Special case for anxiety + nutrition + race prep
  if ((primaryIssue === 'anxiety' || conditions.includes('anxiety')) && 
      conditions.includes('nutrition needs') && 
      (primaryIssue === 'race preparation' || conditions.includes('race preparation'))) {
    return `${tierPrefix} Race Preparation & Nutrition Support Plan`;
  }
  
  if (primaryIssue === 'anxiety' || conditions.includes('anxiety')) {
    return `${tierPrefix} Anxiety & Wellbeing Plan`;
  }
  
  if (primaryIssue === 'race preparation' || conditions.includes('race preparation')) {
    return `${tierPrefix} Race Training Plan`;
  }
  
  if (primaryIssue === 'nutrition' || conditions.includes('nutrition needs')) {
    return `${tierPrefix} Nutritional Support Plan`;
  }
  
  // Keep existing cases
  if (primaryIssue === 'shoulder pain' || conditions.includes('shoulder strain')) {
    return `${tierPrefix} Shoulder Recovery Plan`;
  }
  
  if (primaryIssue === 'knee pain' || conditions.includes('knee pain')) {
    return `${tierPrefix} Knee Rehabilitation Plan`;
  }
  
  if (primaryIssue === 'back pain' || conditions.includes('back pain')) {
    return `${tierPrefix} Back Relief & Recovery Plan`;
  }
  
  if (primaryIssue === 'digestive issues' || conditions.includes('stomach issues')) {
    return `${tierPrefix} Digestive Health Plan`;
  }
  
  if (primaryIssue === 'weight management' || conditions.includes('weight loss')) {
    return `${tierPrefix} Weight Management Plan`;
  }
  
  if (primaryIssue === 'fitness' || primaryIssue === 'strength' || conditions.includes('fitness goals')) {
    return `${tierPrefix} Fitness & Strength Plan`;
  }
  
  if (primaryIssue === 'event preparation') {
    return `${tierPrefix} Event Preparation Plan`;
  }
  
  if (primaryIssue === 'sports injury' || conditions.includes('sports injury')) {
    return `${tierPrefix} Sports Recovery Plan`;
  }
  
  if (primaryIssue === 'stress' || conditions.includes('mental health')) {
    return `${tierPrefix} Stress Management Plan`;
  }
  
  // Default name
  return `${tierPrefix} Customized Wellness Plan`;
}
