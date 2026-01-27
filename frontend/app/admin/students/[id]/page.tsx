'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiskFactorsChart } from '@/components/RiskFactorsChart';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ClinicalNote {
  id: number;
  content: string;
  psychologist_name?: string;
  created_at: string;
}

interface StudentDetails {
  id: string;
  full_name: string;
  email: string;
  role: string;
  risk_summary: {
    current_risk_level: string;
    prediction_confidence?: number;
  } | null;
  risk_factors?: Record<string, number>;
  recent_checkins: {
    id: string;
    mood_score: number;
    energy_level?: number;
    sleep_hours?: number;
    note?: string;
    created_at: string;
  }[];
  alerts: {
    id: string;
    severity: string;
    message: string;
    is_resolved: boolean;
    created_at: string;
  }[];
  assessment_responses: {
    id: string;
    assessment_id: number;
    total_score: number;
    risk_level: string;
    created_at: string;
  }[];
}

export default function StudentDetailPage() {
  const { user } = useProtected();
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id as string;

  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Notes State
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    if (!user || !['psychologist', 'admin'].includes(user.role) || !studentId) return;

    const fetchDetails = async () => {
      try {
        const data = await apiClient.getStudentDetails(studentId);
        setStudent(data);

        // Fetch notes separately
        try {
          const notesData = await apiClient.getClinicalNotes(studentId);
          setNotes(notesData);
        } catch (e) {
          console.error('Error fetching notes', e);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando datos del estudiante');
        toast.error('No se pudieron obtener los detalles del estudiante');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [user, studentId]);

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;
    setNoteLoading(true);
    try {
      await apiClient.createClinicalNote(studentId, newNoteContent);
      toast.success('Nota clínica guardada');
      setNewNoteContent('');
      setIsNoteDialogOpen(false);

      // Refresh notes
      const notesData = await apiClient.getClinicalNotes(studentId);
      setNotes(notesData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar nota');
    } finally {
      setNoteLoading(false);
    }
  };

  const getRiskColor = (level?: string) => {
    if (!level) return 'bg-muted text-muted-foreground';
    switch (level.toLowerCase()) {
      case 'high':
      case 'alto':
        return 'bg-risk-high/10 text-risk-high border-risk-high/20';
      case 'medium':
      case 'medio':
        return 'bg-risk-medium/10 text-risk-medium border-risk-medium/20';
      case 'low':
      case 'bajo':
        return 'bg-risk-low/10 text-risk-low border-risk-low/20';
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

  const executeDelete = async () => {
    try {
      await apiClient.deleteUser(studentId);
      toast.success('Estudiante y datos eliminados correctamente');
      router.push('/admin/students');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-muted-foreground flex justify-center py-12">Cargando perfil...</div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="text-destructive py-12 text-center">Estudiante no encontrado</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-8 px-4 pb-12">
        {/* Header Profile */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <Button
              variant="ghost"
              className="text-primary mb-4 h-auto p-0 hover:bg-transparent hover:underline"
              onClick={() => router.back()}
            >
              ← Volver al listado
            </Button>
            <h1 className="text-foreground font-serif text-4xl font-bold">{student.full_name}</h1>
            <p className="text-muted-foreground text-lg">{student.email}</p>
          </div>

          <div
            className={`rounded-xl border-2 px-6 py-4 ${getRiskColor(student.risk_summary?.current_risk_level)} shadow-sm`}
          >
            <div className="mb-1 text-xs font-bold tracking-widest uppercase opacity-80">
              Estado de Riesgo
            </div>
            <div className="flex items-center gap-2 text-3xl font-black">
              {translateRisk(student.risk_summary?.current_risk_level)}
              {student.risk_summary?.prediction_confidence && (
                <span className="text-sm font-medium opacity-70" title="Confianza del Modelo AI">
                  (IA: {(student.risk_summary.prediction_confidence * 100).toFixed(0)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border-destructive text-destructive rounded-lg border p-4 text-sm">
            {error}
          </div>
        )}

        {/* AI Risk Analysis - Visible for both */}
        <Card className="border-border relative overflow-hidden p-8 shadow-md">
          <div className="bg-primary/30 absolute top-0 left-0 h-full w-2" />
          <h3 className="mb-2 font-serif text-2xl font-bold">
            Análisis de Factores de Riesgo (IA)
          </h3>
          <p className="text-muted-foreground mb-8">
            Visualización de los factores que más influyen en el nivel de riesgo detectado por la
            inteligencia artificial.
          </p>
          <div className="h-[300px] w-full">
            <RiskFactorsChart factors={student.risk_factors || {}} />
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Management/Clinical Actions Section */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="border-border p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
                ⚙️ Acciones de Gestión
              </h3>
              <div className="flex flex-col gap-3">
                {user?.role === 'psychologist' && (
                  <>
                    <Button
                      className="bg-primary w-full font-bold hover:opacity-90"
                      onClick={() => (window.location.href = `mailto:${student.email}`)}
                    >
                      Contactar por Email
                    </Button>
                    <Button
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/5 w-full"
                      onClick={() =>
                        (window.location.href = `mailto:${student.email}?subject=Agendar Cita - Seguimiento Psicológico`)
                      }
                    >
                      Agendar Cita
                    </Button>
                    <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="w-full font-medium">
                          Añadir Nota Clínica
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nueva Nota Clínica</DialogTitle>
                          <DialogDescription>
                            Esta nota será visible solo para psicólogos y administradores.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <Textarea
                            placeholder="Escribe los detalles de la sesión o seguimiento..."
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            rows={5}
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleAddNote}
                            disabled={noteLoading || !newNoteContent.trim()}
                          >
                            {noteLoading ? 'Guardando...' : 'Guardar Nota'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}

                {user?.role === 'admin' && (
                  <>
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="shadow-destructive/20 w-full font-bold shadow-lg"
                        >
                          Eliminar Estudiante
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-destructive/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-destructive font-serif text-2xl">
                            ¿ELIMINAR PERMANENTEMENTE?
                          </AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            <div className="text-foreground/80 space-y-4 pt-2">
                              <p>
                                Estás a punto de eliminar a <strong>{student.full_name}</strong> de
                                forma irreversible.
                              </p>
                              <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-4 text-xs leading-relaxed">
                                <strong className="mb-1 block">ADVERTENCIA:</strong>
                                Esta acción borrará al usuario y TODA su información histórica
                                (alertas, evaluaciones psicométricas, registros de bienestar) de la
                                base de datos.
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={executeDelete}
                            className="bg-destructive hover:bg-destructive/90 font-bold text-white"
                          >
                            ELIMINAR TODO
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <p className="text-muted-foreground mt-2 px-2 text-center text-xs italic">
                      Como administrador, su rol está limitado a la gestión técnica de la cuenta.
                      Las acciones clínicas están reservadas para los especialistas.
                    </p>
                  </>
                )}
              </div>
            </Card>

            {/* Clinical Notes Card */}
            <Card className="border-border flex h-[500px] flex-col p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">📋 Notas Clínicas</h3>
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {notes.length === 0 ? (
                  <div className="text-muted-foreground bg-muted/20 rounded-lg py-8 text-center text-sm italic">
                    No hay notas registradas.
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-card space-y-2 rounded-lg border p-3 text-sm shadow-sm"
                    >
                      <div className="text-muted-foreground mb-2 flex items-center justify-between border-b pb-2 text-xs">
                        <span className="text-primary font-bold">
                          {note.psychologist_name || 'Especialista'}
                        </span>
                        <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Check-ins History (Visible for both) */}
          <div className="lg:col-span-2">
            <Card className="border-border h-full p-8 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 font-serif text-2xl font-bold">
                📊 Historial de Bienestar
              </h3>
              <div className="space-y-4">
                {!student.recent_checkins || student.recent_checkins.length === 0 ? (
                  <div className="bg-muted/20 rounded-xl border border-dashed py-12 text-center">
                    <p className="text-muted-foreground">
                      No hay registros de bienestar recientes.
                    </p>
                  </div>
                ) : (
                  student.recent_checkins.slice(0, 5).map((checkin) => (
                    <div
                      key={checkin.id}
                      className="bg-muted/10 border-border/50 transition-hover hover:bg-muted/20 rounded-xl border p-4"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-primary rounded px-2 py-1 text-[10px] font-black text-white uppercase">
                            Ánimo: {checkin.mood_score}
                          </span>
                          {checkin.energy_level && (
                            <span className="bg-accent rounded px-2 py-1 text-[10px] font-black text-white uppercase">
                              Energía: {checkin.energy_level}
                            </span>
                          )}
                          {checkin.sleep_hours !== undefined && (
                            <span className="bg-foreground text-background rounded px-2 py-1 text-[10px] font-black uppercase">
                              Sueño: {checkin.sleep_hours}h
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground text-xs font-medium">
                          {new Date(checkin.created_at).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      {checkin.note && (
                        <p className="text-foreground border-primary/30 border-l-2 py-1 pl-3 text-sm italic">
                          "{checkin.note}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Alerts and Assessments Section - Visible to both */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Alerts History */}
          <Card className="border-border h-full p-8 shadow-sm">
            <h3 className="mb-6 font-serif text-2xl font-bold">🔔 Historial de Alertas</h3>
            <div className="space-y-4">
              {!student.alerts || student.alerts.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  No hay alertas registradas.
                </p>
              ) : (
                student.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-muted/30 border-border/40 flex items-center justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${getRiskColor(alert.severity)}`}
                        >
                          {translateRisk(alert.severity)}
                        </span>
                        <span className="text-muted-foreground text-[10px] font-bold">
                          {new Date(alert.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-foreground truncate text-sm" title={alert.message}>
                        {alert.message}
                      </p>
                    </div>
                    <div
                      className={`h-3 w-3 rounded-full ${alert.is_resolved ? 'bg-green-500' : 'animate-pulse bg-amber-500'}`}
                    />
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Assessment History */}
          <Card className="border-border h-full p-8 shadow-sm">
            <h3 className="mb-6 font-serif text-2xl font-bold">📝 Evaluaciones Psicométricas</h3>
            <div className="border-border overflow-hidden rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="text-muted-foreground bg-muted/50 text-[10px] font-black uppercase">
                  <tr>
                    <th className="px-4 py-4">Fecha</th>
                    <th className="px-4 py-4">Puntaje</th>
                    <th className="px-4 py-4 text-right">Riesgo</th>
                  </tr>
                </thead>
                <tbody className="text-foreground divide-border divide-y">
                  {student.assessment_responses.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-muted-foreground px-4 py-8 text-center">
                        Sin evaluaciones.
                      </td>
                    </tr>
                  ) : (
                    student.assessment_responses.map((resp) => (
                      <tr key={resp.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-4 font-medium">
                          {new Date(resp.created_at).toLocaleDateString()}
                        </td>
                        <td className="text-primary px-4 py-4 font-mono font-bold">
                          {resp.total_score} pts
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span
                            className={`rounded px-2 py-1 text-[10px] font-black uppercase ${getRiskColor(resp.risk_level)}`}
                          >
                            {translateRisk(resp.risk_level)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
