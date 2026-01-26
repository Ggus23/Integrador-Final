'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (!user.consent_accepted) {
          router.push('/consent');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/signup');
      }
    }
  }, [user, loading, router]);

  return <div className="flex h-screen items-center justify-center">Loading...</div>;
}
