
import React from 'react';
import { Check, X } from 'lucide-react';
import { AnalysisProps } from '../AIAssistantInput';

const InputAnalysisDisplay: React.FC<AnalysisProps> = ({ analysis }) => {
  // Ensure we have services to display
  const hasServices = analysis.suggestedCategories && analysis.suggestedCategories.length > 0;
  const hasConditions = analysis.medicalConditions && analysis.medicalConditions.length > 0;
  const hasGoals = analysis.specificGoals && analysis.specificGoals.length > 0;
  
  // Format budget for display
  const formattedBudget = analysis.budget ? 
    new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR',
      maximumFractionDigits: 0 
    }).format(analysis.budget) : 
    'Not specified';

  return (
    <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Analysis Preview</h3>
      
      <div className="mt-2 space-y-3 text-sm">
        {analysis.primaryIssue && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Primary concern:</span>{' '}
            <span className="text-health-purple font-medium">{analysis.primaryIssue}</span>
          </div>
        )}
        
        {hasConditions && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Identified conditions:</span>{' '}
            <span>{analysis.medicalConditions.join(', ')}</span>
          </div>
        )}
        
        {hasGoals && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Goals:</span>{' '}
            <span>{analysis.specificGoals.join(', ')}</span>
          </div>
        )}
        
        {hasServices && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Recommended services:</span>{' '}
            <span>{analysis.suggestedCategories.map(cat => cat.replace('-', ' ')).join(', ')}</span>
          </div>
        )}
        
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">Budget:</span>{' '}
          <span>{formattedBudget}</span>
        </div>
        
        {analysis.timeAvailability && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Timeframe:</span>{' '}
            <span>~{analysis.timeAvailability} weeks</span>
          </div>
        )}
        
        {analysis.locationInfo && (
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Location preference:</span>{' '}
            <span>
              {analysis.locationInfo.location || 'Not specified'} 
              {analysis.locationInfo.isRemote ? ' (Remote options preferred)' : ''}
            </span>
          </div>
        )}
        
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center">
          {analysis.hasEnoughInformation ? (
            <div className="flex items-center text-green-600 dark:text-green-500">
              <Check className="w-4 h-4 mr-1" />
              <span>Sufficient information for recommendations</span>
            </div>
          ) : (
            <div className="flex items-center text-amber-600 dark:text-amber-500">
              <X className="w-4 h-4 mr-1" />
              <span>More details would improve your recommendations</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputAnalysisDisplay;
