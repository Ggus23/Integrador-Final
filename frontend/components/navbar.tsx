'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md transition-all">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-foreground font-serif text-2xl font-bold">MENTA-LINK</div>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm">{user.full_name}</span>
          <Button
            onClick={logout}
            variant="ghost"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </nav>
  );
}
