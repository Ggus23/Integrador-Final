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
        <div className="flex items-center justify-center py-12 text-muted-foreground animate-pulse">Cargando registros...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 max-w-2xl mx-auto px-4">
        <div>
          <h1 className="text-foreground font-serif text-4xl font-bold tracking-tight">Registro de Bienestar</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Un pequeño paso diario para cuidar tu salud mental y ver tu progreso.
          </p>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded-lg border p-4 text-sm animate-shake">
            {error}
          </div>
        )}

        <Card className="border-border bg-card p-6 md:p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity" />
          <h2 className="text-foreground font-serif text-2xl font-bold flex items-center gap-2">
            ✨ ¿Cómo te sientes hoy?
          </h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Mood Score */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-foreground font-semibold text-base">Estado de Ánimo</label>
                <span className="text-primary font-bold text-lg bg-primary/10 px-3 py-1 rounded-full">
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
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="text-muted-foreground flex justify-between text-xs font-medium">
                <span>Muy Mal</span>
                <span>Muy Bien</span>
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-foreground font-semibold text-base">Nivel de Energía</label>
                <span className="text-primary font-bold text-lg bg-primary/10 px-3 py-1 rounded-full">
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
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="text-muted-foreground flex justify-between text-xs font-medium">
                <span>Agotado/a</span>
                <span>Con Energía</span>
              </div>
            </div>

            {/* Sleep Hours */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-foreground font-semibold text-base">Horas de Sueño</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={formData.sleep_hours}
                    onChange={(e) => setFormData({ ...formData, sleep_hours: Number(e.target.value) })}
                    className="w-16 bg-muted/50 border-none rounded px-2 py-1 text-center font-bold text-primary"
                  />
                  <span className="text-muted-foreground text-sm">horas</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label className="text-foreground font-semibold text-base">Notas Personales</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Escribe brevemente cómo te sientes o qué pasó hoy..."
                className="border-border bg-muted/30 text-foreground focus:ring-2 focus:ring-primary/50 w-full rounded-xl border px-4 py-3 shadow-inner outline-none transition-all min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Guardando registro...' : 'Guardar mi Check-in'}
            </Button>
          </form>
        </Card>

        {/* Check-ins History */}
        <div className="space-y-6 pt-8">
          <h2 className="text-foreground font-serif text-2xl font-bold border-l-4 border-primary pl-4">Mi Historial Reciente</h2>
          {checkins.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 py-12">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-muted-foreground font-medium">
                Aún no tienes registros. ¡Tu primer check-in será el comienzo de un gran seguimiento!
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {checkins.map((checkin, idx) => (
                <Card
                  key={checkin.id}
                  className={cn(
                    "border-border bg-card p-5 transition-all hover:translate-x-1 animate-slide-up",
                    idx === 0 && "ring-2 ring-primary/20"
                  )}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
                          <span className="text-xs text-primary font-bold uppercase">Ánimo</span>
                          <span className="text-xl font-black text-primary">{checkin.mood_score}</span>
                        </div>
                        {checkin.energy_level && (
                          <div className="flex flex-col items-center justify-center bg-accent/10 rounded-lg p-2 min-w-[60px]">
                            <span className="text-xs text-accent font-bold uppercase">Energía</span>
                            <span className="text-xl font-black text-accent">{checkin.energy_level}</span>
                          </div>
                        )}
                        {checkin.sleep_hours !== undefined && (
                          <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-2 min-w-[60px]">
                            <span className="text-xs text-muted-foreground font-bold uppercase">Sueño</span>
                            <span className="text-xl font-black text-foreground">{checkin.sleep_hours}h</span>
                          </div>
                        )}
                      </div>
                      <time className="text-muted-foreground text-xs font-medium bg-muted px-2 py-1 rounded">
                        {new Date(checkin.created_at).toLocaleDateString(undefined, {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </time>
                    </div>
                    {checkin.note && (
                      <div className="relative">
                        <p className="text-foreground bg-muted/20 mt-1 rounded-xl p-4 text-sm border italic border-border/50">
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
