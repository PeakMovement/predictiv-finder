
import React from "react";
import { motion } from "framer-motion";
import { DetailedUserCriteria, Practitioner } from "@/types";
import PractitionerList from "@/components/PractitionerList";

interface PractitionerViewProps {
  practitioners: Practitioner[];
  criteria: DetailedUserCriteria;
  onSelectPractitioner: (practitioner: Practitioner) => void;
  onBack: () => void;
  onAIAssistant: () => void;
}

const PractitionerView: React.FC<PractitionerViewProps> = ({
  practitioners,
  criteria,
  onSelectPractitioner,
  onBack,
  onAIAssistant
}) => {
  return (
    <motion.div
      key="practitioner-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-8"
    >
      <PractitionerList 
        practitioners={practitioners}
        criteria={criteria}
        onSelectPractitioner={onSelectPractitioner}
        onBack={onBack}
        onAIAssistant={onAIAssistant}
      />
    </motion.div>
  );
};

export default PractitionerView;
