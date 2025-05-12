
import React from 'react';
import { AlertCircle } from 'lucide-react';

export const PlanSummary: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h4 className="font-semibold mb-3 flex items-center">
        <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
        Important Notes
      </h4>
      <div className="space-y-2 text-sm">
        <p>• Regular attendance is key to achieving optimal results</p>
        <p>• Please arrive 10 minutes early for your first session</p>
        <p>• Cancellations require 24-hour notice to avoid fees</p>
        <p>• Progress tracking will help adjust your plan as needed</p>
      </div>
    </div>
  );
};
