'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

export default function ConsentPage() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.consent_accepted) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleAccept = async () => {
    if (!accepted) return;
    setLoading(true);

    try {
      await apiClient.acceptConsent();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept consent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Card className="border-border bg-card w-full max-w-2xl">
        <div className="space-y-6 p-8">
          <div className="space-y-2">
            <h1 className="text-foreground font-serif text-3xl font-bold">
              Consentimiento Informado
            </h1>
            <p className="text-muted-foreground">
              Por favor lee y acepta para continuar usando MENTA-LINK
            </p>
          </div>

          <div className="border-border bg-muted/30 max-h-96 space-y-4 overflow-y-auto border p-4 text-sm">
            <section className="space-y-2">
              <h2 className="text-foreground font-medium">¿Qué datos recolectamos?</h2>
              <p className="text-muted-foreground">
                Recolectamos tus respuestas a escalas de evaluación psicológica validadas (PSS-10,
                GAD-7, PHQ-9) y check-ins emocionales sobre tu estado de ánimo, nivel de estrés,
                sueño, energía y concentración.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-foreground font-medium">¿Para qué usamos estos datos?</h2>
              <p className="text-muted-foreground">
                Tus datos se utilizan para identificar indicadores tempranos de riesgo psicológico,
                proporcionar información de bienestar personalizada y alertar al equipo de apoyo
                psicológico si puede ser beneficiosa una intervención.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-foreground font-medium">Importante: Lo que NO somos</h2>
              <p className="text-muted-foreground">
                MENTA-LINK no realiza diagnósticos clínicos. No reemplazamos el tratamiento
                profesional de salud mental. Si estás en crisis, por favor contacta a servicios de
                emergencia o a un profesional de salud mental inmediatamente.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-foreground font-medium">Privacidad de Datos</h2>
              <p className="text-muted-foreground">
                Tus datos están encriptados y almacenados de forma segura. Solo el personal
                universitario autorizado puede acceder a tu información. Puedes retirar tu
                consentimiento en cualquier momento.
              </p>
            </section>
          </div>

          <div className="space-y-4">
            <label className="flex gap-3">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="border-border mt-1 border"
              />
              <span className="text-foreground text-sm">
                He leído y entiendo la información del consentimiento informado
              </span>
            </label>

            {error && (
              <div className="border-destructive bg-destructive/10 text-destructive rounded border p-3 text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleAccept}
              disabled={!accepted || loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
            >
              {loading ? 'Procesando...' : 'Aceptar y Continuar'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
