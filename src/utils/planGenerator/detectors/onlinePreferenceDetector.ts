
import { ServiceCategory } from "../types";

export const detectOnlinePreference = (
  inputLower: string,
  contraindications: ServiceCategory[],
  hasStomachReference: boolean = false
): boolean => {
  const preferOnline = inputLower.includes('online') || 
      inputLower.includes('remote') || 
      inputLower.includes('virtual');
      
  if (preferOnline) {
    console.log("*** DETECTED PREFERENCE FOR ONLINE SERVICES ***");
    
    // Less suitable for online delivery
    const lessOnlineSuitable: ServiceCategory[] = [
      'physiotherapist', 'biokineticist', 'personal-trainer'
    ];
    
    // If stomach issues are detected with online preference, physiotherapy and biokineticist are even less suitable
    if (hasStomachReference) {
      lessOnlineSuitable.forEach(specialist => {
        if (!contraindications.includes(specialist)) {
          contraindications.push(specialist);
          console.log(`Added ${specialist} to contraindications due to online preference for stomach issue`);
        }
      });
    }
  }
  
  return preferOnline;
};
