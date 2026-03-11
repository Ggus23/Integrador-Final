'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useSidebar } from '@/context/sidebar-context';

export function Navbar() {
  const { user, logout } = useAuth();
  const { isOpen, toggle } = useSidebar();

  if (!user) return null;

  return (
    <nav className="border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md transition-all">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="md:hidden"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative h-8 w-8 md:h-10 md:w-10 overflow-hidden rounded-md shadow-sm">
              <Image src="/icon_logo.png" alt="MentaLink Logo" fill className="object-cover" />
            </div>
            <div className="text-foreground group-hover:text-primary font-serif text-xl md:text-2xl font-black tracking-tight transition-colors">
              MENTA<span className="text-primary">-LINK</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm">{user.full_name}</span>
          <Button
            onClick={logout}
            variant="ghost"
            className="text-muted-foreground hover:bg-secondary hover:text-primary font-medium transition-all"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </nav>
  );
}
