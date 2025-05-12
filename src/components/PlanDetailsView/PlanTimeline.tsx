
import React from 'react';
import { Info } from 'lucide-react';
import { AIHealthPlan } from '@/types';

interface PlanTimelineProps {
  plan: AIHealthPlan;
}

export const PlanTimeline: React.FC<PlanTimelineProps> = ({ plan }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h4 className="font-semibold mb-3 flex items-center">
        <Info className="h-4 w-4 mr-2 text-health-teal" />
        Your Journey Timeline
      </h4>
      <div className="space-y-3">
        {plan.progressTimeline ? (
          plan.progressTimeline.slice(0, 3).map((milestone, idx) => (
            <div key={idx} className="flex items-center">
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                  {milestone.week}
                </div>
                {idx < 2 && <div className="absolute top-6 left-3 w-px h-12 bg-gray-200 dark:bg-gray-700"></div>}
              </div>
              <div className="ml-3">
                <p className="font-medium text-sm">{milestone.milestone}</p>
                <p className="text-xs text-gray-500">{milestone.focus}</p>
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">1</div>
              <div className="ml-3">
                <p className="font-medium text-sm">Initial Assessment</p>
                <p className="text-xs text-gray-500">Establish baseline and goals</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute left-3 w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                {Math.floor(parseInt(plan.timeFrame.split(' ')[0]) / 2)}
              </div>
              <div className="ml-3">
                <p className="font-medium text-sm">Mid-point Review</p>
                <p className="text-xs text-gray-500">Progress evaluation and adjustments</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
