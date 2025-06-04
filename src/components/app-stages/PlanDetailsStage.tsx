
import React from "react";
import { motion } from "framer-motion";
import { AIHealthPlan } from "@/types";
import PlanDetailsView from "@/components/PlanDetailsView";

interface PlanDetailsStageProps {
  plan: AIHealthPlan | null;
  userQuery: string;
  onError: (errorMessage: string) => void;
}

const PlanDetailsStage: React.FC<PlanDetailsStageProps> = ({
  plan,
  userQuery,
  onError
}) => {
  if (!plan) {
    return (
      <motion.div
        key="plan-details"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="py-8"
      >
        <div className="text-center">
          <p>No plan selected. Please go back and select a plan.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="plan-details"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <PlanDetailsView 
        plan={plan}
        userQuery={userQuery}
        onBack={() => {}}
      />
    </motion.div>
  );
};

export default PlanDetailsStage;
