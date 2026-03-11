'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/context/sidebar-context';

interface NavItem {
  label: string;
  href: string;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Inicio',
    href: '/dashboard',
    roles: ['student', 'psychologist', 'tutor', 'admin'],
  },
  { label: 'Evaluaciones', href: '/assessments', roles: ['student'] },
  { label: 'Mi Bienestar', href: '/checkins', roles: ['student'] },
  { label: 'Diario Emocional', href: '/diary', roles: ['student'] },
  { label: 'Mis Alertas', href: '/alerts', roles: ['student'] },
  { label: 'Todas las Alertas', href: '/admin/alerts', roles: ['psychologist', 'tutor', 'admin'] },
  { label: 'Estudiantes', href: '/admin/students', roles: ['psychologist', 'tutor', 'admin'] },
  { label: 'Usuarios', href: '/admin/users', roles: ['admin'] },
  { label: 'Citas Médicas', href: '/admin/appointments', roles: ['psychologist', 'admin'] },
  { label: 'Reportes', href: '/admin/reports', roles: ['psychologist', 'tutor', 'admin'] },
];

export function Sidebar() {
  const { user } = useAuth();
  const { isOpen, close } = useSidebar();
  const pathname = usePathname();

  if (!user) return null;

  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          'border-border/50 bg-background/80 fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 border-r backdrop-blur-md transition-all duration-300 ease-in-out md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="space-y-1 p-6">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                'block rounded px-4 py-2 text-sm font-medium transition-all',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-primary'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
