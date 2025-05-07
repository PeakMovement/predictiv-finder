
// This file is now a thin wrapper over our new modular structure
import { generateProfessionalRecommendations, ProfessionalRecommendation } from "./professionalRecommendation";

// Re-export the types and main function
export type { ProfessionalRecommendation };
export { generateProfessionalRecommendations };
