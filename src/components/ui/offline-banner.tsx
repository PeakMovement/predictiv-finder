
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, CheckCircle } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

/**
 * Banner component that shows offline/online status
 */
export const OfflineBanner: React.FC = () => {
  const { isOnline, wasOffline } = useOfflineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white py-2 px-4"
        >
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">
              You're offline. Some features may not work.
            </span>
          </div>
        </motion.div>
      )}
      
      {isOnline && wasOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white py-2 px-4"
        >
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Back online! All features are available.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
