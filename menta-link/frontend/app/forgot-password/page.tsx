'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.recoverPassword(email);
      setSubmitted(true);
    } catch (err) {
      // In a real security context, we typically wouldn't show the error if user not found,
      // but if the API failed for other reasons (rate limit), we might.
      // For this UX, we show generic errors.
      setError('Unable to process request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 px-4 py-8 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Card className="animate-fade-in w-full max-w-md border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:bg-slate-900/80">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-primary font-serif text-2xl font-bold">Recuperar Contraseña</h1>
            <p className="text-muted-foreground text-sm">
              Ingresa tu correo para recibir instrucciones
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.correo@ejemplo.com"
                  className="border-input bg-background/50 text-foreground focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-2.5 shadow-sm transition-all outline-none focus:ring-2"
                  required
                />
              </div>

              {error && (
                <div className="text-destructive bg-destructive/10 rounded-lg p-3 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="from-primary to-accent w-full rounded-lg bg-gradient-to-r py-6 text-white shadow-md transition-all hover:opacity-90"
              >
                {loading ? 'Enviando...' : 'Enviar Enlace'}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-primary text-sm hover:underline">
                  Volver a Iniciar Sesión
                </Link>
              </div>
            </form>
          ) : (
            <div className="animate-slide-up space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg
                  className="h-8 w-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Correo Enviado</h3>
              <p className="text-muted-foreground text-sm">
                Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un enlace para
                restablecer tu contraseña.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-4 w-full">
                Intentar con otro correo
              </Button>
              <div className="mt-4">
                <Link href="/login" className="text-primary text-sm hover:underline">
                  Ir a Iniciar Sesión
                </Link>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
