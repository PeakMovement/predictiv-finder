
import React from "react";
import { motion } from "framer-motion";
import { AIHealthPlan } from "@/types";
import ProgressTrackingView from "@/components/progress-tracking/ProgressTrackingView";

interface ProgressViewProps {
  plan: AIHealthPlan;
  onBack: () => void;
}

const ProgressView: React.FC<ProgressViewProps> = ({
  plan,
  onBack
}) => {
  return (
    <motion.div
      key="progress-tracking"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <ProgressTrackingView 
        plan={plan}
        onBack={onBack}
      />
    </motion.div>
  );
};

export default ProgressView;
