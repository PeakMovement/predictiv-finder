
import React, { useState } from "react";
import { motion } from "framer-motion";
import AIAssistantInput from "@/components/AIAssistantInput";

interface AIInputStageProps {
  onSubmit: (input: string) => void;
  onError: (errorMessage: string) => void;
}

const AIInputStage: React.FC<AIInputStageProps> = ({
  onSubmit,
  onError
}) => {
  return (
    <motion.div
      key="ai-input"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <AIAssistantInput 
        onSubmit={onSubmit} 
        isLoading={false}
      />
    </motion.div>
  );
};

export default AIInputStage;
