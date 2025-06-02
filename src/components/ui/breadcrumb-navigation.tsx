
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppStage } from '@/types/app';
import { useIsMobile } from '@/hooks/use-mobile';

interface BreadcrumbNavigationProps {
  currentStage: AppStage;
  onNavigate: (stage: AppStage) => void;
  className?: string;
}

const stageBreadcrumbs: Record<AppStage, { label: string; navigable: boolean; description?: string }> = {
  'home': { label: 'Home', navigable: true },
  'category-selector': { label: 'Categories', navigable: true, description: 'Select health categories' },
  'category-questionnaire': { label: 'Questionnaire', navigable: false, description: 'Answer health questions' },
  'practitioner-list': { label: 'Practitioners', navigable: false, description: 'Browse professionals' },
  'ai-input': { label: 'AI Assistant', navigable: true, description: 'Describe your health needs' },
  'ai-plans': { label: 'Health Plans', navigable: false, description: 'Review generated plans' },
  'plan-details': { label: 'Plan Details', navigable: false, description: 'View plan specifics' }
};

const stageFlow: Record<AppStage, AppStage[]> = {
  'home': ['home'],
  'category-selector': ['home', 'category-selector'],
  'category-questionnaire': ['home', 'category-selector', 'category-questionnaire'],
  'practitioner-list': ['home', 'category-selector', 'category-questionnaire', 'practitioner-list'],
  'ai-input': ['home', 'ai-input'],
  'ai-plans': ['home', 'ai-input', 'ai-plans'],
  'plan-details': ['home', 'ai-input', 'ai-plans', 'plan-details']
};

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  currentStage,
  onNavigate,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const breadcrumbPath = stageFlow[currentStage] || ['home'];

  if (currentStage === 'home') {
    return null;
  }

  // On mobile, show only current and previous step for space
  const displayPath = isMobile && breadcrumbPath.length > 2 
    ? breadcrumbPath.slice(-2) 
    : breadcrumbPath;

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm text-muted-foreground mb-4 p-2 sm:p-0 ${className}`} 
      aria-label="Breadcrumb navigation"
      role="navigation"
    >
      <Home 
        className="h-4 w-4 flex-shrink-0" 
        aria-hidden="true"
      />
      
      {isMobile && breadcrumbPath.length > 2 && (
        <>
          <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" aria-hidden="true" />
          <span className="text-muted-foreground" aria-label="Previous steps">...</span>
        </>
      )}
      
      {displayPath.map((stage, index) => {
        const config = stageBreadcrumbs[stage];
        const isLast = index === displayPath.length - 1;
        const isNavigable = config.navigable && !isLast;
        const actualIndex = isMobile && breadcrumbPath.length > 2 
          ? breadcrumbPath.length - displayPath.length + index 
          : index;

        return (
          <React.Fragment key={stage}>
            {(actualIndex > 0 || (isMobile && breadcrumbPath.length > 2 && index > 0)) && (
              <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" aria-hidden="true" />
            )}
            {isNavigable ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(stage)}
                className="h-auto p-1 font-normal hover:text-foreground min-h-[44px] sm:min-h-auto touch-manipulation"
                title={config.description}
                aria-label={`Navigate to ${config.label}${config.description ? `: ${config.description}` : ''}`}
              >
                <span className="truncate max-w-[100px] sm:max-w-none">
                  {config.label}
                </span>
              </Button>
            ) : (
              <span 
                className={`truncate max-w-[120px] sm:max-w-none ${isLast ? 'text-foreground font-medium' : ''}`} 
                title={config.description}
                aria-current={isLast ? 'page' : undefined}
                aria-label={isLast ? `Current page: ${config.label}` : config.label}
              >
                {config.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNavigation;
