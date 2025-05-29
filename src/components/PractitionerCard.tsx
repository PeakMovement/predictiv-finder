
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Practitioner } from '@/types';
import { AvailabilityCalendar } from './calendar/AvailabilityCalendar';
import { CalendarIntegrationDialog } from './calendar/CalendarIntegrationDialog';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';
import { useNetworkOperation } from '@/hooks/useOfflineStatus';
import { Calendar, Clock, MapPin, Star, Settings, WifiOff } from 'lucide-react';
import { EnhancedLoadingIndicator, useLoadingState } from '@/components/ui/enhanced-loading-indicator';

interface PractitionerCardProps {
  practitioner: Practitioner;
  onSelect: (practitioner: Practitioner) => void;
  matchScore?: number;
  matchReasons?: string[];
}

export const PractitionerCard: React.FC<PractitionerCardProps> = ({ 
  practitioner, 
  onSelect,
  matchScore,
  matchReasons
}) => {
  const [showAvailability, setShowAvailability] = useState(false);
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false);
  const { integrations, loadIntegrations, syncCalendars } = useCalendarIntegration(practitioner.id);
  const { executeIfOnline, isOnline } = useNetworkOperation();
  
  // Use the enhanced loading state hook for calendar sync
  const { 
    state: syncState, 
    setLoading: setSyncLoading, 
    setSuccess: setSyncSuccess, 
    setError: setSyncError,
    reset: resetSyncState 
  } = useLoadingState();

  const handleBooking = () => {
    if (!isOnline) {
      setSyncError("Booking unavailable offline. Please connect to the internet.");
      return;
    }
    onSelect(practitioner);
  };

  const handleSyncCalendars = async () => {
    resetSyncState();
    setSyncLoading();
    
    await executeIfOnline(
      async () => {
        try {
          await syncCalendars(practitioner.id);
          await loadIntegrations(practitioner.id);
          setSyncSuccess();
        } catch (error) {
          setSyncError("Failed to sync calendars. Please try again.");
        }
      },
      () => {
        setSyncError("Calendar sync requires an internet connection");
      }
    );
  };

  const handleViewAvailability = () => {
    if (!isOnline) {
      setSyncError("Availability requires an internet connection");
      return;
    }
    setShowAvailability(true);
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
            {matchScore && (
              <Badge variant="teal" className="mt-1 text-xs">
                {matchScore}% match
              </Badge>
            )}
            {!isOnline && (
              <Badge variant="outline" className="mt-1 text-xs text-muted-foreground">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-modern-gray text-sm">{practitioner.bio}</p>

        {matchReasons && matchReasons.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-modern-dark">Why this is a good match:</p>
            <div className="flex flex-wrap gap-1">
              {matchReasons.slice(0, 3).map((reason, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}

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

        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewAvailability}
                disabled={!isOnline}
                className={!isOnline ? "opacity-50" : ""}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {isOnline ? "View Availability" : "Offline"}
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

          <EnhancedLoadingIndicator
            state={syncState}
            loadingText="Syncing calendars..."
            errorMessage="Sync failed"
            onRetry={handleSyncCalendars}
          >
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSyncCalendars}
              disabled={!isOnline || syncState === "loading"}
              className={!isOnline ? "opacity-50" : ""}
            >
              <Clock className="w-4 h-4 mr-2" />
              {!isOnline ? "Offline" : syncState === "loading" ? "Syncing..." : "Sync Calendars"}
            </Button>
          </EnhancedLoadingIndicator>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowIntegrationDialog(true)}
            disabled={!isOnline}
            className={!isOnline ? "opacity-50" : ""}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isOnline ? "Manage" : "Offline"}
          </Button>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex space-x-1 flex-wrap">
            {integrations.length > 0 ? (
              integrations.map((integration) => (
                <Badge key={integration.id} variant="silver" className="text-xs">
                  {integration.integration_type}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-modern-gray">
                {isOnline ? "No calendar integrations" : "Calendar data unavailable offline"}
              </span>
            )}
          </div>
          
          <Button 
            onClick={handleBooking} 
            className="modern-button"
            disabled={!isOnline}
          >
            {isOnline ? "Book Session" : "Offline - Unavailable"}
          </Button>
        </div>

        {/* Display sync errors */}
        {syncState === "error" && (
          <div className="text-xs text-red-600 dark:text-red-400 mt-2">
            Calendar sync failed. Please check your connection and try again.
          </div>
        )}

        <CalendarIntegrationDialog
          isOpen={showIntegrationDialog && isOnline}
          onClose={() => setShowIntegrationDialog(false)}
          practitionerId={practitioner.id}
          onIntegrationAdded={() => loadIntegrations(practitioner.id)}
        />
      </CardContent>
    </Card>
  );
};
