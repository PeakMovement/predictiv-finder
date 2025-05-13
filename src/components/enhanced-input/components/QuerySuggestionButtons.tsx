
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuerySuggestionButtonsProps {
  suggestions: string[];
  onAddSuggestion: (suggestion: string) => void;
  title: string;
}

/**
 * Displays a set of suggestion buttons that can be clicked to add content to the query
 */
const QuerySuggestionButtons: React.FC<QuerySuggestionButtonsProps> = ({ 
  suggestions, 
  onAddSuggestion, 
  title 
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="sm"
            onClick={() => onAddSuggestion(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuerySuggestionButtons;
