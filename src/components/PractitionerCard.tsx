
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Practitioner } from '@/types';
import { AvailabilityCalendar } from './calendar/AvailabilityCalendar';
import { CalendarIntegrationDialog } from './calendar/CalendarIntegrationDialog';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';
import { Calendar, Clock, MapPin, Star, Settings } from 'lucide-react';

interface PractitionerCardProps {
  practitioner: Practitioner;
  onSelect: (practitioner: Practitioner) => void;
}

export const PractitionerCard: React.FC<PractitionerCardProps> = ({ 
  practitioner, 
  onSelect 
}) => {
  const [showAvailability, setShowAvailability] = useState(false);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const { integrations, loadIntegrations, syncCalendars } = useCalendarIntegration(practitioner.id);

  const handleBooking = () => {
    onSelect(practitioner);
  };

  const handleSyncCalendars = async () => {
    await syncCalendars(practitioner.id);
    await loadIntegrations(practitioner.id);
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={practitioner.imageUrl || '/placeholder-avatar.png'}
              alt={practitioner.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <CardTitle className="text-lg">{practitioner.name}</CardTitle>
              <Badge variant="silver" className="mt-1">
                {practitioner.serviceType}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{practitioner.rating}</span>
            </div>
            <span className="text-lg font-bold text-modern-dark mt-1">
              R{practitioner.pricePerSession}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-modern-gray text-sm">{practitioner.bio}</p>

        <div className="flex items-center space-x-4 text-sm text-modern-gray">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{practitioner.location}</span>
          </div>
          {practitioner.isOnline && (
            <Badge variant="outline" className="text-xs">
              Online Available
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAvailability(true)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Availability
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Availability - {practitioner.name}</DialogTitle>
              </DialogHeader>
              <AvailabilityCalendar 
                practitionerId={practitioner.id}
                onTimeSlotSelect={(slot) => {
                  console.log('Selected time slot:', slot);
                  setShowAvailability(false);
                  handleBooking();
                }}
              />
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSyncCalendars}
          >
            <Clock className="w-4 h-4 mr-2" />
            Sync Calendars
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowIntegrationDialog(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex space-x-1">
            {integrations.length > 0 ? (
              integrations.map((integration) => (
                <Badge key={integration.id} variant="silver" className="text-xs">
                  {integration.integration_type}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-modern-gray">No calendar integrations</span>
            )}
          </div>
          
          <Button onClick={handleBooking} className="modern-button">
            Book Session
          </Button>
        </div>

        <CalendarIntegrationDialog
          isOpen={showIntegrationDialog}
          onClose={() => setShowIntegrationDialog(false)}
          practitionerId={practitioner.id}
          onIntegrationAdded={() => loadIntegrations(practitioner.id)}
        />
      </CardContent>
    </Card>
  );
};
