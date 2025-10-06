
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
    <div className="fixed bottom-4 right-4 flex gap-2 safe-area-padding-bottom">
      <Button 
        variant="outline"
        onClick={onStartOver}
      >
        Start Over
      </Button>
      {stage !== 'home' && (
        <Button 
          variant="outline"
          onClick={onBack}
        >
          Go Back
        </Button>
      )}
    </div>
  );
};

export default NavigationControls;
