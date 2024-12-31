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
    const handleFocus = () => {
      initialize();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isInitialized]);

  return null;
}
