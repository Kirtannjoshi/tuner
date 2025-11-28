import { useState, useEffect } from 'react';

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [slowConnection, setSlowConnection] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSlowConnection(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleConnectionChange = () => {
      if (navigator.connection) {
        const { effectiveType, downlink } = navigator.connection;
        setSlowConnection(
          effectiveType === 'slow-2g' ||
          effectiveType === '2g' ||
          downlink < 0.5
        );
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleConnectionChange);
      handleConnectionChange();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return { isOnline, slowConnection };
};

export default useNetworkStatus;