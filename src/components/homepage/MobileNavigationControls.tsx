
import React from 'react';
import { ArrowLeft, Home, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppStage } from '@/types/app';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileNavigationControlsProps {
  stage: AppStage;
  onBack: () => void;
  onStartOver: () => void;
  className?: string;
}

const stageLabels: Record<AppStage, string> = {
  'home': 'Home',
  'category-selector': 'Select Categories',
  'category-questionnaire': 'Health Questionnaire',
  'practitioner-list': 'Find Practitioners',
  'ai-input': 'AI Health Assistant',
  'ai-plans': 'Your Health Plans',
  'plan-details': 'Plan Details'
};

export const MobileNavigationControls: React.FC<MobileNavigationControlsProps> = ({
  stage,
  onBack,
  onStartOver,
  className = ''
}) => {
  const isMobile = useIsMobile();
  
  // Don't show on home page
  if (stage === 'home') {
    return null;
  }

  // Since we return early for 'home', we know stage is never 'home' here
  const canGoBack = true;
  const currentStageLabel = stageLabels[stage] || 'Health Journey';

  if (!isMobile) {
    // Desktop version - compact horizontal layout
    return (
      <div className={`flex items-center justify-between py-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
        <div className="flex items-center gap-2">
          {canGoBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-1"
              aria-label="Go back to previous step"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onStartOver}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          aria-label="Start over from the beginning"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Start Over
        </Button>
      </div>
    );
  }

  // Mobile version - fixed bottom navigation
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t safe-area-padding-bottom ${className}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {canGoBack && (
            <Button
              variant="outline"
              size="default"
              onClick={onBack}
              className="flex items-center gap-2 min-h-[48px] touch-manipulation"
              aria-label="Go back to previous step"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="default"
                className="flex items-center gap-2 min-h-[48px] touch-manipulation"
                aria-label="Open navigation menu"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  You're currently on: {currentStageLabel}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    onStartOver();
                  }}
                  className="w-full flex items-center gap-2 min-h-[48px] touch-manipulation"
                  aria-label="Start over from the beginning"
                >
                  <Home className="h-5 w-5" aria-hidden="true" />
                  Start Over
                </Button>
                
                <div className="text-sm text-muted-foreground text-center">
                  Need help? All your progress is automatically saved.
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Safe area padding for devices with home indicators */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
};

export default MobileNavigationControls;
