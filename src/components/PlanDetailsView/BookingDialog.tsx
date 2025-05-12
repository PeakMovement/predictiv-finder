
import React, { useState } from 'react';
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
  
  const { isAuthenticated } = useAuth();
  const { bookHealthPlan, isBooking } = useBookingService();
  const { toast } = useToast();

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
      // Show login modal if user is not authenticated
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Your First Appointment</DialogTitle>
            <DialogDescription>
              Select which specialist you'd like to see first, and choose a convenient date and time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label htmlFor="service" className="text-sm font-medium">
                Select a Service
              </label>
              <Select
                value={selectedService || ""}
                onValueChange={setSelectedService}
              >
                <SelectTrigger className="w-full">
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select a Date
              </label>
              <div className="border rounded-md p-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => {
                    // Disable past dates and weekends
                    return (
                      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                      date.getDay() === 0 ||
                      date.getDay() === 6
                    );
                  }}
                  initialFocus
                  className="rounded-md border pointer-events-auto"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select a Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className="text-center"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBooking}
              disabled={isBooking} 
              className="bg-health-purple hover:bg-health-purple-dark"
            >
              {isBooking ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};
