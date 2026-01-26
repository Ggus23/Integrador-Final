'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        setError(err instanceof Error ? err.message : 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [user, filters]);

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
          <h1 className="text-foreground font-serif text-4xl font-bold">Student Alerts</h1>
          <p className="text-muted-foreground mt-2">
            Monitor early warning indicators across students
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={filters.risk_level}
            onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}
            className="border-border bg-background text-foreground outline-ring/50 border px-3 py-2 text-sm"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border-border bg-background text-foreground outline-ring/50 border px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded border p-4 text-sm">
            {error}
          </div>
        )}

        {alerts.length === 0 ? (
          <Card className="border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No alerts match your filters</p>
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
                  <Button className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                    Ver Estudiante
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
