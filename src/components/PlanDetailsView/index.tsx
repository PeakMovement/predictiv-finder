
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AIHealthPlan } from '@/types';
import { PlanHeader } from './PlanHeader';
import { PlanSummary } from './PlanSummary';
import { PlanBenefits } from './PlanBenefits';
import { PlanTimeline } from './PlanTimeline';
import { TreatmentSchedule } from './TreatmentSchedule';
import { BookingDialog } from './BookingDialog';

interface PlanDetailsViewProps {
  plan: AIHealthPlan;
  userQuery: string;
  onBack: () => void;
}

const PlanDetailsView: React.FC<PlanDetailsViewProps> = ({ plan, userQuery, onBack }) => {
  const [bookingOpen, setBookingOpen] = useState(false);
  
  const handleOpenBooking = () => {
    setBookingOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="mr-2"
        >
          ←
        </Button>
        <h2 className="text-2xl font-semibold">Your Personalized Wellness Journey</h2>
      </div>
      
      {/* Plan Header with basic information */}
      <PlanHeader plan={plan} userQuery={userQuery} />
      
      {/* Plan Benefits, Timeline, Summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PlanBenefits />
        <PlanTimeline plan={plan} />
        <PlanSummary />
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Your Treatment Schedule</h3>
      
      {/* Treatment Schedule */}
      <TreatmentSchedule plan={plan} />
      
      <div className="mt-8 flex justify-center">
        <Button 
          onClick={handleOpenBooking}
          className="bg-health-purple hover:bg-health-purple-dark"
          size="lg"
        >
          Confirm & Book This Plan
        </Button>
      </div>

      {/* Booking Dialog */}
      <BookingDialog 
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        plan={plan}
      />
    </motion.div>
  );
};

export default PlanDetailsView;
