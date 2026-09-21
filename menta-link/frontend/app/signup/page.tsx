'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
const isValidPhone = (phone: string) => /^\+?\d{7,15}$/.test(phone.trim());

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
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

  const anyDigit = (str: string) => /\d/.test(str);

  const validateEmailAndPassword = () => {
    if (!email.toLowerCase().endsWith('@unifranz.edu.bo')) {
      setError('Debes usar tu correo institucional (@unifranz.edu.bo)');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmailAndPassword()) return;

    if (!isValidPhone(phoneNumber)) {
      setError('Debes registrar un número de teléfono celular válido.');
      return;
    }

    setLoading(true);

    try {
      await apiClient.register({
        full_name: fullName,
        email: email,
        password: password,
        role: role,
        phone_number: phoneNumber.trim(),
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
      <div className="transparent flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="animate-fade-in border-border/40 relative z-10 w-full max-w-md p-8 shadow-2xl">
          <div className="space-y-6 text-center">
            <div className="bg-primary/5 relative mx-auto h-20 w-20 overflow-hidden rounded-2xl p-2 shadow-sm">
              <Image src="/icon_logo.png" alt="MentaLink Logo" fill className="object-cover p-2" />
            </div>
            <div className="space-y-2">
              <h1 className="text-primary font-serif text-3xl font-black">¡Cuenta Creada!</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Hemos enviado un enlace de verificación a{' '}
                <strong className="text-foreground">{email}</strong>. Por favor revisa tu bandeja de
                entrada para activar tu cuenta.
              </p>
            </div>
            <Link href="/login" className="block pt-4">
              <Button className="btn-radiant w-full rounded-xl py-7 text-lg font-black">
                Ir a Iniciar Sesión
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="transparent flex min-h-screen items-center justify-center px-4 py-8">
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
              Crea tu cuenta para comenzar tu viaje de bienestar emocional
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="animate-slide-up space-y-5"
            style={{ animationDelay: '0.1s' }}
          >
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
              <label className="text-foreground text-sm font-semibold">
                Correo Electrónico Institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@unifranz.edu.bo"
                className="border-border bg-background focus:ring-primary/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-3 shadow-sm transition-all outline-none focus:ring-4"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-foreground text-sm font-semibold">
                Número de Teléfono Celular
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                }}
                placeholder="71234567"
                className="border-border bg-background focus:ring-primary/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-3 shadow-sm transition-all outline-none focus:ring-4"
                required
              />
              <p className="text-muted-foreground text-xs italic opacity-60">
                Este número será utilizado por el personal autorizado para contactarte.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-foreground text-sm font-semibold">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-border bg-background focus:ring-primary/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-3 shadow-sm transition-all outline-none focus:ring-4"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-foreground text-sm font-semibold">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="border-border bg-background focus:ring-primary/20 text-foreground focus:border-primary w-full rounded-xl border px-4 py-3 shadow-sm transition-all outline-none focus:ring-4"
                required
              />
            </div>

            {error && (
              <div
                className={cn(
                  'flex items-center justify-center rounded-xl border p-4 text-sm font-bold',
                  error.includes('verificar') || error.includes('Código')
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-600'
                    : 'border-destructive/20 bg-destructive/10 text-destructive'
                )}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="btn-radiant w-full rounded-xl py-7 text-lg font-black"
            >
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </Button>
          </form>

          <div className="animate-slide-up text-center text-sm" style={{ animationDelay: '0.2s' }}>
            <span className="text-muted-foreground font-medium">¿Ya tienes una cuenta? </span>
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-black transition-all hover:underline"
            >
              Iniciar Sesión
            </Link>
          </div>

          <div
            className="border-border/50 animate-slide-up space-y-3 border-t pt-6 text-center"
            style={{ animationDelay: '0.3s' }}
          >
            <p className="text-muted-foreground text-xs leading-relaxed italic">
              El registro está limitado a dominios universitarios verificados para fines de
              investigación.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
