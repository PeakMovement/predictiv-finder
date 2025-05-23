
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UtilityModelExplanationProps {
  expanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

export const UtilityModelExplanation: React.FC<UtilityModelExplanationProps> = ({
  expanded = false,
  onToggleExpand,
  className = ''
}) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Health Plan Optimization Model</h3>
          {onToggleExpand && (
            <button 
              onClick={onToggleExpand}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {expanded ? 'Show less' : 'Learn more'}
            </button>
          )}
        </div>

        <Alert variant="default" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50">
          <AlertTitle>Your plan is mathematically optimized for maximum benefit</AlertTitle>
          <AlertDescription className="text-sm">
            We use a utility maximization approach to create the most effective plan within your budget and time constraints.
          </AlertDescription>
        </Alert>

        {expanded && (
          <Tabs defaultValue="formula">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="formula">The Formula</TabsTrigger>
              <TabsTrigger value="constraints">Constraints</TabsTrigger>
              <TabsTrigger value="example">Example</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formula" className="pt-4 space-y-3">
              <div className="font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
                <p>maximize Total Utility = ∑(u_i × x_i)</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Where:</p>
                <ul className="text-sm list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                  <li>x_i = number of sessions of treatment i per month</li>
                  <li>u_i = expected utility (benefit) per session of treatment i</li>
                  <li>c_i = cost per session of treatment i</li>
                  <li>t_i = time per session of treatment i</li>
                </ul>
              </div>
              
              <p className="text-sm">
                This formula finds the optimal number of sessions for each treatment to give you the maximum health benefit within your constraints.
              </p>
            </TabsContent>
            
            <TabsContent value="constraints" className="pt-4 space-y-3">
              <div className="font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto">
                <p>Subject to:</p>
                <ul className="pl-5 space-y-2 mt-2">
                  <li>∑(c_i × x_i) ≤ Your Budget</li>
                  <li>∑(t_i × x_i) ≤ Your Available Time</li>
                  <li>Min_i ≤ x_i ≤ Max_i for all treatments i</li>
                  <li>x_i ∈ ℤ≥0 (only whole sessions allowed)</li>
                </ul>
              </div>
              
              <div className="text-sm space-y-2">
                <p>
                  <strong>Additional considerations:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Urgency increases the utility value of relevant treatments</li>
                  <li>Sessions with better utility-to-cost ratios are prioritized</li>
                  <li>A diversity factor ensures a balanced approach across different treatments</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="example" className="pt-4 space-y-3">
              <div className="text-sm">
                <p className="font-medium mb-2">Example Scenario:</p>
                
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-3">
                  <p>Monthly budget: R5000</p>
                  <p>Available time: 10 hours per month</p>
                  <p>Goal: Recover from back pain</p>
                </div>
                
                <p className="font-medium mt-4 mb-1">Treatment Options:</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Treatment</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Utility/Session</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Cost/Session</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Time (min)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="px-3 py-2 text-xs">Physiotherapy</td>
                        <td className="px-3 py-2 text-xs">8</td>
                        <td className="px-3 py-2 text-xs">R600</td>
                        <td className="px-3 py-2 text-xs">60</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-xs">Massage</td>
                        <td className="px-3 py-2 text-xs">5</td>
                        <td className="px-3 py-2 text-xs">R450</td>
                        <td className="px-3 py-2 text-xs">60</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 text-xs">GP Visit</td>
                        <td className="px-3 py-2 text-xs">6</td>
                        <td className="px-3 py-2 text-xs">R500</td>
                        <td className="px-3 py-2 text-xs">20</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <p className="font-medium mt-4 mb-1">Optimal Solution:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>4 Physiotherapy sessions (R2400, 4 hours, Utility: 32)</li>
                  <li>3 Massage sessions (R1350, 3 hours, Utility: 15)</li>
                  <li>1 GP visit (R500, 20 min, Utility: 6)</li>
                  <li><strong>Total:</strong> R4250, 7.3 hours, Total Utility: 53</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Card>
  );
};

export default UtilityModelExplanation;
