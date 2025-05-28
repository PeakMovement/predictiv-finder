
import { useState, useEffect } from 'react';
import { CalendarIntegrationService } from '@/services/calendar-integration-service';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type CalendarIntegration = Database['public']['Tables']['calendar_integrations']['Row'];
type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row'];

export const useCalendarIntegration = (practitionerId?: string) => {
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load integrations for a practitioner
  const loadIntegrations = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await CalendarIntegrationService.getPractitionerIntegrations(id);
      setIntegrations(data);
    } catch (error: any) {
      toast({
        title: "Failed to load calendar integrations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get availability for a specific date
  const getAvailabilityForDate = async (id: string, date: Date) => {
    try {
      setIsLoading(true);
      const slots = await CalendarIntegrationService.getAvailableSlots(id, date);
      setAvailabilitySlots(slots);
      return slots;
    } catch (error: any) {
      toast({
        title: "Failed to load availability",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Sync calendars
  const syncCalendars = async (id: string) => {
    try {
      setIsLoading(true);
      await CalendarIntegrationService.syncCalendars(id);
      toast({
        title: "Calendar sync initiated",
        description: "Availability data is being updated from connected calendars.",
      });
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Setup real-time updates
  useEffect(() => {
    if (!practitionerId) return;

    const channel = CalendarIntegrationService.subscribeToAvailabilityUpdates(
      practitionerId,
      (payload) => {
        console.log('Availability update:', payload);
        // Refresh availability data when changes occur
        if (practitionerId) {
          loadIntegrations(practitionerId);
        }
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [practitionerId]);

  return {
    integrations,
    availabilitySlots,
    isLoading,
    loadIntegrations,
    getAvailabilityForDate,
    syncCalendars
  };
};
