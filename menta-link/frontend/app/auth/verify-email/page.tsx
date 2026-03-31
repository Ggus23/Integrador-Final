'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token not found.');
      return;
    }

    const verify = async () => {
      try {
        await apiClient.verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed');
      }
    };

    verify();
  }, [token]);

  return (
    <Card className="animate-fade-in w-full max-w-md border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-md dark:bg-slate-900/80">
      <div className="space-y-6 text-center">
        <h1 className="from-primary to-accent bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
          Verificación de Email
        </h1>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="border-primary mx-auto h-10 w-10 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Verificando tu cuenta...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-scale-in space-y-4">
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
            <h2 className="text-foreground text-xl font-semibold">¡Verificación Exitosa!</h2>
            <p className="text-muted-foreground">Tu correo ha sido confirmado correctamente.</p>
            <Link href="/login">
              <Button className="from-primary to-accent mt-4 w-full bg-gradient-to-r">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-shake space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg
                className="h-8 w-8 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-foreground text-xl font-semibold">Error de Verificación</h2>
            <p className="text-destructive">{message}</p>
            <Link href="/signup">
              <Button variant="outline" className="mt-4 w-full">
                Volver al Registro
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 px-4 py-8 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Suspense fallback={<div>Loading...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
