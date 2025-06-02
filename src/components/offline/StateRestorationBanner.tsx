
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X, Clock, User, Target, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppStage } from '@/types/app';
import { ServiceCategory } from '@/types';

interface StateRestorationBannerProps {
  onRestore: () => void;
  onDismiss: () => void;
  persistedState: {
    stage: AppStage;
    selectedCategories: ServiceCategory[];
    userQuery: string;
    timestamp: number;
  };
}

/**
 * Banner that appears when offline state can be restored
 */
export const StateRestorationBanner: React.FC<StateRestorationBannerProps> = ({
  onRestore,
  onDismiss,
  persistedState
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const formatTimestamp = (ts: number) => {
    const now = Date.now();
    const diff = now - ts;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };

  const getStageDescription = (stage: AppStage) => {
    switch (stage) {
      case 'category-selector':
        return 'Category selection';
      case 'category-questionnaire':
        return 'Health questionnaire';
      case 'practitioner-list':
        return 'Practitioner recommendations';
      case 'ai-input':
        return 'AI health assistant';
      case 'ai-plans':
        return 'AI-generated plans';
      case 'plan-details':
        return 'Plan details';
      default:
        return 'Previous session';
    }
  };

  const getDataPreview = () => {
    const items = [];
    
    if (persistedState.selectedCategories.length > 0) {
      items.push({
        icon: <Target className="h-3 w-3" />,
        text: `${persistedState.selectedCategories.length} categories selected`
      });
    }
    
    if (persistedState.userQuery) {
      items.push({
        icon: <MessageSquare className="h-3 w-3" />,
        text: `Health query: "${persistedState.userQuery.slice(0, 30)}${persistedState.userQuery.length > 30 ? '...' : ''}"`
      });
    }

    return items;
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleRestore = () => {
    setIsVisible(false);
    setTimeout(onRestore, 300);
  };

  if (!isVisible) return null;

  const dataPreview = getDataPreview();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-auto px-4"
      >
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
          <RotateCcw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                  Continue from {getStageDescription(persistedState.stage)}?
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Saved {formatTimestamp(persistedState.timestamp)}
                </p>
              </div>
              <div className="flex gap-2 ml-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRestore}
                  className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                >
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {dataPreview.length > 0 && (
              <div className="border-t border-blue-200 dark:border-blue-800 pt-2">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Your progress:</p>
                <div className="space-y-1">
                  {dataPreview.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-300">
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};

export default StateRestorationBanner;
