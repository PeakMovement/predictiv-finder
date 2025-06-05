
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AIHealthPlan } from "@/types";
import SafeAIPlansDisplay from "@/components/AIPlansDisplay/SafeAIPlansDisplay";
import { useAIPlansService } from "@/services/ai-plans-service";

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
  const { aiPlans, isGenerating, error, generateAIPlans } = useAIPlansService();
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    // Generate plans when the component mounts if we have a query and haven't generated yet
    if (userQuery && !hasGenerated && aiPlans.length === 0) {
      console.log("Generating AI plans for query:", userQuery);
      generateAIPlans(userQuery);
      setHasGenerated(true);
    }
  }, [userQuery, hasGenerated, aiPlans.length, generateAIPlans]);

  useEffect(() => {
    // Pass any errors up to the parent component
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  return (
    <motion.div
      key="ai-plans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <SafeAIPlansDisplay 
        plans={aiPlans}
        userInput={userQuery}
        onSelectPlan={onSelectPlan}
        onBack={() => {}}
        isLoading={isGenerating}
      />
    </motion.div>
  );
};

export default AIPlanStage;
