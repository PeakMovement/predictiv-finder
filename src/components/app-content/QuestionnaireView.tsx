
import React from "react";
import { motion } from "framer-motion";
import { ServiceCategory, DetailedUserCriteria } from "@/types";
import CategoryQuestionnaire from "@/components/CategoryQuestionnaire";

interface QuestionnaireViewProps {
  categories: ServiceCategory[];
  onSubmit: (criteria: DetailedUserCriteria) => void;
  onBack: () => void;
}

const QuestionnaireView: React.FC<QuestionnaireViewProps> = ({
  categories,
  onSubmit,
  onBack
}) => {
  return (
    <motion.div
      key="questionnaire"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <CategoryQuestionnaire 
        categories={categories}
        onSubmit={onSubmit}
        onBack={onBack}
      />
    </motion.div>
  );
};

export default QuestionnaireView;
