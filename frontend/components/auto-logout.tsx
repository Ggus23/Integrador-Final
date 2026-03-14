'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Define the timeout duration (15 minutes = 15 * 60 * 1000 milliseconds)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000; 

export function AutoLogout() {
  const { user, logout } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only run the inactivity timer if a user is logged in
    if (!user) return;

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        toast.warning('Tu sesión ha expirado por inactividad.');
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    // Initialize timer
    resetTimer();

    // Event listeners
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [user, logout]);

  return null; // This component does not render anything
}
