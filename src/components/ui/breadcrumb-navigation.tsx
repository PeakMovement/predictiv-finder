
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppStage } from '@/types/app';

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
  const breadcrumbPath = stageFlow[currentStage] || ['home'];

  if (currentStage === 'home') {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground mb-4 ${className}`} aria-label="Breadcrumb">
      <Home className="h-4 w-4" />
      {breadcrumbPath.map((stage, index) => {
        const config = stageBreadcrumbs[stage];
        const isLast = index === breadcrumbPath.length - 1;
        const isNavigable = config.navigable && !isLast;

        return (
          <React.Fragment key={stage}>
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
            {isNavigable ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(stage)}
                className="h-auto p-1 font-normal hover:text-foreground"
                title={config.description}
              >
                {config.label}
              </Button>
            ) : (
              <span className={isLast ? 'text-foreground font-medium' : ''} title={config.description}>
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
