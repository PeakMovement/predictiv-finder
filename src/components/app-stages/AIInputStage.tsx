
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import EnhancedHealthQueryInput from "@/components/enhanced-input/EnhancedHealthQueryInput";

interface AIInputStageProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

const AIInputStage: React.FC<AIInputStageProps> = ({ onSubmit, isLoading, onBack }) => {
  return (
    <motion.div
      key="ai-input"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="mr-2"
        >
          ←
        </Button>
        <h2 className="text-3xl font-bold">Create Your Custom Health Plan</h2>
      </div>
      <EnhancedHealthQueryInput
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </motion.div>
  );
};

export default AIInputStage;
