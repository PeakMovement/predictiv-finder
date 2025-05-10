
/**
 * Generates a unique name for a plan based on provided information
 */
export function generateUniqueName(
  primaryType: string,
  adjectives: string[] = [],
  baseId: string = ""
): string {
  const adjectiveOptions = [
    "Comprehensive", "Effective", "Personalized", "Balanced", "Integrated",
    "Specialized", "Optimized", "Targeted", "Custom", "Advanced"
  ];
  
  // Use provided adjectives or choose random ones
  const chosenAdjectives = adjectives.length > 0 
    ? adjectives 
    : [adjectiveOptions[Math.floor(Math.random() * adjectiveOptions.length)]];
  
  // Format the name with adjectives
  const nameBase = `${chosenAdjectives.join(" ")} ${primaryType} Plan`;
  
  // Add a unique identifier if provided
  return baseId ? `${nameBase} (${baseId})` : nameBase;
}

/**
 * Formats a service category name for display in UI
 */
export function formatServiceName(category: string): string {
  return category
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
