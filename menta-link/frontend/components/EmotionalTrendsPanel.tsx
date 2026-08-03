'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { EmotionalEvolutionChart } from './EmotionalEvolutionChart';
import { Badge } from '@/components/ui/badge';
import { Info, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TrendsData {
  distribution: Record<string, number>;
  weekly_evolution: any[];
  ari_score: number;
  ari_level: string;
}

interface EmotionalTrendsPanelProps {
  data: TrendsData;
}

const EMOTION_META: Record<string, { color: string; emoji: string; label: string }> = {
  feliz: { color: '#10b981', emoji: '😊', label: 'Feliz' },
  neutral: { color: '#6b7280', emoji: '😐', label: 'Neutral' },
  triste: { color: '#3b82f6', emoji: '😔', label: 'Triste' },
  ansioso: { color: '#f59e0b', emoji: '😰', label: 'Ansioso' },
  frustrado: { color: '#ef4444', emoji: '😤', label: 'Frustrado' },
  motivado: { color: '#8b5cf6', emoji: '🚀', label: 'Motivado' },
};

const CustomPieTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const percentage = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
    const meta = EMOTION_META[d.rawName] || { emoji: '🙂', label: d.name };
    return (
      <div className="bg-card/97 border-border animate-in fade-in zoom-in-95 rounded-2xl border p-4 shadow-xl backdrop-blur-md duration-150">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl">{meta.emoji}</span>
          <p className="text-foreground text-sm font-black capitalize">{d.name}</p>
        </div>
        <div className="text-muted-foreground space-y-1 text-xs">
          <p>
            Registros: <span className="text-foreground font-bold">{d.value}</span>
          </p>
          <p>
            Proporción: <span className="text-foreground font-bold">{percentage}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const getAriConfig = (level: string, score: number) => {
  if (level === 'Alto Riesgo' || score < 0.35)
    return {
      color: '#ef4444',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      label: 'Requiere atención urgente',
      badge: 'bg-rose-500',
      icon: TrendingDown,
    };
  if (level === 'Riesgo Medio' || score < 0.65)
    return {
      color: '#f59e0b',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      label: 'Atención moderada',
      badge: 'bg-amber-500',
      icon: Minus,
    };
  return {
    color: '#10b981',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    label: 'En equilibrio',
    badge: 'bg-emerald-500',
    icon: TrendingUp,
  };
};

export function EmotionalTrendsPanel({ data }: EmotionalTrendsPanelProps) {
  const isMobile = useIsMobile();

  const pieData = Object.entries(data.distribution).map(([name, value]) => ({
    name: EMOTION_META[name]?.label || name.charAt(0).toUpperCase() + name.slice(1),
    rawName: name,
    value,
    color: EMOTION_META[name]?.color || '#94a3b8',
  }));

  const totalEmotions = pieData.reduce((acc, curr) => acc + curr.value, 0);
  const dominantEmotion = pieData.sort((a, b) => b.value - a.value)[0];
  const ariConfig = getAriConfig(data.ari_level, data.ari_score);
  const AriIcon = ariConfig.icon;

  // Circunferencia para el gauge
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - circumference * data.ari_score;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* === ARI — Wellness Index Card === */}
      <Card
        className={`bg-card/30 border-border/40 border-t-4 shadow-2xl backdrop-blur-md transition-shadow hover:shadow-xl md:col-span-1 ${ariConfig.border}`}
        style={{ borderTopColor: ariConfig.color }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-bold">Índice de Equilibrio</CardTitle>
            <span className="text-muted-foreground bg-muted/50 flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase">
              <Info className="h-3 w-3" /> IA
            </span>
          </div>
          <CardDescription className="mt-1 text-xs leading-relaxed">
            Cruza estrés PSS-10, ánimo semanal y presión académica.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pt-2 pb-4">
          {/* Gauge SVG */}
          <div className="relative flex items-center justify-center">
            <svg className="h-36 w-36 -rotate-90 transform" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-muted/15"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={ariConfig.color}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="drop-shadow-sm transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black" style={{ color: ariConfig.color }}>
                {(data.ari_score * 100).toFixed(0)}%
              </span>
              <span className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
                Equilibrio
              </span>
            </div>
          </div>

          {/* Badge + description */}
          <Badge
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold text-white ${ariConfig.badge}`}
          >
            <AriIcon className="h-3.5 w-3.5" />
            {ariConfig.label}
          </Badge>

          {/* Scale reference */}
          <div className="w-full space-y-1.5">
            {[
              { label: '0–35%', desc: 'Alto riesgo emocional', color: '#ef4444' },
              { label: '35–65%', desc: 'Atención moderada', color: '#f59e0b' },
              { label: '65–100%', desc: 'Bienestar estable', color: '#10b981' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-[10px]">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-bold" style={{ color: s.color }}>
                  {s.label}
                </span>
                <span className="text-muted-foreground">{s.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* === Emotion Distribution Card === */}
      <Card className="border-border/40 bg-card/30 shadow-2xl backdrop-blur-md md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Distribución Emocional</CardTitle>
          <CardDescription>
            Análisis de los últimos 30 días ·{' '}
            {dominantEmotion && (
              <span>
                Ánimo dominante:{' '}
                <strong className="text-foreground">
                  {EMOTION_META[dominantEmotion.rawName]?.emoji} {dominantEmotion.name}
                </strong>{' '}
                (
                {totalEmotions > 0 ? ((dominantEmotion.value / totalEmotions) * 100).toFixed(0) : 0}
                %)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 48 : 58}
                  outerRadius={isMobile ? 70 : 85}
                  paddingAngle={5}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="var(--background)"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip total={totalEmotions} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom legend */}
          <div className="grid grid-cols-2 gap-2">
            {pieData.map((entry) => {
              const pct =
                totalEmotions > 0 ? ((entry.value / totalEmotions) * 100).toFixed(0) : '0';
              const meta = EMOTION_META[entry.rawName];
              return (
                <div
                  key={entry.rawName}
                  className="bg-muted/20 border-border/20 flex items-center gap-2 rounded-lg border px-2.5 py-1.5"
                >
                  <span className="text-base">{meta?.emoji || '🙂'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground truncate text-[11px] font-bold capitalize">
                        {entry.name}
                      </span>
                      <span className="ml-1 text-[10px] font-black" style={{ color: entry.color }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="bg-muted/40 mt-1 h-1 w-full rounded-full">
                      <div
                        className="h-1 rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: entry.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* === Evolution Chart Card === */}
      <Card className="border-border/40 bg-card/30 shadow-2xl backdrop-blur-md md:col-span-3">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Evolución Semanal del Bienestar</CardTitle>
              <CardDescription>
                Historial de niveles de satisfacción emocional reportados — Escala 1 a 5
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1 text-[10px]">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                Saludable (4–5)
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 text-[10px]">
                <Minus className="h-3 w-3 text-amber-400" />
                Moderado (2.5–4)
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 text-[10px]">
                <TrendingDown className="h-3 w-3 text-rose-500" />
                Riesgo (1–2.5)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <EmotionalEvolutionChart data={data.weekly_evolution} />
        </CardContent>
      </Card>
    </div>
  );
}
