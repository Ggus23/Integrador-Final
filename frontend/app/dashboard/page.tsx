'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import type { RiskSummary, AssessmentResponse } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useProtected();
  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  const [lastAssessment, setLastAssessment] = useState<AssessmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [risk, responses] = await Promise.all([
          apiClient.getRiskSummary(),
          apiClient.getMyAssessmentResponses(),
        ]);
        setRiskSummary(risk);
        if (responses.length > 0) {
          setLastAssessment(responses[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">Loading...</div>
      </Layout>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-chart-4 text-background';
      case 'medium':
        return 'bg-secondary text-secondary-foreground';
      case 'high':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-foreground font-serif text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            ¡Hola de nuevo! Aquí tienes un resumen de tu bienestar.
          </p>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded border p-4 text-sm">
            {error}
          </div>
        )}

        {/* Risk Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          {riskSummary && (
            <>
              <Card
                className="border-border bg-card animate-slide-up p-6 shadow-sm transition-all hover:shadow-md"
                style={{ animationDelay: '0.1s' }}
              >
                <p className="text-muted-foreground text-sm">Nivel de Riesgo Actual</p>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    className={`rounded-full px-4 py-1.5 font-medium ${getRiskColor(riskSummary.current_risk_level)} shadow-sm`}
                  >
                    {riskSummary.current_risk_level.toUpperCase()}
                  </div>
                </div>
              </Card>

              <Card
                className="border-border bg-card animate-slide-up p-6 shadow-sm transition-all hover:shadow-md"
                style={{ animationDelay: '0.2s' }}
              >
                <p className="text-muted-foreground text-sm">Tendencia</p>
                <p className="text-foreground mt-3 text-2xl font-bold capitalize">
                  {riskSummary.trend}
                </p>
              </Card>

              <Card
                className="border-border bg-card animate-slide-up p-6 shadow-sm transition-all hover:shadow-md"
                style={{ animationDelay: '0.3s' }}
              >
                <p className="text-muted-foreground text-sm">Alertas Activas</p>
                <p className="text-foreground mt-3 text-2xl font-bold">
                  {riskSummary.active_alerts}
                </p>
              </Card>
            </>
          )}
        </div>

        {/* Last Assessment */}
        {lastAssessment && (
          <Card
            className="border-border bg-card animate-slide-up p-6 shadow-sm"
            style={{ animationDelay: '0.4s' }}
          >
            <h2 className="text-foreground font-serif text-xl font-bold">Última Evaluación</h2>
            <div className="mt-4 space-y-2">
              <p className="text-muted-foreground text-sm">
                ID Evaluación: {lastAssessment.assessment_id}
              </p>
              <p className="text-foreground text-2xl font-bold">
                Puntaje Total: {lastAssessment.total_score}
              </p>
              <p className="text-muted-foreground mt-3 text-sm">
                Nivel de Riesgo: {lastAssessment.risk_level}
              </p>
              <p className="text-muted-foreground text-xs">
                {new Date(lastAssessment.created_at).toLocaleDateString()}
              </p>
            </div>
          </Card>
        )}

        {/* Quick Access */}
        {user?.role === 'student' && (
          <div className="animate-slide-up space-y-4" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-foreground font-serif text-xl font-bold">Acceso Rápido</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/assessments">
                <Button className="from-primary to-accent w-full bg-gradient-to-r text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg">
                  Realizar Evaluación
                </Button>
              </Link>
              <Link href="/checkins">
                <Button className="border-border text-foreground hover:border-primary/50 w-full border bg-white shadow-sm transition-all hover:bg-slate-50">
                  Registrar Check-in
                </Button>
              </Link>
              <Link href="/alerts">
                <Button className="border-border text-foreground hover:border-primary/50 w-full border bg-white shadow-sm transition-all hover:bg-slate-50">
                  Ver Alertas
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
