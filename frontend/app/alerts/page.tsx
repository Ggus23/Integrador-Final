'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import type { RiskAlert } from '@/lib/types';

export default function AlertsPage() {
  const { user } = useProtected();
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'student') return;

    const fetchAlerts = async () => {
      try {
        const data = await apiClient.getMyAlerts();
        setAlerts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
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
          <h1 className="text-foreground font-serif text-4xl font-bold">Mis Alertas</h1>
          <p className="text-muted-foreground mt-2">
            Indicadores tempranos de tus actividades recientes
          </p>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded border p-4 text-sm">
            {error}
          </div>
        )}

        {alerts.length === 0 ? (
          <Card className="border-border bg-card animate-fade-in p-8 text-center shadow-sm">
            <p className="text-muted-foreground">
              No tienes alertas en este momento. ¡Sigue cuidando tu bienestar!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <Card
                key={alert.id}
                className="border-border bg-card animate-slide-up p-6 shadow-sm transition-all hover:shadow-md"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
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
                      <span className="text-muted-foreground text-sm">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-foreground mt-3 font-medium">{alert.message}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Estado: {alert.is_resolved ? 'Resuelto' : 'Pendiente'}
                    </p>
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
