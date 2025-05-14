
import React, { useState } from "react";
import { motion } from "framer-motion";
import AIAssistantInput from "@/components/AIAssistantInput";
import { PlanGenerationErrorType } from "@/utils/planGenerator/errorHandling";

interface AIInputStageProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

const AIInputStage: React.FC<AIInputStageProps> = ({
  onSubmit,
  isLoading,
  onBack
}) => {
  const [inputError, setInputError] = useState<{
    type: PlanGenerationErrorType;
    message: string;
  } | null>(null);

  const handleError = (type: PlanGenerationErrorType, message: string) => {
    setInputError({ type, message });
  };

  const handleSubmit = (input: string) => {
    setInputError(null);
    onSubmit(input);
  };

  return (
    <motion.div
      key="ai-input"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <AIAssistantInput 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
        onError={handleError}
      />
    </motion.div>
  );
};

export default AIInputStage;
