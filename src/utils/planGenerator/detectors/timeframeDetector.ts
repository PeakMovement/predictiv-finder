
import { ServiceCategory } from "../types";
import { SYMPTOM_MAPPINGS } from "../symptomMappingsData";

export const detectTimeframes = (
  inputLower: string,
  symptoms: string[],
  priorities: Record<string, number>
): void => {
  const weekMatches = inputLower.match(/(\d+)\s*weeks?/i);
  if (weekMatches && parseInt(weekMatches[1], 10) <= 4) {
    // Short timeframe (4 weeks or less) - prioritize coaching and specialized training
    console.log("Short timeframe detected, prioritizing rapid expertise");
    if (!symptoms.includes("race preparation")) {
      symptoms.push("race preparation");
      priorities["race preparation"] = 1.0; // Highest priority for short timeframe events
    }
  }
};
