'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (!user.consent_accepted) {
        router.push('/consent');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 px-4 py-12 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Card className="animate-fade-in w-full max-w-md border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:bg-slate-900/80">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="from-primary to-accent bg-gradient-to-r bg-clip-text font-serif text-4xl font-bold text-transparent">
              MENTA-LINK
            </h1>
            <p className="text-muted-foreground text-sm">
              Detección temprana de riesgo psicoemocional en estudiantes universitarios
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="animate-slide-up space-y-5"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@ejemplo.com"
                className="border-input bg-background/50 text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-2.5 shadow-sm transition-all outline-none focus:ring-2"
                required
                aria-label="Correo Electrónico"
              />
            </div>

            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-input bg-background/50 text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-2.5 shadow-sm transition-all outline-none focus:ring-2"
                required
                aria-label="Contraseña"
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-primary hover:text-accent text-sm font-medium transition-colors hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {error && (
              <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center justify-center rounded-lg border p-3 text-sm font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="from-primary to-accent w-full rounded-lg bg-gradient-to-r py-6 text-base font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="animate-slide-up text-center text-sm" style={{ animationDelay: '0.2s' }}>
            <span className="text-muted-foreground">¿No tienes una cuenta? </span>
            <Link
              href="/signup"
              className="text-primary hover:text-accent font-medium transition-colors hover:underline"
            >
              Crear una
            </Link>
          </div>

          <div
            className="border-border/50 animate-slide-up space-y-2 border-t pt-6 text-center"
            style={{ animationDelay: '0.3s' }}
          >
            <p className="text-muted-foreground text-xs">
              Tus datos están seguros y encriptados. No realizamos diagnósticos clínicos, solo
              detección temprana de indicadores de riesgo.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
