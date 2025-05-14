
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  onBack: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="flex items-center gap-2 mb-4"
      >
        <ArrowLeft size={16} />
        Back
      </Button>
      
      <Card className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">No Health Plans Available</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          We couldn't generate any health plans based on your input. Please try providing more details.
        </p>
        <Button onClick={onBack}>Go Back</Button>
      </Card>
    </div>
  );
};

export default EmptyState;
