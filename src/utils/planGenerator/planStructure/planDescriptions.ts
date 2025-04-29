// Helper function to generate more personalized descriptions
export function generatePlanDescription(
  conditions: string[], 
  primaryIssue?: string,
  userType?: string,
  tierName?: string,
  isKneePainRacePrep: boolean = false
): string {
  // Special case for knee pain + race preparation
  if (isKneePainRacePrep) {
    return "A carefully balanced plan addressing both knee rehabilitation and race preparation needs. " +
           "This plan includes modified training approaches and targeted therapy to support your racing goals " +
           "while prioritizing knee health and recovery.";
  }
  
  // Special case for anxiety + nutrition + race prep
  if ((primaryIssue === 'anxiety' || conditions.includes('anxiety')) && 
      conditions.includes('nutrition needs') && 
      (primaryIssue === 'race preparation' || conditions.includes('race preparation'))) {
    return "A holistic plan combining mental wellness support, nutritional guidance, and race training to help manage anxiety, improve eating habits, and prepare for your upcoming race.";
  }
  
  if (primaryIssue === 'anxiety' || conditions.includes('anxiety')) {
    return "A supportive plan focused on managing anxiety through professional guidance, lifestyle strategies, and mental wellbeing techniques.";
  }
  
  if (primaryIssue === 'race preparation' || conditions.includes('race preparation')) {
    return "A structured training program designed to prepare you for your upcoming race with appropriate intensity progression, recovery protocols, and performance strategies.";
  }
  
  if (primaryIssue === 'nutrition' || conditions.includes('nutrition needs')) {
    return "A personalized nutrition plan addressing your specific dietary needs with practical guidance to establish sustainable eating habits and improve overall health.";
  }
  
  // Keep other existing cases
  if (primaryIssue === 'shoulder pain' || conditions.includes('shoulder strain')) {
    return "A targeted recovery plan focusing on shoulder rehabilitation with physiotherapy and properly guided exercises to reduce pain and restore function.";
  }
  
  if (primaryIssue === 'knee pain' || conditions.includes('knee pain')) {
    return "A targeted recovery plan focusing on knee rehabilitation with physiotherapy and properly guided exercises to reduce pain and restore function.";
  }
  
  if (primaryIssue === 'back pain' || conditions.includes('back pain')) {
    return "A targeted recovery plan focusing on back rehabilitation with physiotherapy and properly guided exercises to reduce pain and restore function.";
  }
  
  if (primaryIssue === 'digestive issues' || conditions.includes('stomach issues')) {
    return "A comprehensive plan focused on improving digestive health through dietary adjustments, lifestyle changes, and specialized therapies.";
  }
  
  if (primaryIssue === 'weight management' || conditions.includes('weight loss')) {
    return "A personalized weight management plan focusing on sustainable lifestyle changes, exercise routines, and nutritional guidance to achieve your weight goals.";
  }
  
  if (primaryIssue === 'fitness' || primaryIssue === 'strength' || conditions.includes('fitness goals')) {
    return "A structured fitness plan designed to improve your overall fitness level, increase strength, and enhance physical performance through targeted exercises and expert guidance.";
  }
  
  if (primaryIssue === 'event preparation') {
    return "A specialized training program designed to prepare you for your upcoming event with periodized workouts, recovery protocols, and performance optimization strategies.";
  }
  
  if (primaryIssue === 'sports injury' || conditions.includes('sports injury')) {
    return "A comprehensive rehabilitation plan focusing on sports injury recovery with physiotherapy, targeted exercises, and return-to-play protocols to restore function and prevent re-injury.";
  }
  
  if (primaryIssue === 'stress' || conditions.includes('mental health')) {
    return "A supportive plan focused on managing stress through professional guidance, lifestyle strategies, and mental wellbeing techniques.";
  }
  
  // Default description
  let baseDescription = "A personalized wellness plan designed to address your specific health needs";
  
  if (userType === 'student') {
    baseDescription += " with student-friendly options";
  } else if (tierName === 'low') {
    baseDescription += " within an affordable budget";
  } else if (tierName === 'high') {
    baseDescription += " with premium service options";
  }
  
  return `${baseDescription}.`;
}

// Helper function to generate more specific service descriptions
export function generateServiceDescription(
  serviceType: string, 
  isHighEnd: boolean,
  frequency?: string,
  primaryIssue?: string,
  isKneePainRacePrep: boolean = false
): string {
  let description = '';
  
  // Special case for knee pain + race preparation
  if (isKneePainRacePrep) {
    switch (serviceType) {
      case 'physiotherapist':
        return isHighEnd 
          ? "Specialized knee rehabilitation sessions focusing on running biomechanics and race-specific movement patterns" 
          : "Targeted knee therapy sessions to support safe race preparation and running mechanics";
      case 'coaching':
        return isHighEnd 
          ? "Personalized race coaching with knee-safe training plans and modified intensity progression" 
          : "Race preparation coaching designed to accommodate knee limitations while building fitness";
      case 'personal-trainer':
        return isHighEnd 
          ? "Custom strength training for knee stability and running performance with race-specific focus" 
          : "Knee-friendly training sessions designed to support your race goals";
    }
  }
  
  switch (serviceType) {
    case 'dietician':
      if (primaryIssue === 'anxiety' || primaryIssue?.includes('nutrition')) {
        description = "Specialized nutritional support to address anxiety-related eating challenges";
      } else if (primaryIssue === 'race preparation') {
        description = "Sports nutrition guidance for optimal race preparation and performance";
      } else if (primaryIssue === 'weight management') {
        description = "Customized meal planning for sustainable weight management";
      } else if (primaryIssue === 'digestive issues') {
        description = "Specialized dietary assessment for digestive health";
      } else {
        description = isHighEnd 
          ? "Comprehensive nutritional assessment with detailed dietary recommendations" 
          : "Nutritional guidance and practical meal planning advice";
      }
      break;
      
    case 'personal-trainer':
      if (primaryIssue === 'race preparation') {
        description = "Specialized running training sessions with race-specific preparation";
      } else if (primaryIssue === 'weight management') {
        description = "Structured weight loss training sessions with fat-burning exercises";
      } else if (primaryIssue === 'fitness' || primaryIssue === 'strength') {
        description = "Progressive strength training with performance tracking";
      } else if (primaryIssue === 'event preparation') {
        description = "Event-specific training with periodization and performance targets";
      } else {
        description = isHighEnd 
          ? "Fully personalized training sessions with advanced program design" 
          : "Guided workout sessions targeting your specific fitness goals";
      }
      break;
      
    case 'coaching':
      if (primaryIssue === 'anxiety') {
        description = "Supportive coaching focused on anxiety management and mental wellbeing strategies";
      } else if (primaryIssue === 'race preparation') {
        description = "Race preparation coaching with mental performance techniques";
      } else {
        description = isHighEnd 
          ? "One-on-one coaching sessions with advanced behavior change techniques" 
          : "Supportive coaching to help develop healthy habits and mindsets";
      }
      break;
      
    case 'physiotherapist':
      if (primaryIssue === 'shoulder pain') {
        description = "Specialized shoulder assessment and rehabilitation treatment";
      } else if (primaryIssue === 'knee pain') {
        description = "Comprehensive knee evaluation and targeted rehabilitation";
      } else if (primaryIssue === 'back pain') {
        description = "Focused back assessment with manual therapy and corrective exercises";
      } else if (primaryIssue === 'sports injury') {
        description = "Sports injury rehabilitation with return-to-play protocols";
      } else {
        description = isHighEnd 
          ? "Comprehensive physiotherapy assessment and specialized treatment plan" 
          : "Clinical assessment and targeted rehabilitation exercises";
      }
      break;
      
    default:
      description = isHighEnd 
        ? "Specialized professional consultation with comprehensive assessment" 
        : "Professional consultation focused on your specific needs";
  }
  
  // Add frequency information if available
  if (frequency) {
    description += ` (${frequency})`;
  }
  
  return description;
}
