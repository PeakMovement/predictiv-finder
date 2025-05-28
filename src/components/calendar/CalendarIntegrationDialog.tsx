
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIntegrationService } from '@/services/calendar-integration-service';
import { useToast } from '@/hooks/use-toast';

interface CalendarIntegrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  practitionerId: string;
  onIntegrationAdded: () => void;
}

export const CalendarIntegrationDialog: React.FC<CalendarIntegrationDialogProps> = ({
  isOpen,
  onClose,
  practitionerId,
  onIntegrationAdded
}) => {
  const [integrationType, setIntegrationType] = useState<'bookem' | 'setmore' | 'google_calendar'>('google_calendar');
  const [apiKey, setApiKey] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;

    try {
      setIsLoading(true);
      
      await CalendarIntegrationService.createIntegration({
        practitioner_id: practitionerId,
        integration_type: integrationType,
        api_credentials: { apiKey, calendarId },
        calendar_id: calendarId || null,
        sync_enabled: true
      });

      toast({
        title: "Integration added successfully",
        description: `${integrationType} calendar has been connected.`,
      });

      onIntegrationAdded();
      onClose();
      
      // Reset form
      setApiKey('');
      setCalendarId('');
    } catch (error: any) {
      toast({
        title: "Failed to add integration",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Calendar Integration</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="integration-type">Calendar Service</Label>
            <Select value={integrationType} onValueChange={(value: any) => setIntegrationType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select calendar service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google_calendar">Google Calendar</SelectItem>
                <SelectItem value="bookem">Bookem</SelectItem>
                <SelectItem value="setmore">Setmore</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              required
            />
          </div>

          {integrationType === 'google_calendar' && (
            <div className="space-y-2">
              <Label htmlFor="calendar-id">Calendar ID (optional)</Label>
              <Input
                id="calendar-id"
                value={calendarId}
                onChange={(e) => setCalendarId(e.target.value)}
                placeholder="primary or specific calendar ID"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Integration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
