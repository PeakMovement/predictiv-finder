
import React from 'react';
import { Lightbulb } from 'lucide-react';

interface InputTipsProps {
  tipItems: string[];
}

const InputTips: React.FC<InputTipsProps> = ({ tipItems }) => {
  return (
    <div className="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
      <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
        <Lightbulb className="w-4 h-4" />
        <h3 className="font-medium">Tips for better results</h3>
      </div>
      
      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        {tipItems.map((tip, index) => (
          <li key={index} className="flex items-start">
            <span className="mr-2">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InputTips;
