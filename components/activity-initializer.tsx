"use client";

import * as React from 'react';
import { initializeUserActivity } from '@/lib/auth/loginChecks';

export function ActivityInitializer() {
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    const initialize = async () => {
      if (!isInitialized) {
        await initializeUserActivity();
        setIsInitialized(true);
      }
    };

    initialize();

    // Re-check activity status when window gains focus
    const handleFocus = async () => {
      await initializeUserActivity();
    };

    // Set up periodic check every 30 seconds
    const checkInterval = setInterval(async () => {
      await initializeUserActivity();
    }, 30000);

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(checkInterval);
    };
  }, [isInitialized]);

  return null;
}
