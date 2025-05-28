
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row'];

interface AvailabilityCalendarProps {
  practitionerId: string;
  onTimeSlotSelect?: (slot: AvailabilitySlot) => void;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  practitionerId,
  onTimeSlotSelect
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<AvailabilitySlot[]>([]);
  const { getAvailabilityForDate, isLoading } = useCalendarIntegration(practitionerId);

  // Load availability when date changes
  useEffect(() => {
    if (selectedDate && practitionerId) {
      loadAvailability();
    }
  }, [selectedDate, practitionerId]);

  const loadAvailability = async () => {
    const slots = await getAvailabilityForDate(practitionerId, selectedDate);
    setTimeSlots(slots);
  };

  const formatTimeSlot = (slot: AvailabilitySlot) => {
    const start = new Date(slot.start_time);
    const end = new Date(slot.end_time);
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Available Times - {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading available times...</div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant="outline"
                  onClick={() => onTimeSlotSelect?.(slot)}
                  className="flex items-center justify-between p-3"
                >
                  <span>{formatTimeSlot(slot)}</span>
                  <Badge variant="silver" className="ml-2">
                    {slot.sync_source}
                  </Badge>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No available times for this date
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
