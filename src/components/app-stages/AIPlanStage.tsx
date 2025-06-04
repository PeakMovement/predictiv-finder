
import React from "react";
import { motion } from "framer-motion";
import { AIHealthPlan } from "@/types";
import SafeAIPlansDisplay from "@/components/AIPlansDisplay/SafeAIPlansDisplay";

interface AIPlanStageProps {
  userQuery: string;
  onSelectPlan: (plan: AIHealthPlan) => void;
  onError: (errorMessage: string) => void;
}

const AIPlanStage: React.FC<AIPlanStageProps> = ({
  userQuery,
  onSelectPlan,
  onError
}) => {
  return (
    <motion.div
      key="ai-plans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <SafeAIPlansDisplay 
        plans={[]}
        userInput={userQuery}
        onSelectPlan={onSelectPlan}
        onBack={() => {}}
        isLoading={false}
      />
    </motion.div>
  );
};

export default AIPlanStage;
