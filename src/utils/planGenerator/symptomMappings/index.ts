
import { PHYSICAL_SYMPTOMS } from "./physicalSymptoms";
import { DIGESTIVE_SYMPTOMS } from "./digestiveSymptoms";
import { PAIN_SYMPTOMS } from "./painSymptoms";
import { MENTAL_HEALTH_SYMPTOMS } from "./mentalHealthSymptoms";
import { FITNESS_SYMPTOMS } from "./fitnessSymptoms";
import { SymptomMapping } from "./types";

// Combine all symptom mappings into a single record
export const SYMPTOM_MAPPINGS: Record<string, SymptomMapping> = {
  ...PHYSICAL_SYMPTOMS,
  ...DIGESTIVE_SYMPTOMS,
  ...PAIN_SYMPTOMS,
  ...MENTAL_HEALTH_SYMPTOMS,
  ...FITNESS_SYMPTOMS
};

// Re-export the type for use elsewhere
export * from "./types";
