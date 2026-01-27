'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Role is fixed to student for public registration
  const role = 'student';
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
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

  const validateForm = () => {
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Email must be a @gmail.com address');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!anyDigit(password)) {
      setError('Password must contain at least one digit');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const anyDigit = (str: string) => /\d/.test(str);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await apiClient.register({
        full_name: fullName,
        email: email,
        password: password,
        role: role,
      });
      setVerificationSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 px-4 py-8 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Card className="animate-fade-in w-full max-w-md border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:bg-slate-900/80">
          <div className="space-y-4 text-center">
            <h1 className="text-primary text-2xl font-bold">¡Cuenta Creada!</h1>
            <p className="text-muted-foreground">
              Hemos enviado un enlace de verificación a <strong>{email}</strong>. Por favor revisa
              tu bandeja de entrada para activar tu cuenta.
            </p>
            <Link href="/login">
              <Button className="mt-4 w-full">Ir a Iniciar Sesión</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 px-4 py-8 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Card className="animate-fade-in w-full max-w-md border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:bg-slate-900/80">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="from-primary to-accent bg-gradient-to-r bg-clip-text font-serif text-4xl font-bold text-transparent">
              MENTA-LINK
            </h1>
            <p className="text-muted-foreground text-sm">
              Crea tu cuenta para comenzar tu viaje de bienestar emocional
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="animate-slide-up space-y-5"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium">Nombre Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan Pérez"
                className="border-input bg-background/50 text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-2.5 shadow-sm transition-all outline-none focus:ring-2"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium">
                Correo Electrónico (Gmail requerido)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.nombre@gmail.com"
                className="border-input bg-background/50 text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-2.5 shadow-sm transition-all outline-none focus:ring-2"
                required
              />
            </div>

            {/* Role selection removed for public registration */}

            <div className="space-y-2">
              <label className="text-foreground text-sm font-medium">Contraseña</label>
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
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </Button>
          </form>

          <div className="animate-slide-up text-center text-sm" style={{ animationDelay: '0.2s' }}>
            <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
            <Link
              href="/login"
              className="text-primary hover:text-accent font-medium transition-colors hover:underline"
            >
              Iniciar Sesión
            </Link>
          </div>

          <div
            className="border-border/50 animate-slide-up space-y-2 border-t pt-6 text-center"
            style={{ animationDelay: '0.3s' }}
          >
            <p className="text-muted-foreground text-xs">
              El registro está limitado a dominios universitarios verificados para fines de
              investigación.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
