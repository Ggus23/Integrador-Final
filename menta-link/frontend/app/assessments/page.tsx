'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Zap,
  Shield,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import type { Assessment, AssessmentResponse } from '@/lib/types';

export default function AssessmentsPage() {
  const { user } = useProtected();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [userResponses, setUserResponses] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [assessmentsData, responsesData] = await Promise.all([
          apiClient.getAssessments(),
          apiClient.getMyAssessmentResponses(),
        ]);
        setAssessments(assessmentsData);
        setUserResponses(responsesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las evaluaciones');
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

  const getAssessmentStatus = (type: string) => {
    const lastResponse = [...userResponses]
      .filter((r) => {
        const assessment = assessments.find((a) => a.id === r.assessment_id);
        return assessment?.type === type;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (!lastResponse)
      return {
        label: 'Pendiente',
        color: 'bg-muted text-muted-foreground',
        icon: <Clock className="h-3 w-3" />,
      };

    // Sugerir re-evaluación poco después de expirar el bloqueo
    const daysSince = Math.floor(
      (new Date().getTime() - new Date(lastResponse.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    // Recomendación PSS-10 a 0 temporalmente
    const requiredWaitDays = type === 'PSS-10' ? 0 : 14;
    if (daysSince > requiredWaitDays)
      return {
        label: 'Re-evaluación Sugerida',
        color: 'bg-risk-medium/10 text-risk-medium border-risk-medium/20',
        icon: <AlertCircle className="h-3 w-3" />,
      };

    return {
      label: 'Completado',
      color: 'bg-support-low/10 text-support-low border-support-low/20',
      icon: <CheckCircle2 className="h-3 w-3" />,
    };
  };

  const getLastResult = (type: string) => {
    const responsesForType = userResponses
      .filter((r) => {
        const assessment = assessments.find((a) => a.id === r.assessment_id);
        return assessment?.type === type;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const last = responsesForType[0];
    const previous = responsesForType[1];

    if (!last) return null;

    let trendIcon = <Minus className="h-3 w-3" />;
    if (previous) {
      if (last.total_score < previous.total_score)
        trendIcon = <TrendingDown className="text-support-low h-3 w-3" />;
      if (last.total_score > previous.total_score)
        trendIcon = <TrendingUp className="text-risk-high h-3 w-3" />;
    }

    return {
      score: last.total_score,
      level: last.risk_level,
      date: new Date(last.created_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      }),
      daysAgo: Math.floor(
        (new Date().getTime() - new Date(last.created_at).getTime()) / (1000 * 60 * 60 * 24)
      ),
      trendIcon,
    };
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'PSS-10':
        return <Zap className="h-5 w-5" />;
      case 'PHQ-9':
        return <Brain className="h-5 w-5" />;
      case 'GAD-7':
        return <Shield className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getFriendlyTitle = (title: string) => {
    if (title.toUpperCase().includes('ESTRÉS')) return 'Evalúa tu Nivel de Estrés';
    if (title.toUpperCase().includes('DEPRESIÓN')) return 'Tu Estado de Ánimo';
    if (title.toUpperCase().includes('ANSIEDAD')) return 'Gestión de la Ansiedad';
    return title;
  };

  return (
    <Layout>
      <div className="space-y-10 pb-12">
        <div className="flex flex-col gap-4">
          <div className="text-support-low bg-support-low/10 border-support-low/20 flex w-fit items-center gap-2 rounded-full border px-4 py-1 text-[10px] font-black tracking-widest uppercase">
            <Shield className="h-3 w-3" /> Espacio Seguro y Confidencial
          </div>
          <div className="space-y-1">
            <h1 className="text-foreground decoration-primary/30 font-serif text-5xl font-black tracking-tight underline underline-offset-8">
              Espacio de Reflexión
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed font-medium">
              Tómate un momento para conectar contigo. Estas herramientas nos ayudan a brindarte el
              apoyo exacto que necesitas en tu camino académico.
            </p>
          </div>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive animate-shake rounded-xl border p-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment, index) => {
            const status = getAssessmentStatus(assessment.type);
            const history = getLastResult(assessment.type);

            // BYPASS PSS-10 temporal de 30 días a 0 para pruebas de hoy
            const requiredWaitDays = assessment.type === 'PSS-10' ? 0 : 14;
            const isLocked = history && history.daysAgo < requiredWaitDays;
            const daysToUnlock = isLocked ? requiredWaitDays - history.daysAgo : 0;

            return (
              <Card
                key={assessment.id}
                className="group border-border/40 bg-card relative flex flex-col overflow-hidden p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                {/* Status Badge */}
                <div className="animate-fade-in absolute top-4 right-4">
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-black tracking-tighter uppercase transition-colors ${status.color}`}
                  >
                    {status.icon}
                    {status.label}
                  </Badge>
                </div>

                {/* Category Icon */}
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl transition-all group-hover:scale-110 ${
                    assessment.type === 'PSS-10'
                      ? 'bg-amber-100 text-amber-600'
                      : assessment.type === 'PHQ-9'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {getCategoryIcon(assessment.type)}
                </div>

                <div className="grow space-y-2">
                  <div className="space-y-0.5">
                    <h2 className="text-foreground group-hover:text-primary font-serif text-xl leading-tight font-bold transition-colors">
                      {getFriendlyTitle(assessment.title)}
                    </h2>
                    <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                      {assessment.type}
                    </span>
                  </div>

                  <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                    {assessment.description ||
                      'Evaluación preventiva autorizada por el gabinete psicológico.'}
                  </p>
                </div>

                {/* Historial Rápido */}
                <div className="border-border/40 mt-6 border-t pt-4">
                  {history ? (
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-bold">Último:</span>
                        <span className="text-foreground font-black">{history.score} pts</span>
                        {history.trendIcon}
                      </div>
                      <div className="text-muted-foreground italic">
                        Hace {history.daysAgo === 0 ? 'hoy' : `${history.daysAgo} d`}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center text-[11px] font-medium italic">
                      Sin registros previos
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center gap-2">
                  {isLocked ? (
                    <Button
                      size="sm"
                      disabled
                      className="bg-muted/50 text-muted-foreground border-border/40 w-full cursor-not-allowed border text-[10px] font-black tracking-widest uppercase"
                    >
                      <Clock className="mr-2 h-3 w-3" />
                      Disponible en {daysToUnlock} {daysToUnlock === 1 ? 'día' : 'días'}
                    </Button>
                  ) : (
                    <>
                      <Link href={`/assessments/${assessment.type}`} className="flex-1">
                        <Button
                          size="sm"
                          className={`w-full text-[10px] font-black tracking-widest uppercase shadow-sm transition-all hover:shadow-lg ${
                            history
                              ? 'bg-muted text-foreground hover:bg-muted/80'
                              : 'from-primary to-accent bg-gradient-to-r text-white'
                          }`}
                        >
                          {history ? 'Repetir Test' : 'Comenzar Ahora'}
                        </Button>
                      </Link>
                      {history && (
                        <Link href="/dashboard">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border/60 hover:border-primary/40 hover:text-primary h-9 w-9 rounded-lg p-0 transition-all"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
