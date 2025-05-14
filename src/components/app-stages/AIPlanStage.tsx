
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AIHealthPlan } from "@/types";
import SafeAIPlansDisplay from "@/components/AIPlansDisplay/SafeAIPlansDisplay";

interface AIPlanStageProps {
  plans: AIHealthPlan[];
  userInput: string;
  isLoading: boolean;
  onSelectPlan: (plan: AIHealthPlan) => void;
  onBack: () => void;
  onCompare: () => void;
}

const AIPlanStage: React.FC<AIPlanStageProps> = ({
  plans,
  userInput,
  isLoading,
  onSelectPlan,
  onBack,
  onCompare
}) => {
  return (
    <motion.div
      key="ai-plans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={onCompare}
          className="ml-auto block"
        >
          Compare Plans
        </Button>
      </div>
      <SafeAIPlansDisplay 
        plans={plans}
        userInput={userInput}
        onSelectPlan={onSelectPlan}
        onBack={onBack}
        isLoading={isLoading}
      />
    </motion.div>
  );
};

export default AIPlanStage;
