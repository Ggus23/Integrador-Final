'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Mail, Phone, ShieldCheck, ShieldAlert, User as UserIcon, ArrowRight } from 'lucide-react';
import type { User } from '@/lib/types';

interface UserProfileCardProps {
  user: User;
  compact?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Estudiante',
  psychologist: 'Psicólogo(a)',
  admin: 'Administrador(a)',
  tutor: 'Tutor(a)',
};

export function UserProfileCard({ user, compact = false }: UserProfileCardProps) {
  const initials = (user.full_name || '?')
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (compact) {
    return (
      <Card className="border-border/40 bg-card/60 relative overflow-hidden p-5 shadow-lg backdrop-blur-md transition-all hover:shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl font-black shadow-inner">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={`Avatar de ${user.full_name}`}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <span className="font-serif text-xl">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-foreground truncate font-serif text-lg font-bold">
                {user.full_name}
              </h3>
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider uppercase">
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span className="flex items-center gap-1.5 truncate">
                <Mail className="text-primary/70 h-3.5 w-3.5" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="text-primary/70 h-3.5 w-3.5" />
                {user.phone_number || 'Sin celular'}
              </span>
            </div>
          </div>
          <Link
            href="/profile"
            className="text-primary hover:bg-primary/10 flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
            title="Ver y editar perfil completo"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/60 relative overflow-hidden p-6 shadow-xl backdrop-blur-md transition-all hover:shadow-2xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="bg-primary/10 text-primary relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl font-black shadow-inner">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={`Avatar de ${user.full_name}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span className="font-serif text-3xl">{initials}</span>
              )}
            </div>
            <span
              className={`border-card absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-sm ${
                user.is_phone_verified ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
              }`}
              title={
                user.is_phone_verified ? 'Celular verificado' : 'Celular pendiente de verificación'
              }
            >
              {user.is_phone_verified ? (
                <ShieldCheck className="h-3.5 w-3.5" />
              ) : (
                <ShieldAlert className="h-3.5 w-3.5" />
              )}
            </span>
          </div>

          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-foreground font-serif text-2xl font-bold tracking-tight">
                {user.full_name}
              </h2>
              <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
              <span className="flex items-center gap-2">
                <Mail className="text-primary h-4 w-4" />
                <span className="truncate">{user.email}</span>
              </span>
              <span className="flex items-center gap-2">
                <Phone className="text-primary h-4 w-4" />
                <span>{user.phone_number || 'No registrado'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/profile">
            <button className="border-border/60 hover:border-primary/50 hover:bg-primary/5 text-foreground flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold tracking-wide uppercase transition-all">
              <UserIcon className="text-primary h-3.5 w-3.5" />
              Gestionar Perfil
            </button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
