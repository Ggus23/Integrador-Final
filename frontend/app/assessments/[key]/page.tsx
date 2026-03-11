'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, HeartPulse, BrainCircuit, CheckCircle2, AlertCircle, Activity, Heart, Sparkles, MessageCircle } from 'lucide-react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Assessment } from '@/lib/types';
import { AppointmentRequest } from '@/components/AppointmentRequest';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";



export default function AssessmentPage() {
  const { user } = useProtected();
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);


  const assessmentKey = params.key as string;

  useEffect(() => {
    if (!user) return;

    const fetchAssessment = async () => {
      try {
        const data = await apiClient.getAssessment(assessmentKey);
        setAssessment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [user, assessmentKey]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">Loading...</div>
      </Layout>
    );
  }

  if (!assessment) {
    return (
      <Layout>
        <div className="text-center">Assessment not found</div>
      </Layout>
    );
  }

  const currentItem = assessment.items[currentQuestion];
  const progress = ((currentQuestion + 1) / assessment.items.length) * 100;

  const getLabelForValue = (type: string, value: number, item: any) => {
    if (value === item.scale_min) return item.scale_min_label;
    if (value === item.scale_max) return item.scale_max_label;

    if (type === 'GAD-7' || type === 'PHQ-9') {
      if (value === 1) return 'Varios días';
      if (value === 2) return 'Más de la mitad de los días';
    }

    if (type === 'PSS-10') {
      if (value === 1) return 'Casi nunca';
      if (value === 2) return 'De vez en cuando';
      if (value === 3) return 'A menudo';
    }

    return value.toString();
  };

  const handleResponse = (value: number) => {
    setResponses({
      ...responses,
      [currentItem.id]: value,
    });
  };

  const handleNext = () => {
    if (currentQuestion < assessment.items.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async (shareWithPsychologist: boolean = false) => {
    if (!assessment) return;
    setSubmitting(true);
    setShowConsentDialog(false);
    try {
      await apiClient.submitAssessmentResponse(assessment.id, responses, shareWithPsychologist);

      // Check if any critical item was triggered
      const hasCriticalTrigger = assessment.items.some(
        item => item.is_critical && responses[item.id] > 0
      );

      setCompleted(true);

      // Only redirect automatically if NOT a critical situation
      if (!hasCriticalTrigger) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };


  if (completed) {
    const hasCriticalTrigger = assessment.items.some(
      item => item.is_critical && responses[item.id] > 0
    );

    return (
      <Layout>
        <div className="animate-fade-in flex min-h-[400px] flex-col items-center justify-center gap-6 py-12 px-4">
          {!hasCriticalTrigger ? (
            <Card className="border-border bg-card max-w-md p-10 text-center shadow-xl">
              <div className="bg-primary/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                <CheckCircle2 className="text-primary h-10 w-10" />
              </div>
              <h2 className="text-foreground font-serif text-3xl font-bold">¡Evaluación Completada!</h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Gracias por tu honestidad. Tus respuestas han sido registradas para el seguimiento preventivo.
              </p>
              <p className="text-primary mt-8 text-sm font-medium animate-pulse">
                Redirigiendo al panel principal...
              </p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="mt-8 w-full shadow-lg"
              >
                Ir al Dashboard
              </Button>
            </Card>
          ) : (
            <div className="animate-slide-up w-full max-w-2xl space-y-6">
              <div className="bg-card border-primary/20 rounded-3xl border p-8 text-center shadow-[0_20px_50px_rgba(var(--primary-rgb),0.1)] backdrop-blur-sm">
                <div className="mb-6 flex justify-center">
                  <div className="bg-primary/10 rounded-full p-5 shadow-inner">
                    <Heart className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                </div>
                <h3 className="mb-4 text-3xl font-bold text-foreground font-serif">
                  Tu bienestar nos importa
                </h3>
                <p className="text-muted-foreground mb-10 text-lg leading-relaxed max-w-lg mx-auto">
                  Entendemos que hay días en los que todo parece pesar más de lo normal. Queremos que sepas que no tienes por qué llevar esa carga solo. Estamos aquí para escucharte y apoyarte.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Button
                    onClick={() => {
                      window.open('https://wa.me/59179717725?text=Hola,%20necesito%20apoyo%20del%20Gabinete%20Psicológico%20de%20MentaLink', '_blank');
                    }}
                    className="from-primary to-accent bg-gradient-to-r text-white shadow-xl h-auto min-h-[4rem] py-3 text-lg font-bold rounded-2xl transition-all hover:scale-[1.02] border-none whitespace-normal leading-tight"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" /> Hablar con alguien
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowResources(!showResources)}
                    className="border-primary/20 text-primary hover:bg-primary/5 h-auto min-h-[4rem] py-3 text-base sm:text-lg font-bold rounded-2xl transition-all whitespace-normal leading-tight px-4"
                  >
                    {showResources ? 'Ocultar formulario' : 'Generar una cita con el gabinete psicológico'}
                  </Button>
                </div>


                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="ghost"
                  className="mt-8 text-muted-foreground hover:text-foreground"
                >
                  Continuar al Dashboard más tarde
                </Button>
              </div>

              {showResources && (
                <div className="animate-slide-up">
                  <AppointmentRequest />
                </div>
              )}

            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-slide-up max-w-2xl space-y-8">
        {!hasStarted ? (
          <div className="animate-fade-in space-y-6">
            <h1 className="text-foreground font-serif text-3xl font-bold">
              Introducción a la Evaluación
            </h1>
            <Card className="border-border bg-card p-8 shadow-md">
              <h2 className="text-foreground mb-4 font-serif text-2xl font-bold">
                {assessment.title}
              </h2>
              <p className="text-muted-foreground mb-6 text-base leading-relaxed">
                {assessment.description ||
                  'Esta evaluación nos ayuda a comprender mejor tu estado de bienestar actual y ofrecerte orientación preventiva adecuada.'}
              </p>

              <div className="bg-primary/5 border-primary/20 mb-8 space-y-4 rounded-lg border p-5">
                <div className="flex items-center gap-3">
                  <svg
                    className="text-primary h-5 w-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <span className="text-foreground mr-1 font-semibold">Tiempo estimado:</span>
                    <span className="text-muted-foreground">5 minutos</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="text-primary h-5 w-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <span className="text-foreground mr-1 font-semibold">Aviso importante:</span>
                    <span className="text-muted-foreground">
                      Responde con honestidad. No hay respuestas correctas o incorrectas.
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setHasStarted(true)}
                className="from-primary to-accent w-full bg-gradient-to-r py-6 text-lg text-primary-foreground shadow-md transition-all hover:opacity-90 hover:shadow-lg"
              >
                Comenzar Prueba
              </Button>
            </Card>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-foreground font-serif text-3xl font-bold">{assessment.title}</h1>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Pregunta {currentQuestion + 1} de {assessment.items.length}
                </span>
                <span className="text-foreground text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="border-border bg-muted mt-2 h-2 w-full overflow-hidden rounded-full border">
                <div
                  className="bg-primary h-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {error && (
              <div className="border-destructive bg-destructive/10 text-destructive rounded border p-4 text-sm">
                {error}
              </div>
            )}

            <Card className="border-border bg-card p-8 shadow-md">
              <h2 className="text-foreground font-serif text-xl font-bold transition-all">
                {currentItem.question}
              </h2>

              <div className="mt-6 space-y-3">
                {Array.from(
                  {
                    length: currentItem.scale_max - currentItem.scale_min + 1,
                  },
                  (_, i) => currentItem.scale_min + i
                ).map((value) => (
                  <label key={value} className="group flex cursor-pointer items-center gap-3">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${responses[currentItem.id] === value ? 'border-primary bg-primary' : 'border-muted-foreground group-hover:border-primary'}`}
                    >
                      <input
                        type="radio"
                        name="response"
                        value={value}
                        checked={responses[currentItem.id] === value}
                        onChange={() => handleResponse(value)}
                        className="sr-only" // Hidden native input
                      />
                      {responses[currentItem.id] === value && (
                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-foreground group-hover:text-primary text-sm transition-colors">
                      {getLabelForValue(assessment.type, value, currentItem)}
                    </span>
                  </label>
                ))}
              </div>
            </Card>

            <div className="flex gap-4">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="outline"
                className="border-border text-foreground hover:bg-muted flex-1 bg-transparent"
              >
                Anterior
              </Button>

              {currentQuestion < assessment.items.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!(currentItem.id in responses)}
                  className="from-primary to-accent flex-1 bg-gradient-to-r text-primary-foreground shadow-md hover:opacity-90"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  onClick={() => setShowConsentDialog(true)}
                  disabled={submitting || Object.keys(responses).length < assessment.items.length}
                  className="from-primary to-accent flex-1 bg-gradient-to-r text-primary-foreground shadow-md hover:opacity-90"
                >
                  {submitting ? 'Enviando...' : 'Enviar Evaluación'}
                </Button>
              )}
            </div>

            <AlertDialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground font-serif text-xl font-bold">¿Deseas compartir tus resultados?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                    Al aceptar, tus resultados serán enviados al <strong>Gabinete Psicológico</strong> para que un profesional pueda brindarte apoyo personalizado si el sistema detecta algún nivel de riesgo.
                    <br /><br />
                    Toda la información se maneja con estricta confidencialidad.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-3">
                  <AlertDialogCancel
                    onClick={() => handleSubmit(false)}
                    className="border-border text-foreground hover:bg-muted font-bold h-12 flex-1"
                  >
                    No, solo guardar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleSubmit(true)}
                    className="bg-primary hover:bg-primary/90 text-white font-bold h-12 flex-1"
                  >
                    Sí, compartir y recibir apoyo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

          </>
        )}
      </div>
    </Layout>
  );
}
