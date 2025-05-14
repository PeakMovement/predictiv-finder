
import React from "react";
import { motion } from "framer-motion";
import { AIHealthPlan } from "@/types";
import PlanComparisonView from "@/components/plan-comparison/PlanComparisonView";

interface ComparisonViewProps {
  plans: AIHealthPlan[];
  onSelectPlan: (plan: AIHealthPlan) => void;
  onBack: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({
  plans,
  onSelectPlan,
  onBack
}) => {
  return (
    <motion.div
      key="plan-comparison"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <PlanComparisonView 
        plans={plans}
        onSelectPlan={onSelectPlan}
        onBack={onBack}
      />
    </motion.div>
  );
};

export default ComparisonView;
