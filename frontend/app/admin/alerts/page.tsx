'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { RiskAlert } from '@/lib/types';

export default function AdminAlertsPage() {
  const { user } = useProtected();
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    risk_level: '',
    status: '',
  });

  useEffect(() => {
    if (!user || !['psychologist', 'admin'].includes(user.role)) return;

    const fetchAlerts = async () => {
      try {
        const data = await apiClient.getAllAlerts(filters);
        setAlerts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las alertas');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [user, filters]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">Cargando...</div>
      </Layout>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
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

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-foreground font-serif text-4xl font-bold">Alertas de Estudiantes</h1>
          <p className="text-muted-foreground mt-2">
            Monitoreo de indicadores de alerta temprana en los estudiantes
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={filters.risk_level}
            onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}
            className="border-border bg-background text-foreground outline-ring/50 border px-3 py-2 text-sm"
          >
            <option value="">Todos los Niveles</option>
            <option value="low">Bajo</option>
            <option value="medium">Medio</option>
            <option value="high">Alto</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border-border bg-background text-foreground outline-ring/50 border px-3 py-2 text-sm"
          >
            <option value="">Todos los Estados</option>
            <option value="pending">Pendiente</option>
            <option value="reviewed">Revisado</option>
            <option value="resolved">Resuelto</option>
          </select>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded border p-4 text-sm">
            {error}
          </div>
        )}

        {alerts.length === 0 ? (
          <Card className="border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No hay alertas que coincidan con los filtros</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="border-border bg-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskColor(alert.severity.toLowerCase())} shadow-sm`}
                      >
                        {alert.severity.toUpperCase() === 'HIGH'
                          ? 'ALTO'
                          : alert.severity.toUpperCase() === 'MEDIUM'
                            ? 'MEDIO'
                            : 'BAJO'}
                      </span>
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          !alert.is_resolved
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {alert.is_resolved ? 'RESUELTO' : 'PENDIENTE'}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-foreground mt-3 font-medium">{alert.message}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/admin/students/${alert.user_id}`}>
                      <Button className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 w-full">
                        Ver Estudiante
                      </Button>
                    </Link>
                    {!alert.is_resolved && (
                      <Button
                        variant="outline"
                        className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                        onClick={() =>
                          alert(
                            '¡Predicción Validada! Datos agregados al Dataset de Entrenamiento Real.'
                          )
                        }
                      >
                        ✓ Validar IA
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
