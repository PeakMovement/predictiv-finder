
/**
 * Extracts specific goals from user input
 * @param input User input text
 * @returns Array of identified goals
 */
export function extractGoals(input: string): string[] {
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
