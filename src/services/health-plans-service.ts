
import { supabase } from '@/integrations/supabase/client';
import { AIHealthPlan } from '@/types';
import { Database } from '@/integrations/supabase/types';

type HealthPlan = Database['public']['Tables']['health_plans']['Row'];
type HealthPlanInsert = Database['public']['Tables']['health_plans']['Insert'];

export class HealthPlansService {
  // Save a health plan to the database
  static async saveHealthPlan(plan: AIHealthPlan): Promise<HealthPlan> {
    const { data, error } = await supabase
      .from('health_plans')
      .insert({
        name: plan.name,
        description: plan.description,
        plan_type: plan.planType,
        total_cost: plan.totalCost,
        time_frame: plan.timeFrame,
        services: plan.services,
        user_id: (await supabase.auth.getUser()).data.user?.id!
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all health plans for the current user
  static async getUserHealthPlans(): Promise<HealthPlan[]> {
    const { data, error } = await supabase
      .from('health_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get a specific health plan by ID
  static async getHealthPlan(id: string): Promise<HealthPlan | null> {
    const { data, error } = await supabase
      .from('health_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  }

  // Update a health plan
  static async updateHealthPlan(id: string, updates: Partial<HealthPlanInsert>): Promise<HealthPlan> {
    const { data, error } = await supabase
      .from('health_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete a health plan
  static async deleteHealthPlan(id: string): Promise<void> {
    const { error } = await supabase
      .from('health_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Subscribe to real-time changes
  static subscribeToHealthPlans(callback: (payload: any) => void) {
    return supabase
      .channel('health-plans-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_plans'
        },
        callback
      )
      .subscribe();
  }
}
