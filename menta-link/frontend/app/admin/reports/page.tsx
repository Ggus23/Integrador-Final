'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';

interface ReportData {
  total_population: number;
  risk_distribution: Record<string, number>;
  average_mood_score: number;
  generated_at: string;
}

export default function AdminReportsPage() {
  const { user } = useProtected();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !['psychologist', 'tutor', 'admin'].includes(user.role)) return;

    const fetchReport = async () => {
      try {
        const data = await apiClient.getAggregatedReports();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los reportes');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">Cargando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in space-y-8">
        <div>
          <h1 className="text-foreground font-serif text-4xl font-bold">
            Reportes Institucionales
          </h1>
          <p className="text-muted-foreground mt-2">
            Visión general del estado de bienestar estudiantil
          </p>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded border p-4 text-sm">
            {error}
          </div>
        )}

        {report && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Total Population */}
            <Card className="border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-muted-foreground text-sm font-medium">Población Estudiantil</h3>
              <p className="text-foreground mt-2 text-4xl font-bold">{report.total_population}</p>
            </Card>

            {/* Average Mood */}
            <Card className="border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-muted-foreground text-sm font-medium">
                Ánimo Promedio (Check-ins)
              </h3>
              <p className="text-primary mt-2 text-4xl font-bold">{report.average_mood_score}/5</p>
            </Card>

            {/* Risk Distribution Chart Placeholder */}
            <Card className="border-border bg-card col-span-full p-6 shadow-sm transition-all hover:shadow-md md:col-span-1">
              <h3 className="text-muted-foreground mb-4 text-sm font-medium">
                Distribución de Riesgo
              </h3>
              <div className="space-y-3">
                {Object.entries(report.risk_distribution).map(([level, count]) => (
                  <div key={level} className="flex items-center gap-2">
                    <div className="w-20 text-sm capitalize">
                      {level === 'high' ? 'Alto' : level === 'medium' ? 'Medio' : 'Bajo'}
                    </div>
                    <div className="bg-muted h-4 flex-1 overflow-hidden rounded-full">
                      <div
                        className={`h-full ${level.toLowerCase() === 'high' ? 'bg-risk-high' : level.toLowerCase() === 'medium' ? 'bg-risk-medium' : 'bg-risk-low'}`}
                        style={{ width: `${(count / report.total_population) * 100}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-sm">{count}</div>
                  </div>
                ))}
                {Object.keys(report.risk_distribution).length === 0 && (
                  <p className="text-muted-foreground text-sm">No hay datos suficientes.</p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
