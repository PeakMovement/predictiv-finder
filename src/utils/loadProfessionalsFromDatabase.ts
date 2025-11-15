import { ProfessionalService } from '@/services/professional-service';
import { Practitioner, ServiceCategory } from '@/types';

/**
 * Maps profession names to ServiceCategory types
 */
const professionToServiceCategory = (profession: string): ServiceCategory => {
  const mapping: Record<string, ServiceCategory> = {
    'Physiotherapist': 'physiotherapist',
    'Biokineticist': 'biokineticist',
    'Chiropractor': 'physiotherapist', // Map to closest match
    'GP': 'general-practitioner',
    'Massage Therapist': 'physiotherapist', // Map to closest match
    'Dietician': 'dietician',
    'Sports Doctor': 'general-practitioner',
    'Psychologist': 'psychology',
  };
  return mapping[profession] || 'physiotherapist';
};

/**
 * Loads real professionals from Supabase database and converts them 
 * to the Practitioner format used by the existing search engine.
 * 
 * This function integrates database professionals with the existing 
 * recommendation system without modifying the search algorithm.
 */
export async function loadProfessionalsFromDatabase(): Promise<Practitioner[]> {
  try {
    const professionals = await ProfessionalService.getAllApprovedProfessionals();
    
    return professionals.map((prof) => ({
      id: prof.id,
      name: prof.name,
      serviceType: professionToServiceCategory(prof.profession),
      pricePerSession: prof.price_min || 500,
      serviceTags: prof.specialities,
      location: prof.location || 'Not specified',
      isOnline: false, // Can be added to database later
      availability: 'Available',
      imageUrl: prof.photo_url || '/placeholder.svg',
      bio: `${prof.profession} specializing in ${prof.specialities.slice(0, 3).join(', ')}`,
      rating: 4.5, // Default value, will be real reviews later
      maxPrice: prof.price_max || undefined,
      specialtyNotes: prof.specialities.join(' • '),
    }));
  } catch (error) {
    console.error('Error loading professionals from database:', error);
    return [];
  }
}
