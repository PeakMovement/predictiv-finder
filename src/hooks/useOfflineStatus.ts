
import { useState, useEffect } from 'react';

/**
 * Hook to track online/offline status
 */
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Track if we were offline to show "back online" message
      if (!navigator.onLine) {
        setWasOffline(true);
        // Clear the flag after a short delay
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline
  };
};

/**
 * Hook for managing network-dependent operations
 */
export const useNetworkOperation = () => {
  const { isOnline } = useOfflineStatus();

  const executeIfOnline = async <T>(
    operation: () => Promise<T>,
    fallback?: () => T
  ): Promise<T | null> => {
    if (!isOnline) {
      console.warn('Operation blocked: Device is offline');
      return fallback ? fallback() : null;
    }

    try {
      return await operation();
    } catch (error) {
      // Check if error is network-related
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Network operation failed, might be offline');
        return fallback ? fallback() : null;
      }
      throw error;
    }
  };

  return {
    isOnline,
    executeIfOnline
  };
};
