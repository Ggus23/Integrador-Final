'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Checkin } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function CheckinsPage() {
  const { user } = useProtected();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mood_score: 3,
    energy_level: 3,
    sleep_hours: 8,
    note: '',
  });

  useEffect(() => {
    if (!user) return;

    const fetchCheckins = async () => {
      try {
        const data = await apiClient.getMyCheckins();
        setCheckins(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los registros');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckins();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newCheckin = await apiClient.createCheckin(formData);
      setCheckins([newCheckin, ...checkins]);
      setFormData({
        mood_score: 3,
        energy_level: 3,
        sleep_hours: 8,
        note: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-muted-foreground flex animate-pulse items-center justify-center py-12">
          Cargando registros...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-8 px-4">
        <div>
          <h1 className="text-foreground font-serif text-4xl font-bold tracking-tight">
            Registro de Bienestar
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Un pequeño paso diario para cuidar tu salud mental y ver tu progreso.
          </p>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive animate-shake rounded-lg border p-4 text-sm">
            {error}
          </div>
        )}

        <Card className="border-border bg-card group relative overflow-hidden p-6 shadow-xl md:p-8">
          <div className="bg-primary absolute top-0 left-0 h-full w-2 opacity-20 transition-opacity group-hover:opacity-100" />
          <h2 className="text-foreground flex items-center gap-2 font-serif text-2xl font-bold">
            ✨ ¿Cómo te sientes hoy?
          </h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Mood Score */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-foreground text-base font-semibold">Estado de Ánimo</label>
                <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-lg font-bold">
                  {formData.mood_score}/5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.mood_score}
                onChange={(e) =>
                  setFormData({ ...formData, mood_score: Number.parseInt(e.target.value) })
                }
                className="bg-muted accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg"
              />
              <div className="text-muted-foreground flex justify-between text-xs font-medium">
                <span>Muy Mal</span>
                <span>Muy Bien</span>
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-foreground text-base font-semibold">Nivel de Energía</label>
                <span className="text-primary bg-primary/10 rounded-full px-3 py-1 text-lg font-bold">
                  {formData.energy_level}/5
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.energy_level}
                onChange={(e) =>
                  setFormData({ ...formData, energy_level: Number.parseInt(e.target.value) })
                }
                className="bg-muted accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg"
              />
              <div className="text-muted-foreground flex justify-between text-xs font-medium">
                <span>Agotado/a</span>
                <span>Con Energía</span>
              </div>
            </div>

            {/* Sleep Hours */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-foreground text-base font-semibold">Horas de Sueño</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={formData.sleep_hours}
                    onChange={(e) =>
                      setFormData({ ...formData, sleep_hours: Number(e.target.value) })
                    }
                    className="bg-muted/50 text-primary w-16 rounded border-none px-2 py-1 text-center font-bold"
                  />
                  <span className="text-muted-foreground text-sm">horas</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label className="text-foreground text-base font-semibold">Notas Personales</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Escribe brevemente cómo te sientes o qué pasó hoy..."
                className="border-border bg-muted/30 text-foreground focus:ring-primary/50 min-h-[100px] w-full rounded-xl border px-4 py-3 shadow-inner transition-all outline-none focus:ring-2"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="bg-primary text-primary-foreground hover:shadow-primary/20 h-12 w-full rounded-xl text-lg font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Guardando registro...' : 'Guardar mi Check-in'}
            </Button>
          </form>
        </Card>

        {/* Check-ins History */}
        <div className="space-y-6 pt-8">
          <h2 className="text-foreground border-primary border-l-4 pl-4 font-serif text-2xl font-bold">
            Mi Historial Reciente
          </h2>
          {checkins.length === 0 ? (
            <Card className="border-2 border-dashed p-8 py-12 text-center">
              <div className="mb-4 text-4xl">📝</div>
              <p className="text-muted-foreground font-medium">
                Aún no tienes registros. ¡Tu primer check-in será el comienzo de un gran
                seguimiento!
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {checkins.map((checkin, idx) => (
                <Card
                  key={checkin.id}
                  className={cn(
                    'border-border bg-card animate-slide-up p-5 transition-all hover:translate-x-1',
                    idx === 0 && 'ring-primary/20 ring-2'
                  )}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 flex min-w-[60px] flex-col items-center justify-center rounded-lg p-2">
                          <span className="text-primary text-xs font-bold uppercase">Ánimo</span>
                          <span className="text-primary text-xl font-black">
                            {checkin.mood_score}
                          </span>
                        </div>
                        {checkin.energy_level && (
                          <div className="bg-accent/10 flex min-w-[60px] flex-col items-center justify-center rounded-lg p-2">
                            <span className="text-accent text-xs font-bold uppercase">Energía</span>
                            <span className="text-accent text-xl font-black">
                              {checkin.energy_level}
                            </span>
                          </div>
                        )}
                        {checkin.sleep_hours !== undefined && (
                          <div className="bg-muted flex min-w-[60px] flex-col items-center justify-center rounded-lg p-2">
                            <span className="text-muted-foreground text-xs font-bold uppercase">
                              Sueño
                            </span>
                            <span className="text-foreground text-xl font-black">
                              {checkin.sleep_hours}h
                            </span>
                          </div>
                        )}
                      </div>
                      <time className="text-muted-foreground bg-muted rounded px-2 py-1 text-xs font-medium">
                        {new Date(checkin.created_at).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                    {checkin.note && (
                      <div className="relative">
                        <p className="text-foreground bg-muted/20 border-border/50 mt-1 rounded-xl border p-4 text-sm italic">
                          {checkin.note}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
