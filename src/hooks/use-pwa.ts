
import { useState, useEffect } from 'react';

interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  canShare: boolean;
}

export const usePWA = () => {
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    canShare: 'share' in navigator
  });

  useEffect(() => {
    // Check if app is installed (running in standalone mode)
    const isInstalled = window.matchMedia && 
      window.matchMedia('(display-mode: standalone)').matches;
    
    setCapabilities(prev => ({ ...prev, isInstalled }));

    // Listen for online/offline status
    const updateOnlineStatus = () => {
      setCapabilities(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const shareContent = async (data: { title: string; text?: string; url?: string }) => {
    if (capabilities.canShare) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    }
    return false;
  };

  return {
    ...capabilities,
    shareContent
  };
};
