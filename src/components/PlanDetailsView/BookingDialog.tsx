
import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/context/AuthContext';
import { useBookingService } from '@/services/booking-service';
import { AIHealthPlan, ServiceCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/auth/LoginModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: AIHealthPlan;
}

export const BookingDialog: React.FC<BookingDialogProps> = ({ open, onOpenChange, plan }) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  
  const { isAuthenticated } = useAuth();
  const { bookHealthPlan, isBooking } = useBookingService();
  const { toast } = useToast();

  // Focus management for accessibility
  useEffect(() => {
    if (open && firstFocusableRef.current) {
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Available time slots for booking
  const timeSlots = [
    "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
  ];

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select a service, date and time to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    const selectedDates = new Map();
    selectedDates.set(selectedService, { date: selectedDate, time: selectedTime });
    
    const success = await bookHealthPlan(plan, selectedDates);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="sm:max-w-md max-h-[90vh] overflow-y-auto"
          aria-describedby="booking-description"
        >
          <DialogHeader>
            <DialogTitle id="booking-title">Book Your First Appointment</DialogTitle>
            <DialogDescription id="booking-description">
              Select which specialist you'd like to see first, and choose a convenient date and time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 sm:space-y-6 py-4">
            <div className="space-y-2">
              <label 
                htmlFor="service-select" 
                className="text-sm font-medium block"
                id="service-label"
              >
                Select a Service <span className="text-red-500" aria-label="required">*</span>
              </label>
              <Select
                value={selectedService || ""}
                onValueChange={setSelectedService}
                required
                aria-labelledby="service-label"
                aria-describedby="service-help"
              >
                <SelectTrigger 
                  className="w-full min-h-[44px]"
                  ref={firstFocusableRef}
                  id="service-select"
                >
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {plan.services.map((service) => (
                    <SelectItem key={service.type} value={service.type}>
                      {service.type.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div id="service-help" className="text-xs text-muted-foreground">
                Choose the type of appointment you'd like to book first
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block" id="date-label">
                Select a Date <span className="text-red-500" aria-label="required">*</span>
              </label>
              <div className="border rounded-md p-1 bg-background">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    return (
                      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                      date.getDay() === 0 ||
                      date.getDay() === 6
                    );
                  }}
                  initialFocus
                  className="rounded-md border-0"
                  aria-labelledby="date-label"
                  aria-describedby="date-help"
                />
              </div>
              <div id="date-help" className="text-xs text-muted-foreground">
                Available weekdays only. Weekends are not available for appointments.
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium block" id="time-label">
                Select a Time <span className="text-red-500" aria-label="required">*</span>
              </label>
              <div 
                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                role="radiogroup"
                aria-labelledby="time-label"
                aria-describedby="time-help"
              >
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className="text-center min-h-[44px] touch-manipulation"
                    role="radio"
                    aria-checked={selectedTime === time}
                    aria-label={`Select ${time} appointment time`}
                  >
                    {time}
                  </Button>
                ))}
              </div>
              <div id="time-help" className="text-xs text-muted-foreground">
                All times are in your local timezone
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto min-h-[44px]"
              aria-label="Cancel booking and close dialog"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBooking}
              disabled={isBooking || !selectedService || !selectedDate || !selectedTime} 
              className="w-full sm:w-auto bg-health-purple hover:bg-health-purple-dark min-h-[44px]"
              aria-label={isBooking ? "Processing your booking request" : "Confirm and create booking"}
              aria-describedby="booking-status"
            >
              {isBooking ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
          
          <div id="booking-status" className="sr-only" aria-live="polite">
            {isBooking ? "Your booking is being processed" : ""}
          </div>
        </DialogContent>
      </Dialog>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};
