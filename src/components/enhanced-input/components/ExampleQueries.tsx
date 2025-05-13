
import React from 'react';
import { Button } from '@/components/ui/button';

interface ExampleQuery {
  text: string;
  buttonText?: string;
}

interface ExampleQueriesProps {
  examples: ExampleQuery[];
  onUseExample: (example: string) => void;
}

/**
 * Displays example queries that users can select to populate their input
 */
const ExampleQueries: React.FC<ExampleQueriesProps> = ({ examples, onUseExample }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-md">
      <h3 className="text-lg font-medium mb-4">Example Queries</h3>
      <div className="space-y-3">
        {examples.map((example, index) => (
          <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <p className="text-sm italic mb-1">{example.text}</p>
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => onUseExample(example.text)}
              >
                {example.buttonText || "Use this example"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExampleQueries;
