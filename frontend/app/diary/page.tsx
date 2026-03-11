'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DiaryEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

const EMOTIONS = [
  { label: 'Muy feliz', emoji: '😄', color: 'Verde', colorClass: 'bg-green-500', borderClass: 'border-green-500', level: 5 },
  { label: 'Feliz', emoji: '🙂', color: 'Verde claro', colorClass: 'bg-green-300', borderClass: 'border-green-300', level: 4 },
  { label: 'Neutral', emoji: '😐', color: 'Amarillo', colorClass: 'bg-yellow-400', borderClass: 'border-yellow-400', level: 3 },
  { label: 'Triste', emoji: '🙁', color: 'Naranja', colorClass: 'bg-orange-500', borderClass: 'border-orange-500', level: 2 },
  { label: 'Muy triste', emoji: '😢', color: 'Rojo', colorClass: 'bg-red-500', borderClass: 'border-red-500', level: 1 },
];

export default function DiaryPage() {
  const { user } = useProtected();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    experience: '',
    activities: '',
    emotion: 'Neutral',
    emotion_color: 'Amarillo',
    wellbeing_level: 3,
  });

  const [todayEntry, setTodayEntry] = useState<DiaryEntry | null>(null);
  const [wordCloud, setWordCloud] = useState<{ word: string; frequency: number }[]>([]);
  const [phraseCloud, setPhraseCloud] = useState<{ phrase: string; frequency: number }[]>([]);

  const fetchVisualizations = async () => {
    try {
      const [words, phrases] = await Promise.all([
        apiClient.getWordCloud(),
        apiClient.getPhraseCloud(),
      ]);
      setWordCloud(words || []);
      setPhraseCloud(phrases || []);
    } catch (e) {
      console.error('Error fetching clouds:', e);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const history = await apiClient.getMyDiaryHistory();
        setEntries(history);
        
        await fetchVisualizations();
        
        // Verificar si ya existe registro para hoy
        try {
          const today = await apiClient.getDiaryToday();
          if (today) {
            setTodayEntry(today);
            // Pre-cargar datos si ya existe
            setFormData({
              experience: today.experience || '',
              activities: today.activities || '',
              emotion: today.emotion,
              emotion_color: today.emotion_color,
              wellbeing_level: today.wellbeing_level,
            });
          }
        } catch (e) {
          // No hay registro para hoy, es normal
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el diario');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (todayEntry) {
        // Actualizar
        const updated = await apiClient.updateDiaryEntry(todayEntry.id, formData);
        setTodayEntry(updated);
        setEntries(entries.map(en => en.id === updated.id ? updated : en));
        setSuccess('Registro actualizado exitosamente.');
      } else {
        // Crear
        const newEntry = await apiClient.createDiaryEntry(formData);
        setTodayEntry(newEntry);
        setEntries([newEntry, ...entries]);
        setSuccess('Registro creado exitosamente.');
      }
      // Refresh clouds
      fetchVisualizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEmotion = EMOTIONS.find(e => e.label === formData.emotion) || EMOTIONS[2];

  if (loading) {
    return (
      <Layout>
        <div className="text-muted-foreground flex animate-pulse items-center justify-center py-12">
          Cargando tu diario...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-8 px-4 pb-20">
        <header className="space-y-2">
          <h1 className="text-foreground font-serif text-4xl font-bold tracking-tight">
            Mi Diario Emocional 📔
          </h1>
          <p className="text-muted-foreground text-lg italic">
            "Tu mente es un jardín, tus pensamientos son las semillas. Puedes cultivar flores o puedes cultivar maleza."
          </p>
        </header>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive animate-shake rounded-lg border p-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="border-green-500 bg-green-500/10 text-green-600 rounded-lg border p-4 text-sm font-medium">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Formulario de registro */}
          <Card className="border-border bg-card lg:col-span-3 overflow-hidden p-6 shadow-xl md:p-8">
            <h2 className="text-foreground flex items-center gap-2 font-serif text-2xl font-bold">
              {todayEntry ? '📝 Editar registro de hoy' : '✨ Nuevo registro de hoy'}
            </h2>
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              {/* Selector de Emociones */}
              <div className="space-y-4">
                <label className="text-foreground text-base font-semibold block">¿Cómo te sientes hoy?</label>
                <div className="flex flex-wrap gap-4 justify-between">
                  {EMOTIONS.map((emo) => (
                    <button
                      key={emo.level}
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        emotion: emo.label, 
                        emotion_color: emo.color,
                        wellbeing_level: emo.level 
                      })}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2 w-[18%]",
                        formData.emotion === emo.label 
                          ? `${emo.colorClass} text-white ${emo.borderClass} scale-110 shadow-lg` 
                          : "bg-muted/30 border-transparent hover:bg-muted/50 grayscale-[0.5] opacity-70"
                      )}
                    >
                      <span className="text-3xl">{emo.emoji}</span>
                      <span className="text-[10px] font-bold uppercase leading-tight text-center">{emo.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Experiencias */}
              <div className="space-y-4">
                <label className="text-foreground text-base font-semibold">Experiencias o reflexiones del día</label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="¿Qué pasó hoy? ¿Algo que te gustaría recordar o soltar?"
                  className="border-border bg-muted/30 text-foreground focus:ring-primary/50 min-h-[120px] w-full rounded-2xl border px-4 py-3 shadow-inner transition-all outline-none focus:ring-2"
                />
              </div>

              {/* Actividades */}
              <div className="space-y-4">
                <label className="text-foreground text-base font-semibold">Actividades realizadas</label>
                <input
                  type="text"
                  value={formData.activities}
                  onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                  placeholder="Ej: Caminar, leer, estudiar, pasar tiempo con amigos..."
                  className="border-border bg-muted/30 text-foreground focus:ring-primary/50 w-full rounded-2xl border px-4 py-3 shadow-inner transition-all outline-none focus:ring-2"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className={cn(
                  "text-white hover:shadow-lg h-14 w-full rounded-2xl text-lg font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50",
                  selectedEmotion.colorClass
                )}
              >
                {submitting ? 'Guardando...' : todayEntry ? 'Actualizar mi Diario' : 'Guardar en mi Diario'}
              </Button>
            </form>
          </Card>

          {/* Resumen Lateral / Widgets */}
          <div className="lg:col-span-2 space-y-6">
            <Card className={cn(
               "p-6 h-fit border-2 text-white overflow-hidden relative shadow-lg transition-colors duration-500",
               selectedEmotion.colorClass,
               selectedEmotion.borderClass
            )}>
              <div className="absolute -right-4 -top-4 text-8xl opacity-10 rotate-12">
                {selectedEmotion.emoji}
              </div>
              <h3 className="text-xl font-bold mb-1">Color Emocional</h3>
              <p className="text-white/80 text-sm mb-4">Reflejo de tu bienestar actual</p>
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 text-center">
                <span className="text-4xl block mb-2">{selectedEmotion.emoji}</span>
                <span className="text-2xl font-black">{selectedEmotion.color.toUpperCase()}</span>
                <p className="mt-2 text-sm font-medium opacity-90">{selectedEmotion.label}</p>
              </div>
            </Card>

            <Card className="p-6 border-border bg-muted/10">
              <h3 className="text-foreground font-serif text-xl font-bold mb-4">💡 Tip del Día</h3>
              <p className="text-muted-foreground text-sm italic">
                Escribir tus emociones ayuda a tu cerebro a procesarlas con mayor calma. Notar patrones es el primer paso para el bienestar.
              </p>
            </Card>
          </div>
        </div>

        {/* Visualizaciones AI */}
        {(wordCloud.length > 0 || phraseCloud.length > 0) && (
          <div className="space-y-6 pt-8">
            <h2 className="text-foreground font-serif text-2xl font-bold border-b border-border pb-4">
              ✨ El Panorama de tu Mente (AI)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nube de Palabras */}
              <Card className="p-6 border-border bg-card shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10 text-4xl">🏷️</div>
                <h3 className="text-primary text-sm font-bold uppercase tracking-wider mb-6">Términos Frecuentes</h3>
                <div className="flex flex-wrap items-center justify-center gap-2 min-h-[150px]">
                  {wordCloud.map((item, i) => {
                    // Stable color based on word hash
                    const hash = item.word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const hue = hash % 360;
                    return (
                      <span 
                        key={i} 
                        className="inline-block transition-all hover:scale-110 cursor-default"
                        style={{ 
                          fontSize: `${Math.max(0.8, Math.min(2.5, 0.8 + item.frequency * 0.2))}rem`,
                          opacity: Math.max(0.4, Math.min(1, 0.4 + item.frequency * 0.1)),
                          color: `hsl(${hue}, 60%, 50%)`,
                          fontWeight: item.frequency > 2 ? 'bold' : 'normal'
                        }}
                      >
                        {item.word}
                      </span>
                    );
                  })}
                </div>
              </Card>

              {/* Nube de Frases */}
              <Card className="p-6 border-border bg-card shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10 text-4xl">💬</div>
                <h3 className="text-primary text-sm font-bold uppercase tracking-wider mb-6">Expresiones Recurrentes</h3>
                <div className="space-y-3">
                  {phraseCloud.slice(0, 8).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/40 rounded-full" 
                          style={{ width: `${Math.min(100, item.frequency * 20)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground min-w-[120px]">{item.phrase}</span>
                      <span className="text-xs text-muted-foreground font-bold">{item.frequency}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Historial */}
        <div className="space-y-6 pt-12">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-foreground font-serif text-2xl font-bold">
              Historial de Reflexiones
            </h2>
            <div className="text-muted-foreground text-sm font-medium">
              {entries.length} registros guardados
            </div>
          </div>

          {entries.length === 0 ? (
            <Card className="border-2 border-dashed p-12 text-center bg-muted/5">
              <div className="mb-4 text-5xl opacity-40">📖</div>
              <p className="text-muted-foreground font-medium text-lg">
                Tu diario está en blanco. ¿Por qué no empiezas escribiendo sobre tu día?
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {entries.map((entry, idx) => {
                const entryEmo = EMOTIONS.find(e => e.label === entry.emotion) || EMOTIONS[2];
                return (
                  <Card
                    key={entry.id}
                    className="group border-border bg-card animate-slide-up overflow-hidden hover:shadow-md transition-all"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex h-full">
                      {/* Línea de color lateral */}
                      <div className={cn("w-3 shrink-0", entryEmo.colorClass)} />
                      
                      <div className="p-5 w-full space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <time className="text-muted-foreground block text-sm font-bold uppercase tracking-wider">
                              {new Date(entry.date).toLocaleDateString(undefined, {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                timeZone: 'UTC' // Importante para evitar desfase de fecha por zona horaria
                              })}
                            </time>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-2xl">{entryEmo.emoji}</span>
                              <span className={cn("text-xs font-black px-2 py-0.5 rounded-full text-white", entryEmo.colorClass)}>
                                {entry.emotion.toUpperCase()}
                              </span>
                              {entry.emotion_ai && (
                                <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/30 flex items-center gap-1">
                                  <span>🤖 AI:</span>
                                  <span>{entry.emotion_ai.toUpperCase()}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                             <span className="text-muted-foreground/30 text-3xl font-black italic">#{entries.length - idx}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {entry.experience && (
                            <div className="space-y-2">
                              <h4 className="text-primary text-xs font-bold uppercase tracking-tighter">Experiencia</h4>
                              <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                {entry.experience}
                              </p>
                            </div>
                          )}
                          {entry.activities && (
                            <div className="space-y-2">
                              <h4 className="text-primary text-xs font-bold uppercase tracking-tighter">Actividades</h4>
                              <div className="flex flex-wrap gap-2">
                                {entry.activities.split(',').map((act, i) => (
                                  <span key={i} className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-1 rounded-md border border-border/50">
                                    {act.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
