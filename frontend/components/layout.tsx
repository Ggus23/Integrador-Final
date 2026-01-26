'use client';

import type React from 'react';

import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { useAuth } from '@/hooks/useAuth';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
