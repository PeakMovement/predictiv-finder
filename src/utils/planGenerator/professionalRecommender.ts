
// This file is now a thin wrapper over our new modular structure
import { generateProfessionalRecommendations } from "./professionalRecommendation";
// Use export type for re-exporting types when isolatedModules is enabled
export { generateProfessionalRecommendations };
export type { ServiceCategory } from "./types";
