
export const extractLocation = (inputLower: string): { 
  extractedLocation?: string, 
  preferOnline: boolean 
} => {
  // Extract online preference
  const preferOnline = detectOnlinePreference(inputLower);
  
  // Extract location
  const locationMatches = inputLower.match(/\bin\s+([a-z\s]+?)(?:\s+and|\s+or|\s+but|\.|\,|\s+with|\s+for|\s+to|\s+from|\s+$)/i);
  if (locationMatches && locationMatches[1]) {
    const possibleLocation = locationMatches[1].trim();
    // Filter out common non-location phrases
    const nonLocationPhrases = ['general', 'particular', 'specific', 'the area', 'mind', 'my experience'];
    if (!nonLocationPhrases.some(phrase => possibleLocation.includes(phrase))) {
      console.log("Extracted location:", possibleLocation);
      return { extractedLocation: possibleLocation, preferOnline };
    }
  }
  
  return { extractedLocation: undefined, preferOnline };
};

export const detectOnlinePreference = (inputLower: string): boolean => {
  const preferOnlineMatches = ['online', 'virtual', 'remote', 'zoom', 'teams', 'video call'];
  return preferOnlineMatches.some(term => inputLower.includes(term));
};
