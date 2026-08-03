'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { ActionRegistry } from '@/components/interventions/ActionRegistry';
import { apiClient } from '@/lib/api';
import { RiskSummary } from '@/lib/types';
import {
  Loader2,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function TestInterventionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialIdx = parseInt(searchParams?.get('idx') || '0', 10);

  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(initialIdx);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiClient.getRiskSummary();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching risk summary:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const recommendations = summary?.recommendations || [];
  const rec = recommendations[currentIndex];

  const handleNext = () => {
    if (currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getActionTitle = (actionType: string) => {
    switch (actionType) {
      case 'BREATHING_EXERCISE':
        return 'Ejercicio de Respiración';
      case 'COGNITIVE_REFRAME':
        return 'Reencuadre Cognitivo';
      case 'JOURNALING_PROMPT':
        return 'Reflexión Guiada';
      default:
        return 'Sugerencia de Bienestar';
    }
  };

  const getActionDescription = (actionType: string) => {
    switch (actionType) {
      case 'BREATHING_EXERCISE':
        return 'Esta herramienta te guiará para regular tu ritmo cardíaco y disminuir la tensión física inmediata. Sigue el patrón visual.';
      case 'COGNITIVE_REFRAME':
        return 'Toma control de tus pensamientos. Este ejercicio te ayuda a deconstruir ideas estresantes y verlas desde una perspectiva más objetiva.';
      case 'JOURNALING_PROMPT':
        return 'Escribir tus emociones reduce la carga mental. Usa este espacio seguro para desahogarte y ganar claridad sobre lo que sientes.';
      default:
        return 'Te recomendamos tener en cuenta esta sugerencia durante tu día para mantener un mejor equilibrio.';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!rec) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
          <h2 className="mb-2 text-xl font-bold">No hay recomendaciones activas</h2>
          <p className="text-muted-foreground max-w-md">
            Realiza un test PSS-10 para que nuestra IA genere acciones personalizadas para ti.
          </p>
          <Link href="/dashboard" className="mt-6">
            <Button>Volver al Panel</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const actionType = typeof rec === 'string' ? 'READ_MORE' : rec.action_type;
  const metadata = typeof rec === 'string' ? { description: rec } : rec.metadata;

  return (
    <Layout>
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 pb-12 duration-700">
        {/* Header */}
        <div className="border-border/40 flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-foreground font-serif text-3xl font-black tracking-tight">
                {getActionTitle(actionType)}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                <Sparkles className="text-primary h-4 w-4" />
                Intervención sugerida por IA
              </p>
            </div>
          </div>
          <div className="text-muted-foreground bg-muted/50 rounded-xl px-4 py-2 text-sm font-bold">
            {currentIndex + 1} de {recommendations.length}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Instructions */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="bg-primary/5 border-primary/20 relative h-full overflow-hidden p-6 shadow-sm">
              <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-5">
                <Info className="h-24 w-24" />
              </div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold">
                <Info className="text-primary h-5 w-5" />
                ¿Cómo usar esta herramienta?
              </h3>
              <p className="text-foreground/80 text-sm leading-relaxed">
                {getActionDescription(actionType)}
              </p>

              <div className="border-primary/10 mt-6 border-t pt-6">
                <h4 className="text-primary mb-2 text-sm font-bold">Contexto de la sugerencia:</h4>
                <p className="text-muted-foreground text-sm italic">
                  "
                  {metadata?.description ||
                    metadata?.title ||
                    'Sugerencia basada en tus niveles de estrés académicos.'}
                  "
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column: Actual Interactive Tool */}
          <div className="flex flex-col lg:col-span-2">
            <Card className="border-border/40 bg-card flex flex-grow flex-col justify-center p-4 shadow-sm sm:p-8">
              <ActionRegistry actionType={actionType} metadata={metadata} />
            </Card>
          </div>
        </div>

        {/* Navigation between recommendations (Moved outside the grid to prevent overlap) */}
        <div className="border-border/40 mt-8 flex items-center justify-between gap-4 border-t pt-6">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleNext}
            disabled={currentIndex === recommendations.length - 1}
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export default function TestInterventionsPage() {
  return (
    <React.Suspense
      fallback={
        <Layout>
          <div className="flex h-[60vh] items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        </Layout>
      }
    >
      <TestInterventionsContent />
    </React.Suspense>
  );
}
