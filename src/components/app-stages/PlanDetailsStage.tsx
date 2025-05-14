
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AIHealthPlan } from "@/types";
import PlanDetailsView from "@/components/PlanDetailsView";

interface PlanDetailsStageProps {
  plan: AIHealthPlan;
  userQuery: string;
  onBack: () => void;
  onCustomize: () => void;
  onTrackProgress: () => void;
}

const PlanDetailsStage: React.FC<PlanDetailsStageProps> = ({
  plan,
  userQuery,
  onBack,
  onCustomize,
  onTrackProgress
}) => {
  return (
    <motion.div
      key="plan-details"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <div className="mb-6">
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onTrackProgress}
          >
            View Progress Tracking
          </Button>
          <Button 
            onClick={onCustomize}
            className="bg-health-purple hover:bg-health-purple-dark"
          >
            Customize Plan
          </Button>
        </div>
      </div>
      <PlanDetailsView 
        plan={plan}
        userQuery={userQuery}
        onBack={onBack}
      />
    </motion.div>
  );
};

export default PlanDetailsStage;
