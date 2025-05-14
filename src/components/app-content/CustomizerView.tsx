
import React from "react";
import { motion } from "framer-motion";
import { AIHealthPlan } from "@/types";
import PlanCustomizer from "@/components/plan-customizer/PlanCustomizer";

interface CustomizerViewProps {
  plan: AIHealthPlan;
  onSave: (plan: AIHealthPlan) => void;
  onCancel: () => void;
}

const CustomizerView: React.FC<CustomizerViewProps> = ({
  plan,
  onSave,
  onCancel
}) => {
  return (
    <motion.div
      key="plan-customizer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <PlanCustomizer 
        plan={plan}
        onUpdatePlan={(plan) => {}}
        onSave={onSave}
        onCancel={onCancel}
      />
    </motion.div>
  );
};

export default CustomizerView;
