'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { DropoutTrendChart } from '@/components/dashboard/DropoutTrendChart';
import { RiskDistributionChart } from '@/components/dashboard/RiskDistributionChart';
import { LinearRegressionChart } from '@/components/dashboard/LinearRegressionChart';
import { RecommendationsPanel } from '@/components/dashboard/RecommendationsPanel';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  BookOpen,
  PlusCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  History,
  ClipboardList,
  Heart,
  BrainCircuit,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { RiskSummary, AssessmentResponse, Checkin } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useProtected();
  const [riskSummary, setRiskSummary] = useState<RiskSummary | null>(null);
  const [lastAssessment, setLastAssessment] = useState<AssessmentResponse | null>(null);
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
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
          setAssessments(responses || []);
          if (responses && responses.length > 0) {
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
        <div className="flex h-[60vh] items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
      case 'bajo':
        return 'text-risk-low bg-risk-low/10 border-risk-low/20 drop-shadow-[0_0_10px_rgba(90,158,114,0.6)]';
      case 'medium':
      case 'medio':
        return 'text-risk-medium bg-risk-medium/10 border-risk-medium/20 drop-shadow-[0_0_10px_rgba(212,137,74,0.6)]';
      case 'high':
      case 'alto':
        return 'text-risk-high bg-risk-high/10 border-risk-high/20 drop-shadow-[0_0_10px_rgba(185,64,64,0.6)]';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const translateTrend = (trend?: string) => {
    if (!trend) return 'ESTABLE';
    const trends: Record<string, string> = {
      improving: 'Mejorando',
      stable: 'Estable',
      declining: 'Decayendo',
    };
    return trends[trend.toLowerCase()] || trend.toUpperCase();
  };

  return (
    <Layout>
      <div className="space-y-10 pb-12">
        {/* SECTION: Welcome Bar (Compact) */}
        <div className="animate-fade-in border-border/40 flex flex-col gap-6 border-b pb-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-1">
              <h1 className="text-foreground font-serif text-3xl font-black tracking-tight">
                Panel de Bienestar
              </h1>
              <div className="text-muted-foreground flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                <span className="bg-support-medium h-1.5 w-1.5 animate-pulse rounded-full" />
                Actualizado:{' '}
                {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </div>
            </div>

            <div className="bg-card/50 border-border/40 flex items-center gap-4 rounded-2xl border px-4 py-2 shadow-sm backdrop-blur-sm">
              <div className="flex flex-col items-end">
                <span className="text-muted-foreground text-[10px] leading-none font-black uppercase">
                  Buen día,
                </span>
                <span className="text-foreground text-sm font-bold">
                  {user?.full_name?.split(' ')[0]}
                </span>
              </div>
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl font-black uppercase">
                {user?.full_name?.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive animate-shake rounded-xl border p-4 text-sm">
            {error}
          </div>
        )}

        {/* STUDENT VIEW */}
        {user?.role === 'student' && (
          <div className="space-y-12">
            {/* 1. KPIs Zone (Primary Indicators) */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/40 flex flex-col justify-between p-5 transition-all hover:shadow-md">
                <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                  Riesgo IA
                </span>
                <div className="mt-2 flex items-center justify-between">
                  <motion.div
                    whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                    className={`cursor-default rounded-lg border px-3 py-1 text-xs font-bold transition-all ${getRiskColor(riskSummary?.current_risk_level || 'low')}`}
                  >
                    {riskSummary?.current_risk_level?.toUpperCase() || 'BAJO'}
                  </motion.div>
                  <AlertTriangle className="text-muted-foreground/30 h-5 w-5" />
                </div>
              </Card>

              <Card className="border-border/40 flex flex-col justify-between p-5 transition-all hover:shadow-md">
                <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                  Tendencia
                </span>
                <div className="mt-2 flex items-center justify-between">
                  <motion.span
                    whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                    className="text-primary cursor-default text-xl font-black drop-shadow-[0_0_10px_rgba(192,104,74,0.5)]"
                  >
                    {translateTrend(riskSummary?.trend)}
                  </motion.span>
                  <TrendingUp className="text-support-medium h-5 w-5" />
                </div>
              </Card>

              <Card className="border-border/40 flex flex-col justify-between p-5 transition-all hover:shadow-md">
                <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                  Alertas Activas
                </span>
                <div className="mt-2 flex items-center justify-between">
                  <motion.span
                    whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                    className="text-coral cursor-default text-xl font-black drop-shadow-[0_0_10px_rgba(240,160,128,0.5)]"
                  >
                    {riskSummary?.active_alerts || 0}
                  </motion.span>
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${riskSummary?.active_alerts ? 'bg-risk-high animate-pulse' : 'bg-muted'}`}
                  />
                </div>
              </Card>

              <Card className="border-border/40 flex flex-col justify-between p-5 transition-all hover:shadow-md">
                <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                  Continuidad
                </span>
                <div className="mt-2 flex items-center justify-between">
                  {/* Calculamos un proxy de éxito basado en el riesgo */}
                  <motion.span
                    whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                    className="text-support-low cursor-default text-xl font-black drop-shadow-[0_0_10px_rgba(122,158,126,0.5)]"
                  >
                    {riskSummary
                      ? `${(100 - riskSummary.dropout_probability * 100).toFixed(0)}%`
                      : '---'}
                  </motion.span>
                  <Activity className="text-support-low h-5 w-5" />
                </div>
              </Card>
            </section>

            {/* 2. Charts Zone (Empty States) */}
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <Activity className="text-support-medium h-4 w-4" /> Evolución de Bienestar
                  </h2>
                </div>
                {checkins.length > 0 ? (
                  <TrendChart data={checkins} />
                ) : (
                  <Card className="border-border/40 bg-muted/20 flex h-[350px] flex-col items-center justify-center border-dashed p-8 text-center">
                    <History className="text-muted-foreground/40 mb-4 h-12 w-12" />
                    <p className="text-muted-foreground text-sm font-medium italic">
                      "Tu gráfico emocional aparecerá aquí cuando registres tu primera experiencia
                      del día."
                    </p>
                    <Link href="/checkins" className="mt-4">
                      <Button variant="outline" size="sm">
                        Hacer mi primer registro
                      </Button>
                    </Link>
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <BookOpen className="text-support-low h-4 w-4" /> Meta de Continuidad
                  </h2>
                </div>
                {assessments.length > 0 ? (
                  <DropoutTrendChart data={assessments} />
                ) : (
                  <Card className="border-border/40 bg-muted/20 flex h-[350px] flex-col items-center justify-center border-dashed p-8 text-center">
                    <ClipboardList className="text-muted-foreground/40 mb-4 h-12 w-12" />
                    <p className="text-muted-foreground text-sm font-medium italic">
                      "Completa tu evaluación de estrés para proyectar tu éxito académico."
                    </p>
                    <Link href="/assessments" className="mt-4">
                      <Button variant="outline" size="sm">
                        Ir a Evaluaciones
                      </Button>
                    </Link>
                  </Card>
                )}
              </div>
            </section>

            {/* 3. Quick Actions & Dynamic Insights Zone */}
            <section className="grid gap-8 lg:grid-cols-3">
              {/* Plan de Bienestar: Minimalista & Dinámico */}
              <div className="space-y-4 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-bold italic">
                    <Sparkles className="text-support-medium h-4 w-4" />
                    {riskSummary?.recommendations && riskSummary.recommendations.length > 0
                      ? 'Tu Guía de Bienestar Personalizada'
                      : 'Próximas Recomendaciones'}
                  </h2>
                  {riskSummary?.recommendations && riskSummary.recommendations.length > 0 && (
                    <Link
                      href="/assessments"
                      className="text-primary text-[10px] font-black tracking-widest uppercase hover:underline"
                    >
                      Ver Plan Completo
                    </Link>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {riskSummary?.recommendations && riskSummary.recommendations.length > 0 ? (
                    riskSummary.recommendations.slice(0, 4).map((rec, i) => (
                      <Link href={`/test-interventions?idx=${i}`} key={i} className="block">
                        <Card
                          className="group bg-card/40 border-primary/10 hover:border-primary/30 relative overflow-hidden p-5 transition-all hover:shadow-sm h-full"
                        >
                          <div className="absolute top-0 right-0 p-2 opacity-10 transition-opacity group-hover:opacity-20">
                            {i % 2 === 0 ? (
                              <Heart className="h-8 w-8" />
                            ) : (
                              <BrainCircuit className="h-8 w-8" />
                            )}
                          </div>
                          <div className="flex items-start gap-4">
                            <div
                              className={`mt-1 flex h-2 w-2 shrink-0 rounded-full ${i % 2 === 0 ? 'bg-support-medium' : 'bg-support-low'}`}
                            />
                            <p className="text-foreground/90 text-sm leading-relaxed font-medium">
                              {typeof rec === 'string' ? rec : (rec.metadata?.description || rec.metadata?.title || 'Sugerencia de Bienestar')}
                            </p>
                          </div>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <Card className="bg-support-medium/5 border-support-medium/20 col-span-2 flex flex-col items-center justify-center gap-3 border-dashed p-8 text-center">
                      <div className="bg-background rounded-full p-3 shadow-inner">
                        <Sparkles className="text-support-medium h-6 w-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-foreground text-sm font-bold">
                          Activa tus recomendaciones IA
                        </p>
                        <p className="text-muted-foreground text-xs italic">
                          Completa el test PSS-10 para que nuestro asistente genere tu plan
                          personalizado.
                        </p>
                      </div>
                      <Link href="/assessments/pss10">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-support-medium text-support-medium hover:bg-support-medium mt-2 font-bold transition-all hover:text-white"
                        >
                          Comenzar PSS-10
                        </Button>
                      </Link>
                    </Card>
                  )}
                </div>
              </div>

              {/* Quick Access Menu */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Gestión Rápida</h2>
                <div className="grid gap-3">
                  <Link href="/academic">
                    <Button className="bg-card border-border/40 text-foreground hover:bg-muted/50 group h-12 w-full justify-between border shadow-sm transition-all">
                      <div className="flex items-center gap-2">
                        <BookOpen className="text-primary h-4 w-4" />
                        <span>Mi Academia</span>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                    </Button>
                  </Link>
                  <Link href="/appointments">
                    <Button className="bg-card border-border/40 text-foreground hover:bg-muted/50 group h-12 w-full justify-between border shadow-sm transition-all">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-support-medium h-4 w-4" />
                        <span>Apoyo Profesional</span>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

            {/* Banner Informativo (at bottom) */}
            <section className="bg-muted/30 border-border/40 flex items-center gap-4 rounded-2xl border p-5 text-sm">
              <div className="bg-background flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm">
                <AlertTriangle className="text-primary h-5 w-5" />
              </div>
              <p className="text-muted-foreground leading-snug">
                <strong>Nota:</strong> MentaLink es una herramienta preventiva. En caso de una
                crisis emocional severa, por favor contacta directamente con el centro de salud
                universitario más cercano.
              </p>
            </section>
          </div>
        )}

        {/* ADMIN / PSYCHOLOGIST VIEW (Simplified) */}
        {(user?.role === 'admin' || user?.role === 'psychologist') && (
          <div className="animate-slide-up space-y-8">

            {/* HOW TO ACCESS AS ADMIN — Info Banner */}
            <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 md:items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-foreground font-bold text-base">
                      ¿Cómo acceder como Administrador?
                    </h2>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Guía rápida de acceso y navegación para roles administrativos
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                    <div className="rounded-xl border border-border/30 bg-background/60 p-3 space-y-1">
                      <div className="font-black text-foreground text-[10px] tracking-widest uppercase">
                        1 · Inicio de Sesión
                      </div>
                      <p className="text-muted-foreground leading-snug">
                        Ingresa a <strong>/login</strong> con tus credenciales de administrador
                        (email institucional + contraseña asignada).
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/30 bg-background/60 p-3 space-y-1">
                      <div className="font-black text-foreground text-[10px] tracking-widest uppercase">
                        2 · Panel Principal
                      </div>
                      <p className="text-muted-foreground leading-snug">
                        Al ingresar, el sistema detecta tu rol y carga este{' '}
                        <strong>Panel de Administrador</strong> automáticamente con estadísticas
                        globales.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/30 bg-background/60 p-3 space-y-1">
                      <div className="font-black text-foreground text-[10px] tracking-widest uppercase">
                        3 · Módulos Disponibles
                      </div>
                      <p className="text-muted-foreground leading-snug">
                        Navega a <strong>Control de Usuarios</strong> para gestionar cuentas,
                        <strong> Seguimiento de Alumnos</strong> para ver perfiles y{' '}
                        <strong>Reportes</strong> para estadísticas institucionales.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link href="/admin/users">
                      <button className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all">
                        → Control de Usuarios
                      </button>
                    </Link>
                    <Link href="/admin/students">
                      <button className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/40 text-muted-foreground hover:bg-muted/20 transition-all">
                        → Estudiantes
                      </button>
                    </Link>
                    <Link href="/admin/reports">
                      <button className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border/40 text-muted-foreground hover:bg-muted/20 transition-all">
                        → Reportes
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link href={user.role === 'admin' ? '/admin/users' : '/admin/alerts'}>
                <Card className="border-border bg-card border-l-primary cursor-pointer border-l-4 p-6 shadow-sm transition-all hover:shadow-md">
                  <h3 className="font-bold">
                    {user.role === 'admin' ? 'Control de Usuarios' : 'Alertas Críticas'}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Gestionar accesos y situaciones clínicas.
                  </p>
                </Card>
              </Link>
              <Link href="/admin/students">
                <Card className="border-border bg-card border-l-support-medium cursor-pointer border-l-4 p-6 shadow-sm transition-all hover:shadow-md">
                  <h3 className="font-bold">Seguimiento de Alumnos</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Revisar historial y evoluciones de bienestar.
                  </p>
                </Card>
              </Link>
              <Link href="/admin/reports">
                <Card className="border-border bg-card border-l-support-low cursor-pointer border-l-4 p-6 shadow-sm transition-all hover:shadow-md">
                  <h3 className="font-bold">Reportes Globales</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Estadísticas institucionales de salud mental.
                  </p>
                </Card>
              </Link>
            </div>
            {aggregatedReport && (
              <div className="space-y-6">
                <div className="max-w-md">
                  <RiskDistributionChart data={aggregatedReport.risk_distribution} />
                </div>
                <LinearRegressionChart />
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
