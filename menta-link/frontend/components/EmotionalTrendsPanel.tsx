'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { EmotionalEvolutionChart } from './EmotionalEvolutionChart';
import { Badge } from '@/components/ui/badge';
import { Info, TrendingDown, TrendingUp } from 'lucide-react';
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

const EMOTION_COLORS: Record<string, string> = {
  feliz: '#10b981',
  neutral: '#6b7280',
  triste: '#3b82f6',
  ansioso: '#f59e0b',
  frustrado: '#ef4444',
  motivado: '#8b5cf6',
};

const CustomPieTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-card/95 border-border border rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="text-foreground text-sm font-black capitalize">{data.name}</p>
        </div>
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          <p>
            Registros: <span className="text-foreground font-bold">{data.value}</span>
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

export function EmotionalTrendsPanel({ data }: EmotionalTrendsPanelProps) {
  const isMobile = useIsMobile();

  const pieData = Object.entries(data.distribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: EMOTION_COLORS[name] || '#94a3b8',
  }));

  const totalEmotions = pieData.reduce((acc, curr) => acc + curr.value, 0);

  const renderLegend = (value: string) => {
    const item = pieData.find((d) => d.name === value);
    const percentage = totalEmotions > 0 ? (((item?.value || 0) / totalEmotions) * 100).toFixed(0) : 0;
    return (
      <span className="text-foreground text-xs font-semibold ml-1 mr-3">
        {value} ({percentage}%)
      </span>
    );
  };

  const renderLabel = isMobile
    ? undefined
    : ({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Wellness Summary Card */}
      <Card className="border-t-primary border-t-4 bg-card/30 border-border/40 backdrop-blur-md shadow-2xl transition-shadow hover:shadow-xl md:col-span-1">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg sm:text-xl font-bold">Índice de Equilibrio Estudiantil</CardTitle>
            <div className="text-muted-foreground bg-muted/50 flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase self-start sm:self-auto">
              <Info className="h-3 w-3" /> Privado
            </div>
          </div>
          <CardDescription className="text-xs mt-2 leading-relaxed">
            Tu estado general de bienestar actual. 
            <br/><br/>
            <b>¿Cómo se mide?</b><br/>
            Combina tu nivel de estrés (Test PSS-10) con tu estado de ánimo semanal y tu presión académica.
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
                className="text-muted/10"
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
      <Card className="shadow-2xl md:col-span-2 border-border/40 bg-card/30 backdrop-blur-md">
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
                  cy="45%"
                  innerRadius={isMobile ? 45 : 55}
                  outerRadius={isMobile ? 65 : 75}
                  paddingAngle={8}
                  dataKey="value"
                  label={renderLabel}
                  labelLine={!isMobile}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip total={totalEmotions} />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  iconSize={8}
                  formatter={renderLegend}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Evolution Chart Card */}
      <Card className="shadow-2xl md:col-span-3 border-border/40 bg-card/30 backdrop-blur-md">
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
