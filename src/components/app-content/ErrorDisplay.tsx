
import React from "react";
import { motion } from "framer-motion";

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-red-50 border-l-4 border-red-400 p-4 mb-6"
    >
      <div className="flex">
        <div>
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorDisplay;
