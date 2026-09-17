'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProtected } from '@/hooks/useProtected';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { AtSign, Phone, ShieldCheck, ShieldAlert, Camera, Save } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  student: 'Estudiante',
  psychologist: 'Psicólogo(a)',
  admin: 'Administrador(a)',
};

export default function ProfilePage() {
  const { loading } = useProtected();
  const { user, refresh } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhoneNumber(user.phone_number || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const initials = (user?.full_name || '?')
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiClient.updateMyProfile({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        avatar_url: avatarUrl.trim(),
      });
      await refresh();
      toast.success('Perfil actualizado correctamente');
      if (updated.phone_number !== user?.phone_number) {
        toast.info('Tu nuevo número de teléfono deberá re-verificarse.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-8 pb-12">
        <header className="space-y-2">
          <h1 className="text-foreground font-serif text-3xl font-black tracking-tight">
            Mi Perfil
          </h1>
          <p className="text-muted-foreground text-sm font-medium italic opacity-70">
            Tu información y datos de contacto
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tarjeta de identidad */}
          <Card className="bg-card/40 border-border/40 space-y-6 p-8 shadow-xl backdrop-blur-md lg:col-span-1">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="bg-primary/10 text-primary flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl shadow-inner">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={`Foto de ${user.full_name}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-serif text-4xl font-black">{initials}</span>
                  )}
                </div>
                <div className="bg-primary text-primary-foreground absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-xl shadow-lg">
                  <Camera className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-foreground font-serif text-2xl font-bold">{user.full_name}</h2>
                <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </div>
            </div>

            <div className="space-y-3 border-t pt-6">
              <div className="flex items-center gap-3 text-sm">
                <div className="bg-muted/30 flex h-9 w-9 items-center justify-center rounded-xl">
                  <AtSign className="text-primary h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                    Correo electrónico
                  </p>
                  <p className="text-foreground truncate font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="bg-muted/30 flex h-9 w-9 items-center justify-center rounded-xl">
                  <Phone className="text-primary h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-[9px] font-black tracking-widest uppercase">
                    Teléfono celular
                  </p>
                  <p className="text-foreground truncate font-medium">
                    {user.phone_number || 'No registrado'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-border/40 space-y-2 border-t pt-6">
              <div className="flex items-center justify-between rounded-xl px-2 py-1.5 text-xs">
                <span className="text-muted-foreground font-bold">Cuenta activa</span>
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center justify-between rounded-xl px-2 py-1.5 text-xs">
                <span className="text-muted-foreground font-bold">Celular verificado</span>
                {user.is_phone_verified ? (
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>
          </Card>

          {/* Formulario de edición */}
          <Card className="bg-card/40 border-border/40 p-8 shadow-xl backdrop-blur-md lg:col-span-2">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-foreground text-sm font-semibold">Nombre Completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="border-border bg-background focus:ring-primary/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-3 shadow-sm transition-all outline-none focus:ring-4"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-foreground text-sm font-semibold">Correo Electrónico</label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  disabled
                  className="border-border bg-muted/30 text-muted-foreground w-full cursor-not-allowed rounded-xl border px-4 py-3 shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-foreground text-sm font-semibold">
                  Número de Teléfono Celular
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="71234567"
                  className="border-border bg-background focus:ring-primary/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-3 shadow-sm transition-all outline-none focus:ring-4"
                />
                <p className="text-muted-foreground text-xs italic opacity-60">
                  Si cambias tu número, deberás volver a verificarlo mediante código SMS.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-foreground text-sm font-semibold">
                  URL del Avatar (imagen de perfil)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://ejemplo.com/mi-foto.png"
                  className="border-border bg-background focus:ring-primary/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-3 shadow-sm transition-all outline-none focus:ring-4"
                />
                {avatarUrl && (
                  <div className="bg-background relative mt-3 h-24 w-24 overflow-hidden rounded-2xl border shadow-sm">
                    <Image
                      src={avatarUrl}
                      alt="Vista previa del avatar"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="border-border/40 flex items-center justify-between gap-4 border-t pt-6">
                <p className="text-muted-foreground hidden text-xs italic opacity-60 sm:block">
                  Los cambios se guardan de forma segura en tu cuenta.
                </p>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-primary flex items-center gap-2 rounded-xl px-6 py-3 font-black tracking-wide uppercase"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
