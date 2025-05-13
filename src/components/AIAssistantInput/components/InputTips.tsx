
import React from 'react';

interface InputTipsProps {
  tipItems: string[];
}

/**
 * Displays tips for better AI assistant input
 */
const InputTips: React.FC<InputTipsProps> = ({ tipItems }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
      <h3 className="font-medium text-sm mb-2 text-health-purple">Tips for better results:</h3>
      <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300">
        {tipItems.map((tip, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-health-teal mt-0.5">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InputTips;
