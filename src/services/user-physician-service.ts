import { supabase } from '@/integrations/supabase/client';
import { PhysicianRecommendation } from './physician-recommendation-service';

export interface UserPhysicianPreference {
  id: string;
  user_id: string;
  physician_name: string;
  physician_title: string;
  physician_location: string;
  selection_count: number;
  last_selected_at: string;
  created_at: string;
  updated_at: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  health_issue: string;
  budget?: number;
  location?: string;
  results_count: number;
  created_at: string;
}

/**
 * Save or update user's physician preference
 */
export const savePhysicianPreference = async (
  physician: PhysicianRecommendation
): Promise<UserPhysicianPreference | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Try to update existing preference first
    const { data: existing } = await supabase
      .from('user_physician_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('physician_name', physician.Name)
      .single();

    if (existing) {
      // Update existing preference
      const { data, error } = await supabase
        .from('user_physician_preferences')
        .update({
          selection_count: existing.selection_count + 1,
          last_selected_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new preference
      const { data, error } = await supabase
        .from('user_physician_preferences')
        .insert({
          user_id: user.id,
          physician_name: physician.Name,
          physician_title: physician.Title,
          physician_location: physician.Location,
          selection_count: 1,
          last_selected_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving physician preference:', error);
    return null;
  }
};

/**
 * Get user's physician preferences (for personalization)
 */
export const getUserPhysicianPreferences = async (): Promise<UserPhysicianPreference[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_physician_preferences')
      .select('*')
      .eq('user_id', user.id)
      .order('selection_count', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching physician preferences:', error);
    return [];
  }
};

/**
 * Save search to history
 */
export const saveSearchHistory = async (
  healthIssue: string,
  budget?: number,
  location?: string,
  resultsCount: number = 0
): Promise<SearchHistory | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('search_history')
      .insert({
        user_id: user.id,
        health_issue: healthIssue,
        budget,
        location,
        results_count: resultsCount
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving search history:', error);
    return null;
  }
};

/**
 * Get user's search history
 */
export const getUserSearchHistory = async (limit: number = 10): Promise<SearchHistory[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching search history:', error);
    return [];
  }
};