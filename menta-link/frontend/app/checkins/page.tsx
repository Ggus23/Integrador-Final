'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    academic_pressure: 3,
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
        academic_pressure: 3,
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

        <Card className="border-border bg-card/75 group relative overflow-hidden p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="bg-primary absolute top-0 left-0 h-full w-2 opacity-20 transition-opacity group-hover:opacity-100" />
          <h2 className="text-foreground flex items-center gap-2 font-serif text-2xl font-bold">
            ✨ ¿Cómo va tu día, {user?.full_name?.split(' ')[0]}?
          </h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-12">
            {/* Estado de Ánimo con Emojis */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-foreground text-xs font-black tracking-[0.2em] uppercase opacity-70">
                  Tu Estado de Ánimo
                </label>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border-2 px-4 py-2 text-sm font-black shadow-sm backdrop-blur-md transition-all',
                    formData.mood_score <= 2
                      ? 'bg-risk-high/20 text-risk-high border-risk-high/30'
                      : formData.mood_score === 3
                        ? 'border-amber-500/30 bg-amber-500/20 text-amber-600'
                        : 'bg-support-low/20 text-support-low border-support-low/30'
                  )}
                >
                  <span className="text-xl">
                    {formData.mood_score === 1 && '😞'}
                    {formData.mood_score === 2 && '🙁'}
                    {formData.mood_score === 3 && '😐'}
                    {formData.mood_score === 4 && '🙂'}
                    {formData.mood_score === 5 && '✨'}
                  </span>
                  <span className="tracking-tighter">{formData.mood_score} / 5</span>
                </div>
              </div>

              <div className="relative flex items-center justify-between gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <motion.button
                    key={val}
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    onClick={() => setFormData({ ...formData, mood_score: val })}
                    className={cn(
                      'group relative flex h-14 w-14 flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300',
                      formData.mood_score === val
                        ? 'bg-primary border-primary z-10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]'
                        : 'bg-muted/40 border-border/40 hover:border-primary/40 hover:bg-muted/60'
                    )}
                  >
                    <motion.span
                      animate={
                        formData.mood_score === val
                          ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] }
                          : {}
                      }
                      className={cn(
                        'text-2xl transition-all duration-300',
                        formData.mood_score === val
                          ? 'brightness-110'
                          : 'opacity-70 grayscale-[0.4] group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0'
                      )}
                    >
                      {val === 1 && '😞'}
                      {val === 2 && '🙁'}
                      {val === 3 && '😐'}
                      {val === 4 && '🙂'}
                      {val === 5 && '✨'}
                    </motion.span>

                    {/* Dynamic Label underneath */}
                    <span
                      className={cn(
                        'absolute -bottom-7 text-[10px] font-black tracking-widest whitespace-nowrap uppercase transition-all duration-300',
                        formData.mood_score === val
                          ? 'text-primary translate-y-0 opacity-100'
                          : 'text-muted-foreground -translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
                      )}
                    >
                      {val === 1 && 'Decaído'}
                      {val === 2 && 'Algo Mal'}
                      {val === 3 && 'Regular'}
                      {val === 4 && 'Bien'}
                      {val === 5 && '¡Excelente!'}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Nivel de Energía */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-foreground text-xs font-black tracking-[0.2em] uppercase opacity-70">
                  Nivel de Energía
                </label>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border-2 px-4 py-2 text-sm font-black shadow-sm backdrop-blur-md transition-all',
                    formData.energy_level <= 2
                      ? 'border-amber-600/30 bg-amber-600/20 text-amber-600'
                      : formData.energy_level === 3
                        ? 'border-blue-500/30 bg-blue-500/20 text-blue-600'
                        : 'bg-accent/20 text-accent border-accent/30'
                  )}
                >
                  <span className="text-xl">
                    {formData.energy_level <= 2 ? '🪫' : formData.energy_level === 3 ? '⚡' : '🔋'}
                  </span>
                  <span className="tracking-tighter">{formData.energy_level} / 5</span>
                </div>
              </div>

              <div className="relative flex items-center justify-between gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <motion.button
                    key={val}
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    onClick={() => setFormData({ ...formData, energy_level: val })}
                    className={cn(
                      'group relative flex h-14 w-14 flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300',
                      formData.energy_level === val
                        ? 'bg-accent border-accent z-10 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]'
                        : 'bg-muted/40 border-border/40 hover:border-accent/40 hover:bg-muted/60'
                    )}
                  >
                    <motion.span
                      animate={
                        formData.energy_level === val
                          ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] }
                          : {}
                      }
                      className={cn(
                        'text-2xl transition-all duration-300',
                        formData.energy_level === val
                          ? 'brightness-110'
                          : 'opacity-70 grayscale-[0.4] group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0'
                      )}
                    >
                      {val === 1 && '🪫'}
                      {val === 2 && '🔌'}
                      {val === 3 && '⚡'}
                      {val === 4 && '🔋'}
                      {val === 5 && '🌟'}
                    </motion.span>

                    <span
                      className={cn(
                        'absolute -bottom-7 text-[10px] font-black tracking-widest whitespace-nowrap uppercase transition-all duration-300',
                        formData.energy_level === val
                          ? 'text-accent translate-y-0 opacity-100'
                          : 'text-muted-foreground -translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
                      )}
                    >
                      {val === 1 && 'Baja'}
                      {val === 2 && 'Poca'}
                      {val === 3 && 'Media'}
                      {val === 4 && 'Buena'}
                      {val === 5 && 'Máxima'}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Presión Académica */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-foreground text-xs font-black tracking-[0.2em] uppercase opacity-70">
                  Presión Académica
                </label>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border-2 px-4 py-2 text-sm font-black shadow-sm backdrop-blur-md transition-all',
                    formData.academic_pressure >= 4
                      ? 'bg-risk-high/20 text-risk-high border-risk-high/30'
                      : formData.academic_pressure === 3
                        ? 'border-amber-500/30 bg-amber-500/20 text-amber-600'
                        : 'bg-support-low/20 text-support-low border-support-low/30'
                  )}
                >
                  <span className="text-xl">
                    {formData.academic_pressure >= 4
                      ? '🌋'
                      : formData.academic_pressure === 3
                        ? '⚖️'
                        : '🍃'}
                  </span>
                  <span className="tracking-tighter">{formData.academic_pressure} / 5</span>
                </div>
              </div>

              <div className="relative flex items-center justify-between gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <motion.button
                    key={val}
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    onClick={() => setFormData({ ...formData, academic_pressure: val })}
                    className={cn(
                      'group relative flex h-14 w-14 flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300',
                      formData.academic_pressure === val
                        ? 'bg-risk-high border-risk-high z-10 shadow-[0_0_20px_rgba(var(--risk-high-rgb),0.3)]'
                        : 'bg-muted/40 border-border/40 hover:border-risk-high/40 hover:bg-muted/60'
                    )}
                  >
                    <motion.span
                      animate={
                        formData.academic_pressure === val
                          ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] }
                          : {}
                      }
                      className={cn(
                        'text-2xl transition-all duration-300',
                        formData.academic_pressure === val
                          ? 'brightness-110'
                          : 'opacity-70 grayscale-[0.4] group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0'
                      )}
                    >
                      {val === 1 && '🍃'}
                      {val === 2 && '⚓'}
                      {val === 3 && '⚖️'}
                      {val === 4 && '🕰️'}
                      {val === 5 && '🌋'}
                    </motion.span>

                    <span
                      className={cn(
                        'absolute -bottom-7 text-[10px] font-black tracking-widest whitespace-nowrap uppercase transition-all duration-300',
                        formData.academic_pressure === val
                          ? 'text-risk-high translate-y-0 opacity-100'
                          : 'text-muted-foreground -translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
                      )}
                    >
                      {val === 1 && 'Nula'}
                      {val === 2 && 'Leve'}
                      {val === 3 && 'Media'}
                      {val === 4 && 'Alta'}
                      {val === 5 && 'Crítica'}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 pt-4 sm:grid-cols-2">
              <div className="space-y-4">
                <label className="text-foreground block text-center text-xs font-black tracking-[0.2em] uppercase opacity-70">
                  Horas de Sueño
                </label>
                <div className="bg-muted/20 hover:bg-muted/40 border-border/40 focus-within:border-primary/50 group flex items-center justify-center rounded-3xl border-2 p-5 transition-all">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={formData.sleep_hours}
                    onChange={(e) =>
                      setFormData({ ...formData, sleep_hours: Number(e.target.value) })
                    }
                    className="text-primary w-20 bg-transparent text-center text-4xl font-black transition-transform outline-none group-focus-within:scale-110"
                  />
                  <span className="text-muted-foreground ml-2 text-xs font-black tracking-widest uppercase">
                    horas
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-foreground block text-center text-xs font-black tracking-[0.2em] uppercase opacity-70">
                  Notas Rápidas
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="¿Algo más que quieras anotar hoy?"
                  className="border-border/40 bg-muted/20 text-foreground focus:ring-primary/20 placeholder:text-muted-foreground/50 focus:border-primary/40 min-h-[92px] w-full rounded-3xl border-2 px-5 py-4 text-sm shadow-inner transition-all outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="bg-primary text-primary-foreground h-16 w-full rounded-3xl text-sm font-black tracking-[0.3em] uppercase shadow-lg transition-all hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Guardando registro...' : 'Guardar mi Check-in'}
            </Button>
          </form>
        </Card>

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
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                      <div className="flex flex-wrap items-center gap-2 md:gap-4">
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
                        {checkin.academic_pressure && (
                          <div className="bg-risk-high/10 flex min-w-[60px] flex-col items-center justify-center rounded-lg p-2">
                            <span className="text-risk-high text-xs font-bold uppercase">
                              Presión
                            </span>
                            <span className="text-risk-high text-xl font-black">
                              {checkin.academic_pressure}
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
