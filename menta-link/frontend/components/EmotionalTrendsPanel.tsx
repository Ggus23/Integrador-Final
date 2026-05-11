'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { EmotionalEvolutionChart } from './EmotionalEvolutionChart';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingDown, TrendingUp, Info } from 'lucide-react';

interface TrendsData {
  distribution: Record<string, number>;
  weekly_evolution: any[];
  ari_score: number;
  ari_level: string;
}

interface EmotionalTrendsPanelProps {
  data: TrendsData;
}

const EMOTION_COLORS: Record<string, string> = {
  feliz: '#10b981',
  neutral: '#6b7280',
  triste: '#3b82f6',
  ansioso: '#f59e0b',
  frustrado: '#ef4444',
  motivado: '#8b5cf6',
};

export function EmotionalTrendsPanel({ data }: EmotionalTrendsPanelProps) {
  const pieData = Object.entries(data.distribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: EMOTION_COLORS[name] || '#94a3b8',
  }));

  const getAriColor = (level: string) => {
    switch (level) {
      case 'Alto Riesgo':
        return 'destructive';
      case 'Riesgo Medio':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Wellness Summary Card */}
      <Card className="border-t-primary border-t-4 shadow-lg transition-shadow hover:shadow-xl md:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Índice de Equilibrio Estudiantil</CardTitle>
            <div className="text-muted-foreground bg-muted/50 flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase">
              <Info className="h-3 w-3" /> Privado
            </div>
          </div>
          <CardDescription className="text-xs mt-2 leading-relaxed">
            Tu estado general de bienestar actual. 
            <br/><br/>
            <b>¿Cómo se mide?</b><br/>
            Es un porcentaje que combina tu nivel de estrés (Test PSS-10) con tu estado de ánimo semanal y tu presión académica. Un valor alto (cerca al 100%) indica que tienes control y equilibrio, un valor bajo indica que podrías necesitar atención.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="relative mb-4 flex items-center justify-center">
            <svg className="h-32 w-32 -rotate-90 transform">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={351.8}
                strokeDashoffset={351.8 - 351.8 * data.ari_score}
                className="text-primary transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="text-primary absolute text-3xl font-bold">
              {(data.ari_score * 100).toFixed(0)}%
            </span>
          </div>
          <Badge
            className={`mb-4 px-4 py-1 text-sm ${
              data.ari_level === 'Alto Riesgo'
                ? 'bg-support-high text-white'
                : data.ari_level === 'Riesgo Medio'
                  ? 'bg-support-medium text-white'
                  : 'bg-support-low text-white'
            }`}
          >
            {data.ari_level === 'Alto Riesgo'
              ? 'Necesitas un momento'
              : data.ari_level === 'Riesgo Medio'
                ? 'Atención moderada'
                : 'En equilibrio'}
          </Badge>
          <p className="text-muted-foreground mt-2 flex items-center gap-1 text-center text-[10px] italic">
            Este índice es una guía visual para ayudarte a monitorear tu bienestar.
          </p>
        </CardContent>
      </Card>

      {/* Emotion Distribution Card */}
      <Card className="shadow-md md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Distribución Emocional Dominante</CardTitle>
          <CardDescription>Análisis de los últimos 30 días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Evolution Chart Card */}
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md md:col-span-3 dark:from-gray-900 dark:to-black">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Evolución del Bienestar Estudiantil</CardTitle>
              <CardDescription>Tendencia semanal de niveles de satisfacción</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" /> Saludable
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-rose-500" /> Riesgo
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
