
import React from 'react';
import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface InputAnalysisDisplayProps {
  analysis: {
    medicalConditions: string[];
    suggestedCategories: string[];
    budget?: number;
    location?: string;
    preferOnline?: boolean;
  } | null;
}

/**
 * Displays real-time analysis of user input
 */
const InputAnalysisDisplay: React.FC<InputAnalysisDisplayProps> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-health-purple">Our Analysis</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Info className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <p className="text-sm">This shows what our AI has detected from your input. We'll use this to create your custom plan.</p>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {analysis.medicalConditions.length > 0 && (
          <div>
            <span className="font-semibold block">Detected conditions:</span>
            <span className="text-gray-600 dark:text-gray-300">
              {analysis.medicalConditions.join(', ')}
            </span>
          </div>
        )}
        {analysis.suggestedCategories.length > 0 && (
          <div>
            <span className="font-semibold block">Suggested specialists:</span>
            <span className="text-gray-600 dark:text-gray-300">
              {analysis.suggestedCategories.map(cat => cat.replace('-', ' ')).join(', ')}
            </span>
          </div>
        )}
        {analysis.budget && (
          <div>
            <span className="font-semibold block">Detected budget:</span>
            <span className="text-gray-600 dark:text-gray-300">R{analysis.budget}/month</span>
          </div>
        )}
        {analysis.location && (
          <div>
            <span className="font-semibold block">Location:</span>
            <span className="text-gray-600 dark:text-gray-300">{analysis.location}</span>
          </div>
        )}
        {analysis.preferOnline !== undefined && (
          <div>
            <span className="font-semibold block">Preference:</span>
            <span className="text-gray-600 dark:text-gray-300">
              {analysis.preferOnline ? 'Online sessions' : 'In-person sessions'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputAnalysisDisplay;
