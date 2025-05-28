
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type CalendarIntegration = Database['public']['Tables']['calendar_integrations']['Row'];
type CalendarIntegrationInsert = Database['public']['Tables']['calendar_integrations']['Insert'];
type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row'];

export class CalendarIntegrationService {
  // Create a new calendar integration
  static async createIntegration(integration: CalendarIntegrationInsert): Promise<CalendarIntegration> {
    const { data, error } = await supabase
      .from('calendar_integrations')
      .insert(integration)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get all integrations for a practitioner
  static async getPractitionerIntegrations(practitionerId: string): Promise<CalendarIntegration[]> {
    const { data, error } = await supabase
      .from('calendar_integrations')
      .select('*')
      .eq('practitioner_id', practitionerId);

    if (error) throw error;
    return data || [];
  }

  // Update integration sync status
  static async updateSyncStatus(integrationId: string, syncEnabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('calendar_integrations')
      .update({ sync_enabled: syncEnabled, updated_at: new Date().toISOString() })
      .eq('id', integrationId);

    if (error) throw error;
  }

  // Get availability slots for a practitioner within a date range
  static async getAvailabilitySlots(
    practitionerId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<AvailabilitySlot[]> {
    const { data, error } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .gte('start_time', startDate.toISOString())
      .lte('end_time', endDate.toISOString())
      .order('start_time');

    if (error) throw error;
    return data || [];
  }

  // Get available time slots for a practitioner on a specific date
  static async getAvailableSlots(practitionerId: string, date: Date): Promise<AvailabilitySlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('practitioner_id', practitionerId)
      .eq('is_available', true)
      .gte('start_time', startOfDay.toISOString())
      .lte('end_time', endOfDay.toISOString())
      .order('start_time');

    if (error) throw error;
    return data || [];
  }

  // Trigger calendar sync for a practitioner
  static async syncCalendars(practitionerId: string): Promise<void> {
    const { error } = await supabase.functions.invoke('sync-calendar-availability', {
      body: { practitionerId }
    });

    if (error) throw error;
  }

  // Subscribe to real-time availability updates
  static subscribeToAvailabilityUpdates(
    practitionerId: string, 
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`availability-${practitionerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availability_slots',
          filter: `practitioner_id=eq.${practitionerId}`
        },
        callback
      )
      .subscribe();
  }
}
