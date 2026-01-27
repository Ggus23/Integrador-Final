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
} from "@/components/ui/dialog";
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
                    console.error("Error fetching notes", e);
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
            case 'high': case 'alto':
                return 'bg-risk-high/10 text-risk-high border-risk-high/20';
            case 'medium': case 'medio':
                return 'bg-risk-medium/10 text-risk-medium border-risk-medium/20';
            case 'low': case 'bajo':
                return 'bg-risk-low/10 text-risk-low border-risk-low/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const translateRisk = (level?: string) => {
        if (!level) return 'N/A';
        switch (level.toLowerCase()) {
            case 'high': return 'ALTO';
            case 'medium': return 'MEDIO';
            case 'low': return 'BAJO';
            case 'alto': return 'ALTO';
            case 'medio': return 'MEDIO';
            case 'bajo': return 'BAJO';
            default: return level.toUpperCase();
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
        return <Layout><div className="flex justify-center py-12 text-muted-foreground">Cargando perfil...</div></Layout>;
    }

    if (!student) {
        return <Layout><div className="text-center py-12 text-destructive">Estudiante no encontrado</div></Layout>;
    }

    return (
        <Layout>
            <div className="space-y-8 max-w-5xl mx-auto px-4 pb-12">
                {/* Header Profile */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <Button
                            variant="ghost"
                            className="mb-4 p-0 h-auto hover:bg-transparent hover:underline text-primary"
                            onClick={() => router.back()}
                        >
                            ← Volver al listado
                        </Button>
                        <h1 className="text-4xl font-serif font-bold text-foreground">{student.full_name}</h1>
                        <p className="text-muted-foreground text-lg">{student.email}</p>
                    </div>

                    <div className={`px-6 py-4 rounded-xl border-2 ${getRiskColor(student.risk_summary?.current_risk_level)} shadow-sm`}>
                        <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Estado de Riesgo</div>
                        <div className="text-3xl font-black flex items-center gap-2">
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
                    <div className="bg-destructive/10 border-destructive border text-destructive p-4 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* AI Risk Analysis - Visible for both */}
                <Card className="p-8 border-border shadow-md overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/30" />
                    <h3 className="font-serif text-2xl font-bold mb-2">Análisis de Factores de Riesgo (IA)</h3>
                    <p className="text-muted-foreground mb-8">
                        Visualización de los factores que más influyen en el nivel de riesgo detectado por la inteligencia artificial.
                    </p>
                    <div className="h-[300px] w-full">
                        <RiskFactorsChart factors={student.risk_factors || {}} />
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Management/Clinical Actions Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-6 border-border shadow-sm">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                ⚙️ Acciones de Gestión
                            </h3>
                            <div className="flex flex-col gap-3">
                                {user?.role === 'psychologist' && (
                                    <>
                                        <Button
                                            className="w-full bg-primary hover:opacity-90 font-bold"
                                            onClick={() => window.location.href = `mailto:${student.email}`}
                                        >
                                            Contactar por Email
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-primary text-primary hover:bg-primary/5"
                                            onClick={() => window.location.href = `mailto:${student.email}?subject=Agendar Cita - Seguimiento Psicológico`}
                                        >
                                            Agendar Cita
                                        </Button>
                                        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="secondary"
                                                    className="w-full font-medium"
                                                >
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
                                                    <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>Cancelar</Button>
                                                    <Button onClick={handleAddNote} disabled={noteLoading || !newNoteContent.trim()}>
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
                                                    className="w-full font-bold shadow-lg shadow-destructive/20"
                                                >
                                                    Eliminar Estudiante
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="border-destructive/20">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-destructive font-serif text-2xl">¿ELIMINAR PERMANENTEMENTE?</AlertDialogTitle>
                                                    <AlertDialogDescription asChild>
                                                        <div className="space-y-4 pt-2 text-foreground/80">
                                                            <p>Estás a punto de eliminar a <strong>{student.full_name}</strong> de forma irreversible.</p>
                                                            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20 text-destructive text-xs leading-relaxed">
                                                                <strong className="block mb-1">ADVERTENCIA:</strong>
                                                                Esta acción borrará al usuario y TODA su información histórica (alertas, evaluaciones psicométricas, registros de bienestar) de la base de datos.
                                                            </div>
                                                        </div>
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90 text-white font-bold">
                                                        ELIMINAR TODO
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <p className="text-xs text-muted-foreground text-center mt-2 italic px-2">
                                            Como administrador, su rol está limitado a la gestión técnica de la cuenta.
                                            Las acciones clínicas están reservadas para los especialistas.
                                        </p>
                                    </>
                                )}
                            </div>
                        </Card>

                        {/* Clinical Notes Card */}
                        <Card className="p-6 border-border shadow-sm flex flex-col h-[500px]">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                📋 Notas Clínicas
                            </h3>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {notes.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground text-sm italic bg-muted/20 rounded-lg">
                                        No hay notas registradas.
                                    </div>
                                ) : (
                                    notes.map((note) => (
                                        <div key={note.id} className="p-3 bg-card border rounded-lg text-sm space-y-2 shadow-sm">
                                            <div className="flex justify-between items-center text-xs text-muted-foreground border-b pb-2 mb-2">
                                                <span className="font-bold text-primary">{note.psychologist_name || 'Especialista'}</span>
                                                <span>{new Date(note.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
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
                        <Card className="p-8 border-border shadow-sm h-full">
                            <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                                📊 Historial de Bienestar
                            </h3>
                            <div className="space-y-4">
                                {(!student.recent_checkins || student.recent_checkins.length === 0) ? (
                                    <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                                        <p className="text-muted-foreground">No hay registros de bienestar recientes.</p>
                                    </div>
                                ) : (
                                    student.recent_checkins.slice(0, 5).map((checkin) => (
                                        <div key={checkin.id} className="p-4 bg-muted/10 rounded-xl border border-border/50 transition-hover hover:bg-muted/20">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="text-[10px] font-black px-2 py-1 bg-primary text-white rounded uppercase">
                                                        Ánimo: {checkin.mood_score}
                                                    </span>
                                                    {checkin.energy_level && (
                                                        <span className="text-[10px] font-black px-2 py-1 bg-accent text-white rounded uppercase">
                                                            Energía: {checkin.energy_level}
                                                        </span>
                                                    )}
                                                    {checkin.sleep_hours !== undefined && (
                                                        <span className="text-[10px] font-black px-2 py-1 bg-foreground text-background rounded uppercase">
                                                            Sueño: {checkin.sleep_hours}h
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {new Date(checkin.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                            {checkin.note && (
                                                <p className="text-sm text-foreground italic border-l-2 border-primary/30 pl-3 py-1">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* Alerts History */}
                    <Card className="p-8 border-border shadow-sm h-full">
                        <h3 className="font-serif text-2xl font-bold mb-6">🔔 Historial de Alertas</h3>
                        <div className="space-y-4">
                            {(!student.alerts || student.alerts.length === 0) ? (
                                <p className="text-muted-foreground text-center py-8">No hay alertas registradas.</p>
                            ) : (
                                student.alerts.map((alert) => (
                                    <div key={alert.id} className="p-4 bg-muted/30 rounded-lg border border-border/40 flex justify-between items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${getRiskColor(alert.severity)}`}>
                                                    {translateRisk(alert.severity)}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-bold">
                                                    {new Date(alert.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground truncate" title={alert.message}>{alert.message}</p>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${alert.is_resolved ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Assessment History */}
                    <Card className="p-8 border-border shadow-sm h-full">
                        <h3 className="font-serif text-2xl font-bold mb-6">📝 Evaluaciones Psicométricas</h3>
                        <div className="overflow-hidden rounded-xl border border-border">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-muted-foreground uppercase bg-muted/50 font-black">
                                    <tr>
                                        <th className="px-4 py-4">Fecha</th>
                                        <th className="px-4 py-4">Puntaje</th>
                                        <th className="px-4 py-4 text-right">Riesgo</th>
                                    </tr>
                                </thead>
                                <tbody className="text-foreground divide-y divide-border">
                                    {student.assessment_responses.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Sin evaluaciones.</td>
                                        </tr>
                                    ) : (
                                        student.assessment_responses.map((resp) => (
                                            <tr key={resp.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-4 py-4 font-medium">{new Date(resp.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-4 font-mono font-bold text-primary">{resp.total_score} pts</td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className={`text-[10px] px-2 py-1 rounded font-black uppercase ${getRiskColor(resp.risk_level)}`}>
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
