'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

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
  { label: 'Mis Alertas', href: '/alerts', roles: ['student'] },
  { label: 'Todas las Alertas', href: '/admin/alerts', roles: ['psychologist', 'tutor', 'admin'] },
  { label: 'Estudiantes', href: '/admin/students', roles: ['psychologist', 'tutor', 'admin'] },
  { label: 'Usuarios', href: '/admin/users', roles: ['admin'] },
  { label: 'Reportes', href: '/admin/reports', roles: ['psychologist', 'tutor', 'admin'] },
];

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="border-border/50 bg-background/80 fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 border-r backdrop-blur-md transition-all">
      <nav className="space-y-1 p-6">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'block rounded px-4 py-2 text-sm font-medium transition-all',
              pathname === item.href
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
