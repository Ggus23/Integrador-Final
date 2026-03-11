
'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminAppointmentsPage() {
    const { user } = useProtected(['psychologist', 'admin']);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const data = await apiClient.getAllAppointments();
                setAppointments(data);
            } catch (err) {
                toast.error("Error al cargar las citas");
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await apiClient.updateAppointment(id, { status, psychologist_id: user?.id });
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, psychologist_id: user?.id } : a));
            toast.success(`Cita ${status === 'confirmed' ? 'confirmada' : 'actualizada'}`);
        } catch (err) {
            toast.error("Error al actualizar la cita");
        }
    };

    if (loading) return <Layout><div className="p-8">Cargando citas...</div></Layout>;

    return (
        <Layout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-foreground font-serif text-4xl font-bold">Gestión de Citas Médicas</h1>
                    <p className="text-muted-foreground mt-2">
                        Administra las solicitudes de apoyo emocional de los estudiantes.
                    </p>
                </div>

                <div className="grid gap-4">
                    {appointments.length === 0 ? (
                        <Card className="p-8 text-center text-muted-foreground">
                            No hay solicitudes de citas pendientes.
                        </Card>
                    ) : (
                        appointments.map((apt) => (
                            <Card key={apt.id} className="p-6 border-border bg-card flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                                            apt.status === 'pending' ? 'bg-risk-medium/20 text-risk-medium' :
                                            apt.status === 'confirmed' ? 'bg-risk-low/20 text-risk-low' : 'bg-muted text-muted-foreground'
                                        }`}>
                                            {apt.status}
                                        </span>
                                        <span className="font-bold">ID Estudiante: {apt.user_id}</span>
                                    </div>
                                    <p className="text-lg font-bold">
                                        {new Date(apt.appointment_date).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground italic">
                                        "{apt.reason || 'Sin motivo especificado'}"
                                    </p>
                                </div>
                                
                                <div className="flex gap-2">
                                    {apt.status === 'pending' && (
                                        <>
                                            <Button 
                                                onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                            >
                                                Confirmar
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                                            >
                                                Cancelar
                                            </Button>
                                        </>
                                    )}
                                    {apt.status === 'confirmed' && (
                                        <Button 
                                            onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                            className="bg-risk-low text-white"
                                        >
                                            Marcar como Completada
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </Layout>
    );
}
