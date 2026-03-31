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
    <div className="transparent flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="animate-fade-in border-border/40 relative z-10 w-full max-w-md p-8 shadow-2xl">
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="bg-primary/5 relative mb-2 h-20 w-20 overflow-hidden rounded-2xl p-2 shadow-sm transition-transform hover:scale-105">
              <Image src="/icon_logo.png" alt="MentaLink Logo" fill className="object-cover p-2" />
            </div>
            <h1 className="text-foreground font-serif text-4xl font-bold tracking-tight">
              MenTaLink
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Detección temprana de riesgo psicoemocional en estudiantes universitarios
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="animate-slide-up space-y-5"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-foreground text-sm font-semibold">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@ejemplo.com"
                className="border-border bg-background focus:ring-primary/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-3 shadow-sm transition-all outline-none focus:ring-4"
                required
                aria-label={t('auth.email')}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-foreground text-sm font-semibold">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-border bg-background focus:ring-primary/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-3 shadow-sm transition-all outline-none focus:ring-4"
                required
                aria-label={t('auth.password')}
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-primary hover:text-primary/80 text-sm font-bold transition-all hover:underline"
              >
                {t('auth.forgot_password')}
              </Link>
            </div>

            {error && (
              <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-center justify-center rounded-xl border p-4 text-sm font-bold">
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="btn-radiant w-full rounded-xl py-7 text-lg font-black"
            >
              {loading ? t('auth.logging_in') : t('auth.login_title')}
            </Button>
          </form>

          <div className="animate-slide-up text-center text-sm" style={{ animationDelay: '0.2s' }}>
            <span className="text-muted-foreground font-medium">¿No tienes una cuenta? </span>
            <Link
              href="/signup"
              className="text-primary hover:text-primary/80 font-black transition-all hover:underline"
            >
              Crear una
            </Link>
          </div>

          <div
            className="border-border/50 animate-slide-up space-y-3 border-t pt-6 text-center"
            style={{ animationDelay: '0.3s' }}
          >
            <p className="text-muted-foreground text-xs leading-relaxed italic">
              Tus datos están seguros y encriptados. No realizamos diagnósticos clínicos, solo
              detección temprana de indicadores de riesgo.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
