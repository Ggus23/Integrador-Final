'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import Link from 'next/link';
import type { RiskSummary, AssessmentResponse, Checkin } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useProtected();
  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  const [lastAssessment, setLastAssessment] = useState<AssessmentResponse | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [aggregatedReport, setAggregatedReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        if (user.role === 'student') {
          const [risk, responses, checkinsData] = await Promise.all([
            apiClient.getRiskSummary(),
            apiClient.getMyAssessmentResponses(),
            apiClient.getMyCheckins(),
          ]);
          setRiskSummary(risk);
          if (responses.length > 0) {
            setLastAssessment(responses[0]);
          }
          setCheckins(checkinsData || []);
        } else {
          const report = await apiClient.getAggregatedReports();
          setAggregatedReport(report);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">Cargando...</div>
      </Layout>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
      case 'bajo':
        return 'bg-risk-low/10 text-risk-low border-risk-low/20';
      case 'medium':
      case 'medio':
        return 'bg-risk-medium/10 text-risk-medium border-risk-medium/20';
      case 'high':
      case 'alto':
        return 'bg-risk-high/10 text-risk-high border-risk-high/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const translateRisk = (level?: string) => {
    if (!level) return 'N/A';
    switch (level.toLowerCase()) {
      case 'high':
        return 'ALTO';
      case 'medium':
        return 'MEDIO';
      case 'low':
        return 'BAJO';
      case 'alto':
        return 'ALTO';
      case 'medio':
        return 'MEDIO';
      case 'bajo':
        return 'BAJO';
      default:
        return level.toUpperCase();
    }
  };

  const translateTrend = (trend?: string) => {
    if (!trend) return 'ESTABLE';
    switch (trend.toLowerCase()) {
      case 'improving':
        return 'MEJORANDO';
      case 'stable':
        return 'ESTABLE';
      case 'declining':
        return 'DECAYENDO';
      default:
        return trend.toUpperCase();
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-foreground font-serif text-4xl font-bold">Inicio</h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === 'student'
              ? '¡Hola de nuevo! Aquí tienes un resumen de tu bienestar.'
              : user?.role === 'psychologist'
                ? `Bienvenido, ${user.full_name}. Tienes situaciones clínicas pendientes.`
                : `Panel de Control Administrativo: ${user?.full_name}`}
          </p>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded border p-4 text-sm">
            {error}
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="space-y-6">
            <div className="animate-slide-up space-y-4" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-foreground font-serif text-xl font-bold">Gestión Administrativa</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Link href="/admin/users">
                  <Card className="border-border bg-card cursor-pointer border-l-4 border-l-purple-500 p-6 shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-bold">Control de Usuarios</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Gestionar roles, psicólogos y cuentas.
                    </p>
                  </Card>
                </Link>
                <Link href="/admin/students">
                  <Card className="border-border bg-card border-l-primary cursor-pointer border-l-4 p-6 shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-bold">Base de Estudiantes</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Auditoría de perfiles y registros técnicos.
                    </p>
                  </Card>
                </Link>
                <Link href="/admin/reports">
                  <Card className="border-border bg-card border-l-accent cursor-pointer border-l-4 p-6 shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-bold">Métricas Globales</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Análisis institucional del rendimiento.
                    </p>
                  </Card>
                </Link>
              </div>
            </div>

            {/* AI Performance Chart */}
            {aggregatedReport && (
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <RiskDistributionChart data={aggregatedReport.risk_distribution} />
              </div>
            )}
          </div>
        )}

        {user?.role === 'psychologist' && (
          <div className="space-y-6">
            <div className="animate-slide-up space-y-4" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-foreground font-serif text-xl font-bold">
                Panel Clínico Operativo
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Link href="/admin/alerts">
                  <Card className="border-border bg-card border-l-risk-high cursor-pointer border-l-4 p-6 shadow-sm transition-all hover:shadow-md">
                    <h3 className="flex items-center justify-between font-bold">
                      Alertas Críticas
                      <span className="bg-risk-high flex h-2 w-2 animate-pulse rounded-full" />
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Intervenir en casos de riesgo detectados por la IA.
                    </p>
                  </Card>
                </Link>
                <Link href="/admin/students">
                  <Card className="border-border bg-card cursor-pointer border-l-4 border-l-blue-500 p-6 shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-bold">Seguimiento de Alumnos</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Revisar historial de bienestar y evoluciones.
                    </p>
                  </Card>
                </Link>
                <Link href="/admin/reports">
                  <Card className="border-border bg-card cursor-pointer border-l-4 border-l-green-500 p-6 shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-bold">Análisis de Salud Mental</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Tendencias poblacionales y prevención.
                    </p>
                  </Card>
                </Link>
              </div>
            </div>

            {/* AI Performance Chart */}
            {aggregatedReport && (
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <RiskDistributionChart data={aggregatedReport.risk_distribution} />
              </div>
            )}
          </div>
        )}

        {user?.role === 'student' && (
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
                      {translateRisk(riskSummary.current_risk_level)}
                    </div>
                  </div>
                </Card>

                <Card
                  className="border-border bg-card animate-slide-up p-6 shadow-sm transition-all hover:shadow-md"
                  style={{ animationDelay: '0.2s' }}
                >
                  <p className="text-muted-foreground text-sm">Tendencia</p>
                  <p className="text-foreground mt-3 text-2xl font-bold">
                    {translateTrend(riskSummary.trend)}
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
        )}

        {user?.role === 'student' && checkins.length > 0 && (
          <div className="animate-slide-up space-y-4" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-foreground font-serif text-xl font-bold">Tendencia Emocional</h2>
            <TrendChart data={checkins} />
          </div>
        )}

        {user?.role === 'student' && lastAssessment && (
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
                Nivel de Riesgo: {translateRisk(lastAssessment.risk_level)}
              </p>
              <p className="text-muted-foreground text-xs">
                {new Date(lastAssessment.created_at).toLocaleDateString()}
              </p>
            </div>
          </Card>
        )}

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
                <Button className="border-border text-foreground hover:border-primary/50 bg-card hover:bg-secondary/50 w-full border shadow-sm transition-all">
                  Registrar Check-in
                </Button>
              </Link>
              <Link href="/alerts">
                <Button className="border-border text-foreground hover:border-primary/50 bg-card hover:bg-secondary/50 w-full border shadow-sm transition-all">
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
