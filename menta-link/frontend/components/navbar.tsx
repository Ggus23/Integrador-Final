'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut } from 'lucide-react';
import { useSidebar } from '@/context/sidebar-context';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, logout } = useAuth();
  const { isOpen, toggle } = useSidebar();

  if (!user) return null;

  const initials = (user.full_name || '?')
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <nav className="border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md transition-all">
      <div className="flex h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        {/* Lado Izquierdo: Menú Móvil + Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="md:hidden"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <Link
            href="/"
            className="group flex items-center gap-2 transition-transform hover:scale-105 sm:gap-3"
          >
            <div className="bg-primary/5 group-hover:bg-primary/10 relative h-9 w-9 overflow-hidden rounded-xl shadow-sm transition-colors sm:h-10 sm:w-10 md:h-11 md:w-11">
              <Image src="/icon_logo.png" alt="MentaLink Logo" fill className="object-cover" />
            </div>
            <div className="text-foreground font-serif text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
              MenTaLink
            </div>
          </Link>
        </div>

        {/* Lado Derecho: Usuario + Avatar + Botón de Salida */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/profile"
            className="hover:bg-secondary/70 flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition-all sm:gap-3 sm:px-2"
            title="Ver Mi Perfil"
          >
            <span className="text-muted-foreground hidden max-w-[120px] truncate text-sm sm:inline-block sm:max-w-[160px] md:max-w-none">
              {user.full_name}
            </span>
            <span className="relative inline-flex">
              <span className="bg-primary/10 text-primary relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl font-black uppercase shadow-sm">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={`Avatar de ${user.full_name}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  initials
                )}
              </span>
              <span
                className={cn(
                  'ring-background absolute -right-1 -bottom-1 h-3 w-3 rounded-full ring-2',
                  user.is_phone_verified ? 'bg-green-500' : 'bg-amber-400'
                )}
              />
            </span>
          </Link>

          <Button
            onClick={logout}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:bg-secondary hover:text-primary px-2 font-medium transition-all sm:px-4"
            aria-label="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5 sm:hidden" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
