'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Assessment } from '@/lib/types';

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

  const handleSubmit = async () => {
    if (!assessment) return;
    setSubmitting(true);
    try {
      await apiClient.submitAssessmentResponse(assessment.id, responses);
      setCompleted(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <Layout>
        <div className="animate-fade-in flex min-h-[400px] items-center justify-center">
          <Card className="border-border bg-card p-8 text-center shadow-lg">
            <h2 className="text-foreground font-serif text-2xl font-bold">¡Gracias!</h2>
            <p className="text-muted-foreground mt-4">
              Tus respuestas han sido registradas. Redirigiendo al panel principal...
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-slide-up max-w-2xl space-y-8">
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
                  {value === currentItem.scale_min
                    ? currentItem.scale_min_label
                    : value === currentItem.scale_max
                      ? currentItem.scale_max_label
                      : value}
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
              className="from-primary to-accent flex-1 bg-gradient-to-r text-white shadow-md hover:opacity-90"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(responses).length < assessment.items.length}
              className="from-primary to-accent flex-1 bg-gradient-to-r text-white shadow-md hover:opacity-90"
            >
              {submitting ? 'Enviando...' : 'Enviar Evaluación'}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
}
