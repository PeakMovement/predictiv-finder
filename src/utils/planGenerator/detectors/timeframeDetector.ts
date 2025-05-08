
export const detectTimeframes = (
  inputLower: string,
  symptoms: string[],
  priorities: Record<string, number>
): { weeks: number | null; isUrgent: boolean } => {
  // Detect specific timeframes mentioned
  const weekMatch = inputLower.match(/(\d+)\s*weeks?/i);
  const monthMatch = inputLower.match(/(\d+)\s*months?/i);
  const dayMatch = inputLower.match(/(\d+)\s*days?/i);
  
  let weeks: number | null = null;
  
  if (weekMatch && weekMatch[1]) {
    weeks = parseInt(weekMatch[1], 10);
    console.log(`Detected timeframe: ${weeks} weeks`);
  } else if (monthMatch && monthMatch[1]) {
    weeks = parseInt(monthMatch[1], 10) * 4; // Convert months to weeks
    console.log(`Detected timeframe: ${monthMatch[1]} months (${weeks} weeks)`);
  } else if (dayMatch && dayMatch[1]) {
    weeks = Math.ceil(parseInt(dayMatch[1], 10) / 7); // Convert days to weeks
    console.log(`Detected timeframe: ${dayMatch[1]} days (${weeks} weeks)`);
  }
  
  // Check for urgency indicators
  const urgencyPhrases = [
    "urgently", "urgent", "as soon as possible", "asap", "immediately", 
    "emergency", "critical", "right away", "quickly"
  ];
  
  const isUrgent = urgencyPhrases.some(phrase => inputLower.includes(phrase));
  
  if (isUrgent) {
    console.log("Detected urgency in request");
    
    // Add weight to urgency-related symptoms
    if (!symptoms.includes("urgent care")) {
      symptoms.push("urgent care");
      priorities["urgent care"] = 0.9;
    }
    
    // If no specific timeframe but urgent, assume short timeframe
    if (!weeks) {
      weeks = 2; // Default urgent timeframe
      console.log("No specific timeframe but urgent request, assuming 2 weeks");
    }
  }
  
  // Detect event-based timeframes
  if (inputLower.match(/before\s+([a-z\s]+)/i)) {
    const eventMatch = inputLower.match(/before\s+([a-z\s]+)/i);
    if (eventMatch) {
      const event = eventMatch[1].toLowerCase();
      console.log(`Detected event deadline: ${event}`);
      
      if (event.includes("race") || event.includes("marathon") || 
          event.includes("competition") || event.includes("tournament")) {
        if (!symptoms.includes("event preparation")) {
          symptoms.push("event preparation");
          priorities["event preparation"] = 0.85;
          console.log("Added 'event preparation' to symptoms");
        }
      }
    }
  }
  
  return { weeks, isUrgent };
};

export const extractGoalTimeframe = (userInput: string): number | null => {
  const inputLower = userInput.toLowerCase();
  
  // Look for specific goal statements with timeframes
  const goalTimeframeMatch = 
    inputLower.match(/(?:goal|want|need|aim).*?(\d+)\s*(?:week|month|day)/i) ||
    inputLower.match(/(?:within|in)\s*(\d+)\s*(?:week|month|day)/i) ||
    inputLower.match(/(\d+)\s*(?:week|month|day).*?(?:goal|aim|target)/i);
    
  if (goalTimeframeMatch && goalTimeframeMatch[1]) {
    const value = parseInt(goalTimeframeMatch[1], 10);
    
    // Determine the unit (week, month, day)
    const unit = goalTimeframeMatch[0].includes('week') ? 'week' : 
                goalTimeframeMatch[0].includes('month') ? 'month' : 'day';
                
    // Convert to weeks for consistency
    let weeks: number;
    switch (unit) {
      case 'month':
        weeks = value * 4;
        break;
      case 'day':
        weeks = Math.ceil(value / 7);
        break;
      default:
        weeks = value;
    }
    
    console.log(`Extracted goal timeframe: ${value} ${unit}s (${weeks} weeks)`);
    return weeks;
  }
  
  return null;
};
