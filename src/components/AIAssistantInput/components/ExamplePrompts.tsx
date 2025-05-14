
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExamplePromptsProps } from '../AIAssistantInput';

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ examples, onExampleClick }) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Example queries
      </h3>
      
      <div className="space-y-2">
        {examples.map((example, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start text-left h-auto py-2 px-3"
            onClick={() => onExampleClick(example.content)}
          >
            <div className="flex items-center">
              {example.icon && <span className="mr-2">{example.icon}</span>}
              <span className="truncate">{example.title}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ExamplePrompts;
