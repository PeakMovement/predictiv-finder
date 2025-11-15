import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Professional = Database['public']['Tables']['professionals']['Row'];
type ProfessionalInsert = Database['public']['Tables']['professionals']['Insert'];
type ProfessionalUpdate = Database['public']['Tables']['professionals']['Update'];

export class ProfessionalService {
  // Get current professional profile
  static async getCurrentProfessional(): Promise<Professional | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Get all approved professionals
  static async getAllApprovedProfessionals(): Promise<Professional[]> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Create professional profile
  static async createProfessional(professional: ProfessionalInsert): Promise<Professional> {
    const { data, error } = await supabase
      .from('professionals')
      .insert(professional)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update professional profile
  static async updateProfessional(updates: ProfessionalUpdate): Promise<Professional> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('professionals')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Upload professional photo
  static async uploadPhoto(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `professional-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('professional-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('professional-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  }
}
