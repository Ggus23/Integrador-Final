'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RiskFactorsChart } from '@/components/RiskFactorsChart';
import { EmotionalTrendsPanel } from '@/components/EmotionalTrendsPanel';

export default function StudentAnalyticsPage() {
  const { user: currentUser, loading } = useProtected();
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<{
    details: any;
    trends: any;
    loading: boolean;
    error: string;
  }>({
    details: null,
    trends: null,
    loading: true,
    error: '',
  });

  useEffect(() => {
    if (loading) return;
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchStudent();
  }, [currentUser, loading, studentId]);

  const fetchStudent = async () => {
    try {
      setPageLoading(true);
      const details = await apiClient.getStudentDetails(studentId);
      setStudent({
        id: studentId,
        full_name: details.full_name,
        email: details.email,
        role: details.role,
      });
      const trends = await apiClient.getStudentTrends(studentId);
      setData({ details, trends, loading: false, error: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Estudiante no encontrado');
    } finally {
      setPageLoading(false);
    }
  };

  if (loading || pageLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl space-y-8 px-4 pb-12">
          <Skeleton className="h-10 w-64 rounded bg-slate-800" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl bg-slate-800" />
            ))}
          </div>
          <Skeleton className="h-[300px] w-full rounded-xl bg-slate-800" />
          <Skeleton className="h-[250px] w-full rounded-xl bg-slate-800" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-12">
          <Card className="bg-destructive/10 border-destructive text-destructive p-6 text-center">
            <p className="mb-2 font-bold">Error</p>
            <p>{error}</p>
            <Button className="mt-4" variant="outline" onClick={() => router.push('/admin/users')}>
              Volver a Usuarios
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const details = data.details;
  const trends = data.trends;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl space-y-8 px-4 pb-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground -ml-2"
                onClick={() => router.push('/admin/users')}
              >
                ← Volver
              </Button>
              <h1 className="text-foreground font-serif text-3xl font-bold">
                Analítica del Estudiante
              </h1>
            </div>
            <p className="text-muted-foreground mt-1 ml-10">
              <span className="text-foreground font-bold">{student?.full_name}</span>
              <span className="mx-2">·</span>
              {student?.email}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              student?.role === 'student'
                ? 'border-slate-700 bg-slate-600 px-3 py-1 font-bold text-white'
                : 'border-slate-700 bg-slate-600 px-3 py-1 font-bold text-white'
            }
          >
            {student?.role === 'student' ? 'ESTUDIANTE' : student?.role?.toUpperCase()}
          </Badge>
        </div>

        {/* Loading State */}
        {data.loading ? (
          <div className="space-y-6 py-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl bg-slate-800" />
              ))}
            </div>
            <Skeleton className="h-[300px] w-full rounded-xl bg-slate-800" />
            <Skeleton className="h-[250px] w-full rounded-xl bg-slate-800" />
          </div>
        ) : data.error ? (
          <Card className="border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-400">
            <p className="mb-2 font-bold">Error al cargar datos</p>
            <p className="text-sm">{data.error}</p>
            <Button className="mt-4" variant="outline" onClick={fetchStudent}>
              Reintentar
            </Button>
          </Card>
        ) : details && trends ? (
          <div className="space-y-6 text-slate-100">
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Riesgo General */}
              {(() => {
                const lvl = details.risk_summary?.current_risk_level || details.risk_level;
                const isHigh = lvl === 'high' || lvl === 'alto';
                const isMed = lvl === 'medium' || lvl === 'medio';
                return (
                  <div
                    className={`space-y-2 rounded-xl border p-5 ${
                      isHigh
                        ? 'border-rose-500/30 bg-rose-500/10'
                        : isMed
                          ? 'border-amber-500/30 bg-amber-500/10'
                          : 'border-emerald-500/30 bg-emerald-500/10'
                    }`}
                  >
                    <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
                      Estado de Riesgo
                    </p>
                    <p
                      className={`text-3xl font-black ${
                        isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {isHigh ? '🚨 ALTO' : isMed ? '⚠️ MEDIO' : '✅ BAJO'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {isHigh
                        ? 'Requiere intervención prioritaria.'
                        : isMed
                          ? 'Seguimiento recomendado.'
                          : 'Bienestar estable.'}
                    </p>
                  </div>
                );
              })()}

              {/* Probabilidad de Abandono */}
              {(() => {
                const prob = details.risk_summary?.dropout_probability;
                const pct = prob !== undefined ? prob * 100 : null;
                const isHigh = pct !== null && pct >= 60;
                const isMed = pct !== null && pct >= 30;
                return (
                  <div
                    className={`space-y-2 rounded-xl border p-5 ${
                      isHigh
                        ? 'border-rose-500/30 bg-rose-500/10'
                        : isMed
                          ? 'border-amber-500/30 bg-amber-500/10'
                          : 'border-emerald-500/30 bg-emerald-500/10'
                    }`}
                  >
                    <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
                      Prob. Abandono (IA)
                    </p>
                    <p
                      className={`text-3xl font-black ${
                        isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {pct !== null ? `${pct.toFixed(0)}%` : '—'}
                    </p>
                    {pct !== null && (
                      <div className="h-2 w-full rounded-full bg-slate-800">
                        <div
                          className={`h-2 rounded-full ${
                            isHigh ? 'bg-rose-400' : isMed ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    )}
                    <p className="text-sm text-slate-400">
                      Basado en GPA, reprobación e inactividad.
                    </p>
                  </div>
                );
              })()}

              {/* Confianza Modelo */}
              {(() => {
                const conf = details.risk_summary?.prediction_confidence;
                const pct = conf !== undefined ? conf * 100 : null;
                return (
                  <div className="space-y-2 rounded-xl border border-slate-700/40 bg-slate-800/30 p-5">
                    <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
                      Confianza del Modelo
                    </p>
                    <p className="text-3xl font-black text-purple-400">
                      {pct !== null ? `${pct.toFixed(0)}%` : '—'}
                    </p>
                    {pct !== null && (
                      <div className="h-2 w-full rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-purple-400"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    )}
                    <p className="text-sm text-slate-400">Precisión según historial registrado.</p>
                  </div>
                );
              })()}
            </div>

            {/* ── Factores de Riesgo ── */}
            <Card className="border-slate-700/40 bg-slate-900/60 p-6">
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <h4 className="text-base font-bold text-white">⚖️ Factores de Riesgo (IA)</h4>
                  <p className="mt-1 text-sm text-slate-400">
                    Variables con mayor peso en el diagnóstico. Barra más larga = mayor impacto.
                  </p>
                </div>
                <span className="shrink-0 rounded border border-teal-500/20 bg-teal-500/10 px-3 py-1.5 text-xs font-bold text-teal-400">
                  Mayor barra = Mayor impacto
                </span>
              </div>
              <RiskFactorsChart factors={details.risk_factors || {}} />
            </Card>

            {/* ── Tendencias Emocionales ── */}
            <Card className="border-slate-700/40 bg-slate-900/60 p-6 sm:p-8">
              <div className="mb-6 border-b border-slate-700/50 pb-4">
                <h4 className="text-base font-bold text-white">🧠 Bienestar Emocional</h4>
                <p className="mt-1 text-sm text-slate-400">
                  Índice de equilibrio, distribución de emociones y evolución semanal.
                </p>
              </div>
              <EmotionalTrendsPanel data={trends} />
            </Card>

            {/* ── Rendimiento Académico ── */}
            {details.academic_profile && (
              <Card className="space-y-6 border-slate-700/40 bg-slate-900/60 p-6">
                <h4 className="text-base font-bold text-white">🎓 Rendimiento Académico</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-700/40 bg-slate-800/60 p-4">
                    <p className="text-xs font-black text-slate-500 uppercase">Carrera</p>
                    <p className="mt-1 text-base font-bold">
                      {details.academic_profile.course || 'No especificada'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-700/40 bg-slate-800/60 p-4">
                    <p className="text-xs font-black text-slate-500 uppercase">
                      Materias Aprobadas
                    </p>
                    <p className="mt-1 text-base font-bold">
                      {details.academic_profile.units_approved} unidades
                    </p>
                  </div>
                  <div className="rounded-xl border border-purple-700/30 bg-purple-950/30 p-4">
                    <p className="text-xs font-black text-purple-400/70 uppercase">GPA Total</p>
                    <p className="mt-1 text-2xl font-black text-purple-300">
                      {Math.round(details.academic_profile.current_gpa)}
                      <span className="text-sm font-normal text-purple-400/50"> / 100</span>
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-700/50">
                      <div
                        className="h-2 rounded-full bg-purple-400"
                        style={{ width: `${Math.min(details.academic_profile.current_gpa, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[2, 3, 4, 5].map((num) => {
                    const proc = details.academic_profile[`hito${num}_procesual`] || 0;
                    const nota = details.academic_profile[`hito${num}_nota`] || 0;
                    const total = proc + nota;
                    const color =
                      total >= 51
                        ? 'text-emerald-400'
                        : total >= 31
                          ? 'text-amber-400'
                          : 'text-rose-400';
                    const bar =
                      total >= 51 ? 'bg-emerald-400' : total >= 31 ? 'bg-amber-400' : 'bg-rose-400';
                    return (
                      <div
                        key={num}
                        className="rounded-xl border border-slate-700/40 bg-slate-800/50 p-4 text-center"
                      >
                        <p className="mb-1 text-xs font-black text-slate-500 uppercase">
                          Hito {num}
                        </p>
                        <p className={`text-2xl font-black ${color}`}>{total}</p>
                        <p className="text-xs text-slate-600">/ 25 pts</p>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-700/50">
                          <div
                            className={`h-1.5 rounded-full ${bar}`}
                            style={{ width: `${Math.min(total, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="border-slate-700/40 bg-slate-900/60 p-12 text-center">
            <p className="text-lg text-slate-500 italic">No hay datos analíticos para mostrar.</p>
          </Card>
        )}
      </div>
    </Layout>
  );
}
