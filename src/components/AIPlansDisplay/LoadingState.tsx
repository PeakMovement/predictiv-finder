
import React from 'react';
import { Card } from '@/components/ui/card';

const LoadingState: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto"></div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-4">Generating personalized health plans...</p>
      </Card>
    </div>
  );
};

export default LoadingState;
