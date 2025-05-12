
import React from 'react';
import { MessageCircle } from 'lucide-react';

export const PlanBenefits: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h4 className="font-semibold mb-3 flex items-center">
        <MessageCircle className="h-4 w-4 mr-2 text-health-purple" />
        Plan Benefits
      </h4>
      <ul className="space-y-2">
        <li className="flex items-center text-sm">
          <div className="w-2 h-2 rounded-full bg-health-purple mr-2"></div>
          <span>Personalized to your specific needs</span>
        </li>
        <li className="flex items-center text-sm">
          <div className="w-2 h-2 rounded-full bg-health-purple mr-2"></div>
          <span>Expert practitioners to guide your progress</span>
        </li>
        <li className="flex items-center text-sm">
          <div className="w-2 h-2 rounded-full bg-health-purple mr-2"></div>
          <span>Comprehensive approach targeting all aspects</span>
        </li>
        <li className="flex items-center text-sm">
          <div className="w-2 h-2 rounded-full bg-health-purple mr-2"></div>
          <span>Evidence-based techniques for optimal results</span>
        </li>
      </ul>
    </div>
  );
};
