
import React from 'react';
import { Button } from '@/components/ui/button';

interface PromptExample {
  title: string;
  content: string;
  icon: React.ReactNode;
}

interface ExamplePromptsProps {
  examples: PromptExample[];
  onExampleClick: (example: string) => void;
}

/**
 * Displays clickable example prompts for the AI assistant
 */
const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ examples, onExampleClick }) => {
  return (
    <div>
      <h3 className="font-medium text-sm mb-2">Try an example:</h3>
      <div className="space-y-2">
        {examples.map((example, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start text-left h-auto py-2 px-3"
            onClick={() => onExampleClick(example.content)}
          >
            <div className="flex items-center gap-2">
              <div className="text-health-purple">{example.icon}</div>
              <div className="truncate">{example.title}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ExamplePrompts;
