
import React from 'react';
import { Button } from "@/components/ui/button";
import { AppStage } from "@/types/app";

interface NavigationControlsProps {
  stage: AppStage;
  onBack: () => void;
  onStartOver: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({ stage, onBack, onStartOver }) => {
  return (
    <div className="fixed bottom-4 right-4 flex gap-2">
      <Button 
        variant="outline"
        onClick={onStartOver}
        className="bg-white/90 dark:bg-gray-800/90"
      >
        Start Over
      </Button>
      {stage !== 'home' && (
        <Button 
          variant="outline"
          onClick={onBack}
          className="bg-white/90 dark:bg-gray-800/90"
        >
          Go Back
        </Button>
      )}
    </div>
  );
};

export default NavigationControls;
