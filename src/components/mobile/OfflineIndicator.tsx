
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

export const OfflineIndicator: React.FC = () => {
  const { isOffline } = useOfflineStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <Badge variant="destructive" className="flex items-center gap-1 fixed top-4 right-4 z-50">
      <WifiOff className="h-3 w-3" />
      Offline
    </Badge>
  );
};
