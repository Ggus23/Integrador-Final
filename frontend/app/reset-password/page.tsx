'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

function ResetContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setMessage('Token inválido.');
      return;
    }
    if (password.length < 8) {
      setStatus('error');
      setMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      await apiClient.resetPassword(token, password);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="animate-fade-in w-full max-w-md border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:bg-slate-900/80">
        <div className="text-center">
          <p className="text-destructive mb-4">Token no proporcionado.</p>
          <Link href="/forgot-password">
            <Button>Volver</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in w-full max-w-md border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:bg-slate-900/80">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-primary font-serif text-2xl font-bold">Nueva Contraseña</h1>
          <p className="text-muted-foreground text-sm">Ingresa tu nueva contraseña segura</p>
        </div>

        {status === 'success' ? (
          <div className="animate-scale-in space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">¡Contraseña Actualizada!</h3>
            <p className="text-muted-foreground">
              Ahora puedes iniciar sesión con tus nuevas credenciales.
            </p>
            <Link href="/login">
              <Button className="from-primary to-accent mt-4 w-full bg-gradient-to-r">
                Ir a Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium">Nueva Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-input bg-background/50 text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-2.5 shadow-sm transition-all outline-none focus:ring-2"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="border-input bg-background/50 text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-2.5 shadow-sm transition-all outline-none focus:ring-2"
                required
              />
            </div>

            {status === 'error' && (
              <div className="text-destructive bg-destructive/10 rounded-lg p-3 text-sm">
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="from-primary to-accent w-full rounded-lg bg-gradient-to-r py-6 text-base font-semibold text-white shadow-md transition-all hover:opacity-90"
            >
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 px-4 py-8 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetContent />
      </Suspense>
    </div>
  );
}
