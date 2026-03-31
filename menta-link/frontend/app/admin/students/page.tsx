'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { StudentSummary } from '@/lib/types';

export default function AdminStudentsPage() {
  const { user } = useProtected();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !['psychologist', 'tutor', 'admin'].includes(user.role)) return;

    const fetchStudents = async () => {
      try {
        const data = await apiClient.getStudents();
        setStudents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar estudiantes');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

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

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-foreground font-serif text-4xl font-bold">Estudiantes</h1>
          <p className="text-muted-foreground mt-2">
            Listado de estudiantes y su nivel de riesgo actual
          </p>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded border p-4 text-sm">
            {error}
          </div>
        )}

        {students.length === 0 ? (
          <Card className="border-border bg-card animate-fade-in p-8 text-center">
            <p className="text-muted-foreground">No se encontraron estudiantes.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student, index) => (
              <Card
                key={student.id}
                className="border-border bg-card animate-slide-up p-6 shadow-sm transition-all hover:shadow-md"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">{student.full_name}</h3>
                      <p className="text-muted-foreground text-sm">{student.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-sm font-medium">Riesgo:</span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskColor(student.risk_level)}`}
                      >
                        {translateRisk(student.risk_level)}
                      </span>
                    </div>

                    <div className="text-muted-foreground flex justify-between text-sm">
                      <span>Alertas Activas: {student.active_alerts}</span>
                    </div>

                    <Link href={`/admin/students/${student.id}`}>
                      <Button className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 mt-2 w-full">
                        Ver Detalles
                      </Button>
                    </Link>
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
