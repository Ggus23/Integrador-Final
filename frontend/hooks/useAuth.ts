'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { apiClient } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokenKey = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'mentalink_token';
        if (!localStorage.getItem(tokenKey)) {
          setUser(null);
          setLoading(false);
          return;
        }

        const userData = await apiClient.getMe();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth check failed');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      // Login returns { access_token, token_type }
      // We need to fetch the user profile separately or decode the token if it contains info
      const userData = await apiClient.getMe();
      setUser(userData);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    router.push('/login');
  };

  return { user, loading, error, login, logout };
}
