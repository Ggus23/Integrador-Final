'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import type { Assessment } from '@/lib/types';

export default function AssessmentsPage() {
  const { user } = useProtected();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchAssessments = async () => {
      try {
        const data = await apiClient.getAssessments();
        setAssessments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-foreground font-serif text-4xl font-bold">Evaluaciones</h1>
          <p className="text-muted-foreground mt-2">
            Elige una evaluación para completar. Todas las respuestas son confidenciales.
          </p>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded border p-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {assessments.map((assessment, index) => (
            <Card
              key={assessment.id}
              className="border-border bg-card animate-slide-up p-6 shadow-sm transition-all hover:shadow-md"
              style={{ animationDelay: `${(index + 1) * 0.1}s` }}
            >
              <h2 className="text-foreground font-serif text-xl font-bold">{assessment.title}</h2>
              <p className="text-muted-foreground mt-2 text-sm">{assessment.description}</p>
              <p className="text-muted-foreground mt-4 text-xs">Tiempo estimado: 5 minutos</p>
              <Link href={`/assessments/${assessment.type}`} className="mt-4 inline-block">
                <Button className="from-primary to-accent w-full bg-gradient-to-r text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg">
                  Comenzar Evaluación
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
