'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export function AppointmentRequest() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      toast.error('Por favor selecciona fecha y hora');
      return;
    }

    setLoading(true);
    try {
      const appointmentDate = new Date(`${date}T${time}`);
      await apiClient.createAppointment({
        appointment_date: appointmentDate.toISOString(),
        reason,
      });
      toast.success('Solicitud de cita enviada correctamente');
      setReason('');
      setDate('');
      setTime('');
    } catch (err) {
      toast.error('Error al solicitar la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <h3 className="text-foreground mb-4 font-serif text-xl font-bold">
        Agendar Cita con Psicología
      </h3>
      <p className="text-muted-foreground mb-6 text-sm">
        Si sientes que necesitas conversar con un profesional, puedes solicitar una cita aquí.
        Revisaremos tu disponibilidad y te confirmaremos vía correo.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-background"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Hora</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Motivo (Opcional)</Label>
          <Textarea
            id="reason"
            placeholder="Breve descripción del motivo de tu cita..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-background min-h-[100px]"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full font-bold"
        >
          {loading ? 'Enviando Solicitud...' : 'Solicitar Cita Ahora'}
        </Button>
      </form>
    </Card>
  );
}
