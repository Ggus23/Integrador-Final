'use client';

import { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { DiaryEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Brain, MessageSquare, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { analyzeMoodRealtime } from '@/lib/mood-analyzer';

const EMOTIONS = [
  {
    label: 'Muy feliz',
    emoji: '😄',
    color: 'Verde',
    colorClass: 'bg-green-500',
    borderClass: 'border-green-500',
    level: 5,
  },
  {
    label: 'Feliz',
    emoji: '🙂',
    color: 'Verde claro',
    colorClass: 'bg-green-300',
    borderClass: 'border-green-300',
    level: 4,
  },
  {
    label: 'Neutral',
    emoji: '😐',
    color: 'Amarillo',
    colorClass: 'bg-yellow-400',
    borderClass: 'border-yellow-400',
    level: 3,
  },
  {
    label: 'Triste',
    emoji: '🙁',
    color: 'Naranja',
    colorClass: 'bg-orange-500',
    borderClass: 'border-orange-500',
    level: 2,
  },
  {
    label: 'Muy triste',
    emoji: '😢',
    color: 'Rojo',
    colorClass: 'bg-red-500',
    borderClass: 'border-red-500',
    level: 1,
  },
];

const getSentimentColor = (sentiment: string) => {
  const s = sentiment?.toLowerCase() || '';
  if (s.includes('muy feliz') || s.includes('feliz')) return '#22C55E'; // Verde (Pos)
  if (s.includes('neutral') || s.includes('indiferente')) return '#FACC15'; // Amarillo (Neu)
  if (s.includes('ansioso') || s.includes('estresado') || s.includes('preocupado'))
    return '#F97316'; // Naranja (Ans)
  if (s.includes('triste') || s.includes('tristeza')) return '#EF4444'; // Rojo (Tris)
  return 'currentColor';
};

const PREDEFINED_ACTIVITIES = [
  { id: 'estudio', label: 'Estudio', emoji: '📚' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'gym', label: 'Gym', emoji: '💪' },
  { id: 'fiesta', label: 'Fiesta', emoji: '🎉' },
  { id: 'streaming', label: 'Streaming', emoji: '📺' },
  { id: 'trabajo', label: 'Trabajo', emoji: '💼' },
  { id: 'musica', label: 'Música', emoji: '🎧' },
  { id: 'comida', label: 'Comida', emoji: '🍴' },
];

export default function DiaryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emotionFilter, setEmotionFilter] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    experience: '',
    learning: '',
    activities: [] as string[],
    emotion: 'Neutral',
    emotion_color: 'Amarillo',
    wellbeing_level: 3,
  });

  const [realtimeAnalysis, setRealtimeAnalysis] = useState({
    scores: { depresion: 0, ansiedad: 0, estres: 0 },
    symptoms: [] as string[],
    keyConcepts: [] as string[],
    meaningfulPhrases: {} as Record<string, number>,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const analysis = analyzeMoodRealtime(formData.experience);
      setRealtimeAnalysis(analysis);
    }, 300);
    return () => clearTimeout(timer);
  }, [formData.experience]);

  const [todayEntry, setTodayEntry] = useState<DiaryEntry | null>(null);
  const [wordCloud, setWordCloud] = useState<
    { word: string; frequency: number; sentiment?: string }[]
  >([]);
  const [analysisData, setAnalysisData] = useState<{
    key_concepts: string[];
    relevant_phrases: { phrase: string; count: number }[];
    recurrent_patterns: { phrase: string; frequency: number; sentiment: string }[];
  }>({
    key_concepts: [],
    relevant_phrases: [],
    recurrent_patterns: [],
  });
  const [phraseCloud, setPhraseCloud] = useState<
    { phrase: string; frequency: number; sentiment?: string }[]
  >([]);

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (emotionFilter) {
      result = entries.filter((e) => e.emotion.toLowerCase() === emotionFilter.toLowerCase());
    }
    return result;
  }, [entries, emotionFilter]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, DiaryEntry[]> = {};
    filteredEntries.forEach((entry) => {
      const dateObj = new Date(entry.created_at || entry.date);
      const dateKey = dateObj.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  const streak = useMemo(() => {
    return filteredEntries.length;
  }, [filteredEntries]);

  const fetchVisualizations = async () => {
    try {
      const [words, phrases, analysis] = await Promise.all([
        apiClient.getWordCloud(),
        apiClient.getPhraseCloud(),
        apiClient.getAnalysis(),
      ]);
      setWordCloud(words || []);
      setPhraseCloud(phrases || []);
      setAnalysisData(analysis || { key_concepts: [], relevant_phrases: [] });
    } catch (e) {
      console.error('Error fetching clouds:', e);
    }
  };

  const toggleActivity = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.includes(label)
        ? prev.activities.filter((a) => a !== label)
        : [...prev.activities, label],
    }));
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const history = await apiClient.getMyDiaryHistory();
        setEntries(Array.isArray(history) ? history : []);
        await fetchVisualizations();
        setTodayEntry(null);
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
      const dataToSave = {
        emotion: formData.emotion,
        emotion_color: formData.emotion_color,
        wellbeing_level: formData.wellbeing_level,
        activities: formData.activities.join(', '),
        experience: `PASÓ HOY:\n${formData.experience}\n\nAPRENDIZAJES:\n${formData.learning}`,
      };

      const newEntry = await apiClient.createDiaryEntry(dataToSave as any);
      setEntries((prev) => [newEntry, ...prev]);
      setSuccess('¡Nueva reflexión guardada con éxito!');

      setFormData({
        experience: '',
        learning: '',
        activities: [],
        emotion: 'Neutral',
        emotion_color: 'Amarillo',
        wellbeing_level: 3,
      });

      fetchVisualizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEmotion = EMOTIONS.find((e) => e.label === formData.emotion) || EMOTIONS[2];

  if (loading) {
    return (
      <Layout>
        <div className="flex animate-pulse items-center justify-center py-12">
          Cargando tu diario...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-8 px-4 pb-20">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-inner">
              📔
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Mi Diario Emocional</h1>
              <p className="text-muted-foreground font-medium italic opacity-70">
                Tu refugio para la reflexión diaria
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Card className="bg-card/60 overflow-hidden border-0 shadow-2xl backdrop-blur-xl">
              <div
                className={cn('h-2 w-full transition-all duration-700', selectedEmotion.colorClass)}
              />

              <form onSubmit={handleSubmit} className="p-10">
                <div className="mb-10 space-y-4">
                  <label className="text-primary text-xs font-black tracking-[0.2em] uppercase">
                    ¿Cómo te sientes ahora?
                  </label>
                  <div className="flex justify-between gap-2 overflow-x-auto pb-4">
                    {EMOTIONS.map((emo) => (
                      <button
                        key={emo.label}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            emotion: emo.label,
                            emotion_color: emo.color,
                            wellbeing_level: emo.level,
                          })
                        }
                        className={cn(
                          'flex min-w-[70px] flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-105 active:scale-95',
                          formData.emotion === emo.label
                            ? `${emo.borderClass} bg-card ring-primary/5 shadow-lg ring-4`
                            : 'bg-muted/20 border-transparent opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                        )}
                      >
                        <span className="text-3xl">{emo.emoji}</span>
                        <span className="text-[10px] font-black tracking-tight uppercase">
                          {emo.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-10 space-y-6">
                  <div className="space-y-3">
                    <label className="text-primary flex items-center gap-2 text-xs font-black tracking-[0.2em] uppercase">
                      <MessageSquare size={14} />
                      ¿Qué pasó hoy?
                    </label>
                    <textarea
                      required
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/5 min-h-[140px] w-full rounded-2xl border-2 p-5 font-serif text-lg leading-relaxed placeholder:italic focus:ring-4 focus:outline-none"
                      placeholder="Cuéntame sobre tu día..."
                    />

                    {/* Real-time Feedback */}
                    <AnimatePresence>
                      {formData.experience.length > 10 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="bg-primary/5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl px-4 py-3"
                        >
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              <span className="text-[9px] font-black uppercase opacity-60">
                                Depresión: {(realtimeAnalysis.scores.depresion * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                              <span className="text-[9px] font-black uppercase opacity-60">
                                Ansiedad: {(realtimeAnalysis.scores.ansiedad * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                              <span className="text-[9px] font-black uppercase opacity-60">
                                Estrés: {(realtimeAnalysis.scores.estres * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div className="text-primary text-[8px] font-black tracking-widest uppercase">
                            Procesamiento IA en vivo
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Real-time Insights Preview */}
                    <AnimatePresence>
                      {formData.experience.length > 20 &&
                        realtimeAnalysis.keyConcepts.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4"
                          >
                            <div className="flex flex-wrap gap-2">
                              {realtimeAnalysis.keyConcepts.map((concept, i) => (
                                <span
                                  key={i}
                                  className="bg-primary/10 text-primary rounded-lg px-2 py-1 text-[10px] font-bold italic"
                                >
                                  #{concept}
                                </span>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                              {Object.keys(realtimeAnalysis.meaningfulPhrases).map((phrase, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <Sparkles size={8} className="text-support-medium" />
                                  <span className="text-muted-foreground text-[9px] font-black tracking-tighter uppercase">
                                    {phrase}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-3">
                    <label className="text-primary flex items-center gap-2 text-xs font-black tracking-[0.2em] uppercase">
                      <Sparkles size={14} />
                      ¿Qué aprendiste hoy?
                    </label>
                    <textarea
                      value={formData.learning}
                      onChange={(e) => setFormData({ ...formData, learning: e.target.value })}
                      className="border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/5 min-h-[100px] w-full rounded-2xl border-2 p-5 font-serif text-lg leading-relaxed placeholder:italic focus:ring-4 focus:outline-none"
                      placeholder="Una lección, un descubrimiento..."
                    />
                  </div>
                </div>

                <div className="mb-10 space-y-4">
                  <label className="text-primary text-xs font-black tracking-[0.2em] uppercase">
                    Actividades del día
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_ACTIVITIES.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => toggleActivity(act.label)}
                        className={cn(
                          'flex items-center gap-2 rounded-full border-2 px-5 py-2 text-xs font-bold transition-all hover:scale-105',
                          formData.activities.includes(act.label)
                            ? 'border-primary/50 bg-primary/10 text-primary'
                            : 'bg-muted/30 border-transparent opacity-60 hover:opacity-100'
                        )}
                      >
                        <span>{act.emoji}</span>
                        {act.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-border/40 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t pt-10">
                  {error && <p className="text-destructive text-sm font-black">{error}</p>}
                  {success && <p className="text-sm font-black text-green-500">{success}</p>}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary h-16 w-full sm:flex-1 rounded-2xl text-base font-black tracking-widest uppercase shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-95"
                  >
                    {submitting ? 'Guardando...' : 'Finalizar Reflexión'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="bg-primary relative overflow-hidden border-0 p-10 text-white shadow-2xl">
              <div className="absolute -top-6 -right-6 rotate-12 text-9xl opacity-10">
                {selectedEmotion.emoji}
              </div>
              <h3 className="mb-2 text-2xl font-black tracking-tighter uppercase italic">
                Estado Emocional
              </h3>
              <p className="mb-6 text-sm font-medium text-white/80">
                Monitor de equilibrio emocional
              </p>

              <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-center shadow-inner backdrop-blur-xl">
                <div className="mb-2 text-6xl drop-shadow-lg">{selectedEmotion.emoji}</div>
                <div className="text-lg font-black tracking-widest uppercase">
                  {formData.emotion}
                </div>
                <div className="mt-1 text-xs font-bold italic opacity-60">
                  SENTIMIENTO SELECCIONADO
                </div>
              </div>

              <div className="mt-10 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-black tracking-widest uppercase">
                    <span>Nivel de Bienestar</span>
                    <span>{formData.wellbeing_level * 20}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-black/20 p-1">
                    <motion.div
                      className="h-full rounded-full bg-white shadow-sm"
                      initial={{ width: 0 }}
                      animate={{ width: `${formData.wellbeing_level * 20}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-black/10 p-5 backdrop-blur-md">
                  <p className="text-xs leading-relaxed font-medium opacity-80">
                    "Cada palabra es una ventana a tu interior. Sigue escribiendo para que el Oasis
                    te ayude a florecer."
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-12">
          {/* Visualizaciones AI (Compactas y Equilibradas) */}
          {(wordCloud.length > 0 || phraseCloud.length > 0) && (
            <div className="space-y-6 pt-12">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-md">
                  <Sparkles className="text-primary h-5 w-5" />
                </div>
                <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                  Análisis Emocional AI
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Frases Relevantes */}
                <Card className="bg-card/30 border-0 p-8 shadow-xl backdrop-blur-md">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="text-primary h-5 w-5" />
                      <h3 className="text-xs font-black tracking-widest uppercase opacity-60">
                        Frases Relevantes
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {analysisData.relevant_phrases.length > 0 ? (
                      analysisData.relevant_phrases.map((item, i) => (
                        <div key={i} className="group relative">
                          <div className="bg-primary/5 absolute -inset-2 scale-95 rounded-xl opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100" />
                          <div className="relative flex items-start gap-4">
                            <div className="bg-primary/20 text-primary mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black">
                              {item.count}
                            </div>
                            <p className="text-xs leading-relaxed italic opacity-80">
                              "{item.phrase}"
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-[10px] italic opacity-50">
                        No hay suficientes datos para extraer frases.
                      </p>
                    )}
                  </div>
                </Card>

                {/* Conceptos Clave */}
                <Card className="bg-card/30 border-0 p-8 shadow-xl backdrop-blur-md">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brain className="text-primary h-5 w-5" />
                      <h3 className="text-xs font-black tracking-widest uppercase opacity-60">
                        Conceptos Clave
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    {analysisData.key_concepts.length > 0 ? (
                      analysisData.key_concepts.map((concept, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                          <span className="text-primary/80 block text-2xl font-black tracking-tighter italic">
                            {concept}
                          </span>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center text-[10px] italic opacity-50">
                        Esperando registros...
                      </p>
                    )}
                  </div>
                </Card>

                {/* Patrones Recurrentes */}
                <Card className="bg-card/30 border-0 p-8 shadow-xl backdrop-blur-md">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="text-primary h-5 w-5" />
                      <h3 className="text-xs font-black tracking-widest uppercase opacity-60">
                        Patrones Recurrentes
                      </h3>
                    </div>
                    <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-[8px] font-black">
                      PATTERNS
                    </div>
                  </div>

                  <div className="space-y-6">
                    {analysisData.recurrent_patterns.map((p, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black tracking-widest uppercase opacity-80">
                          <span>"{p.phrase}"</span>
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: getSentimentColor(p.sentiment || '') }}
                          />
                        </div>
                        <div className="bg-muted/30 h-1 w-full overflow-hidden rounded-full">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(p.frequency * 20, 100)}%` }}
                            className="bg-primary h-full rounded-full opacity-60"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-center gap-4 opacity-50">
                    {[
                      { l: 'Pos', c: '#22C55E' },
                      { l: 'Neu', c: '#FACC15' },
                      { l: 'Ans', c: '#F97316' },
                      { l: 'Tris', c: '#EF4444' },
                    ].map((leg) => (
                      <div key={leg.l} className="flex items-center gap-1.5">
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: leg.c }}
                        />
                        <span className="text-[8px] font-black tracking-wider uppercase">
                          {leg.l}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          <div className="space-y-8 pt-8">
            <div className="border-border/50 flex flex-col gap-6 border-b-2 pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-foreground font-serif text-3xl font-bold tracking-tight">
                  Biblioteca de Recuerdos
                </h2>
                <p className="text-muted-foreground text-sm font-medium italic opacity-60">
                  Un viaje a través de tus emociones pasadas
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={emotionFilter === null ? 'default' : 'outline'}
                  onClick={() => setEmotionFilter(null)}
                  className="h-10 rounded-full px-6 text-xs font-black tracking-widest uppercase"
                >
                  Todos
                </Button>
                {EMOTIONS.map((emo) => (
                  <Button
                    key={emo.label}
                    variant={emotionFilter === emo.label ? 'default' : 'outline'}
                    onClick={() => setEmotionFilter(emo.label)}
                    className={cn(
                      'h-10 rounded-full px-5 text-xs font-black tracking-widest uppercase',
                      emotionFilter === emo.label && emo.colorClass
                    )}
                  >
                    <span className="mr-2">{emo.emoji}</span>
                    {emo.label}
                  </Button>
                ))}
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <Card className="bg-muted/5 border-2 border-dashed p-16 text-center">
                <div className="bg-muted/20 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl text-5xl opacity-50 grayscale">
                  🔍
                </div>
                <p className="text-muted-foreground text-xl font-bold italic opacity-60">
                  {emotionFilter
                    ? `No hay registros con el sentimiento "${emotionFilter}"`
                    : 'Tu diario está esperando tus primeras reflexiones...'}
                </p>
                {emotionFilter && (
                  <Button variant="link" onClick={() => setEmotionFilter(null)} className="mt-4">
                    Ver todos los registros
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-16">
                {Object.entries(groupedEntries).map(([date, dayEntries]) => (
                  <div key={date} className="space-y-8">
                    <div className="relative flex items-center gap-4 py-4">
                      <div className="bg-border/50 h-px flex-1" />
                      <h3 className="text-muted-foreground text-sm font-black tracking-[0.3em] whitespace-nowrap uppercase opacity-40">
                        {date}
                      </h3>
                      <div className="bg-border/50 h-px flex-1" />
                    </div>

                    <div className="grid gap-8">
                      <AnimatePresence mode="popLayout">
                        {dayEntries.map((entry, idx) => {
                          const entryEmo =
                            EMOTIONS.find((e) => e.label === entry.emotion) || EMOTIONS[2];
                          let mainText = entry.experience || '';
                          let learnText = '';
                          if (
                            mainText.includes('PASÓ HOY:') &&
                            mainText.includes('APRENDIZAJES:')
                          ) {
                            const parts = mainText.split('APRENDIZAJES:');
                            mainText = parts[0].replace('PASÓ HOY:', '').trim();
                            learnText = parts[1].trim();
                          }
                          const entryTime = entry.created_at
                            ? new Date(entry.created_at).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '';

                          return (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <Card className="group bg-card/40 hover:bg-card/60 relative border-0 shadow-xl transition-all hover:shadow-2xl">
                                <div
                                  className={cn(
                                    'absolute inset-y-0 left-0 w-2 transition-all group-hover:w-3',
                                    entryEmo.colorClass
                                  )}
                                />
                                <div className="p-8">
                                  <div className="mb-8 flex items-start justify-between">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-3">
                                        <span className="text-3xl">{entryEmo.emoji}</span>
                                        <h3
                                          className={cn(
                                            'text-xs font-black tracking-[0.2em] uppercase',
                                            `text-${entryEmo.color.toLowerCase().replace(' ', '-')}-500`
                                          )}
                                        >
                                          {entry.emotion}
                                        </h3>
                                      </div>
                                      {entryTime && (
                                        <div className="text-muted-foreground flex items-center gap-2 text-xs font-bold opacity-40">
                                          <span className="h-1 w-1 rounded-full bg-current" />
                                          EXPEDIDO A LAS {entryTime}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-primary/10 text-4xl font-black italic select-none">
                                      #
                                      {entries.length - entries.findIndex((e) => e.id === entry.id)}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                                    <div className="space-y-4">
                                      <h4 className="text-foreground flex items-center gap-2 text-[10px] font-black tracking-widest uppercase opacity-30">
                                        LO SUCEDIDO
                                      </h4>
                                      <p className="text-foreground/90 font-serif text-lg leading-relaxed whitespace-pre-wrap">
                                        {mainText}
                                      </p>
                                    </div>
                                    {learnText && (
                                      <div className="space-y-4">
                                        <h4 className="text-foreground flex items-center gap-2 text-[10px] font-black tracking-widest uppercase opacity-30">
                                          APRENDIZAJE
                                        </h4>
                                        <div className="border-primary/20 relative border-l-2 py-1 pl-6">
                                          <p className="text-foreground/80 text-lg leading-relaxed font-medium italic">
                                            {learnText}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  {entry.activities && (
                                    <div className="border-border/20 mt-8 flex flex-wrap items-center gap-2 border-t pt-6">
                                      {entry.activities.split(',').map((act, i) => (
                                        <span
                                          key={i}
                                          className="bg-muted/30 rounded-full px-3 py-1 text-[9px] font-black tracking-tighter uppercase opacity-70"
                                        >
                                          {act.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
