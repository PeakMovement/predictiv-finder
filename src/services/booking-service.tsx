
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Practitioner, AIHealthPlan } from '@/types';

export function useBookingService() {
  const [isBooking, setIsBooking] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();

  /**
   * Handle booking a session with a practitioner
   */
  const bookPractitionerSession = async (
    practitioner: Practitioner, 
    selectedDate: Date, 
    selectedTime: string,
    plan?: AIHealthPlan
  ) => {
    setIsBooking(true);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setIsBooking(false);
      toast({
        title: "Authentication required",
        description: "Please sign in to book a session",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Here you would typically call your API to create a booking
      // For now, we'll simulate a successful booking

      // In a real implementation, this would send an email to the practitioner
      console.log('Booking session with:', practitioner);
      console.log('Date and time:', selectedDate, selectedTime);
      console.log('User:', currentUser?.email);
      console.log('Plan details:', plan);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Booking request sent",
        description: `${practitioner.name} will receive your booking request for ${selectedTime} on ${selectedDate.toLocaleDateString()}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Booking failed",
        description: "There was a problem processing your booking. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsBooking(false);
    }
  };

  /**
   * Handle booking a complete health plan
   */
  const bookHealthPlan = async (plan: AIHealthPlan, selectedDates: Map<string, { date: Date, time: string }>) => {
    setIsBooking(true);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setIsBooking(false);
      toast({
        title: "Authentication required",
        description: "Please sign in to book a health plan",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // In a real implementation, this would create multiple bookings and send emails
      console.log('Booking complete health plan:', plan);
      console.log('Selected dates:', Object.fromEntries(selectedDates));
      console.log('User:', currentUser?.email);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Health plan booked",
        description: `Your personalized health plan has been scheduled. You'll receive confirmation emails shortly.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error booking health plan:', error);
      toast({
        title: "Booking failed",
        description: "There was a problem processing your health plan booking. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsBooking(false);
    }
  };
  
  return {
    bookPractitionerSession,
    bookHealthPlan,
    isBooking,
  };
}
