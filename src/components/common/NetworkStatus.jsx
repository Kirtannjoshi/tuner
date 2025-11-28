import React from 'react';
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import useNetworkStatus from '../../hooks/useNetworkStatus';

const NetworkStatus = () => {
  const { isOnline, slowConnection } = useNetworkStatus();

  if (!isOnline) {
    return (
      <div className="fixed bottom-16 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
        <div className="flex items-center justify-center space-x-2">
          <WifiIcon className="w-5 h-5" />
          <span>You're offline. Please check your internet connection.</span>
        </div>
      </div>
    );
  }

  if (slowConnection) {
    return (
      <div className="fixed bottom-16 left-0 right-0 bg-yellow-500 text-white p-2 text-center z-50">
        <div className="flex items-center justify-center space-x-2">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>Slow connection detected. Streaming quality may be affected.</span>
        </div>
      </div>
    );
  }

  return null;
};

export default NetworkStatus;