'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const { t } = useLanguage();
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#ecfeff] via-[#cffafe] to-[#a5f3fc] px-4 py-12 dark:from-[#083344] dark:via-[#164e63] dark:to-[#083344]">
      <Card className="animate-fade-in w-full max-w-md border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:bg-slate-900/80">
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="relative mb-4 h-20 w-20 overflow-hidden rounded-full shadow-lg">
              <Image src="/icon_logo.png" alt="MentaLink Logo" fill className="object-cover" />
            </div>
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
              <label htmlFor="email" className="text-foreground text-sm font-medium">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@ejemplo.com"
                className="border-input bg-background/50 text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-2.5 shadow-sm transition-all outline-none focus:ring-2"
                required
                aria-label={t('auth.email')}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-foreground text-sm font-medium">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-input bg-background/50 text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-2.5 shadow-sm transition-all outline-none focus:ring-2"
                required
                aria-label={t('auth.password')}
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-primary hover:text-accent text-sm font-medium transition-colors hover:underline"
              >
                {t('auth.forgot_password')}
              </Link>
            </div>

            {error && (
              <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center justify-center rounded-lg border p-3 text-sm font-medium">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full rounded-lg py-6 text-base font-semibold shadow-lg transition-all hover:shadow-xl"
            >
              {loading ? t('auth.logging_in') : t('auth.login_title')}
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
