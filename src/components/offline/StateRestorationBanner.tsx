
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StateRestorationBannerProps {
  onRestore: () => void;
  onDismiss: () => void;
  timestamp: number;
}

/**
 * Banner that appears when offline state can be restored
 */
export const StateRestorationBanner: React.FC<StateRestorationBannerProps> = ({
  onRestore,
  onDismiss,
  timestamp
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const formatTimestamp = (ts: number) => {
    const now = Date.now();
    const diff = now - ts;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for animation to complete
  };

  const handleRestore = () => {
    setIsVisible(false);
    setTimeout(onRestore, 300);
  };

  if (!isVisible) return null;

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
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1 mr-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                Restore your progress?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Saved {formatTimestamp(timestamp)}
              </p>
            </div>
            <div className="flex gap-2">
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
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
};

export default StateRestorationBanner;
