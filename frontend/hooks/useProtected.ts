'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

export function useProtected() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.must_change_password && window.location.pathname !== '/change-password') {
        router.push('/change-password');
      }
    }
  }, [user, loading, router]);

  return { user, loading };
}
