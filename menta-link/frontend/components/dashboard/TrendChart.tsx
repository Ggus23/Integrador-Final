'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TrendChartProps {
  data: any[];
}

const getMoodEmojiAndLabel = (score: number) => {
  if (score >= 4.5) return { label: 'Excelente', emoji: '😊', color: 'text-emerald-500' };
  if (score >= 3.5) return { label: 'Bueno', emoji: '🙂', color: 'text-teal-500' };
  if (score >= 2.5) return { label: 'Neutral', emoji: '😐', color: 'text-slate-400' };
  if (score >= 1.5) return { label: 'Bajo', emoji: '🙁', color: 'text-amber-500' };
  return { label: 'Muy Bajo', emoji: '😭', color: 'text-rose-500' };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const score = payload[0].value;
    const { label, emoji, color } = getMoodEmojiAndLabel(score);

    return (
      <div className="bg-card/95 border-border animate-in fade-in zoom-in-95 max-w-[260px] rounded-2xl border p-4 shadow-xl backdrop-blur-md duration-150">
        <p className="text-muted-foreground mb-1 text-[10px] font-black tracking-widest uppercase">
          {new Date(data.created_at).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
          })}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-3xl select-none" role="img" aria-label={label}>
            {emoji}
          </span>
          <div>
            <p className={`text-sm leading-none font-black ${color}`}>{label}</p>
            <p className="text-muted-foreground mt-1 text-[11px] leading-snug">
              Ánimo: <span className="text-foreground font-bold">{score.toFixed(1)}</span> de 5.0
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function TrendChart({ data }: TrendChartProps) {
  const isMobile = useIsMobile();

  const formattedData = [...data].reverse().map((item) => ({
    ...item,
    date: new Date(item.created_at).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
    }),
  }));

  if (!formattedData.length)
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="text-muted-foreground flex h-[350px] items-center justify-center italic">
          Comienza a registrar tu ánimo para ver tu evolución
        </CardContent>
      </Card>
    );

  return (
    <Card className="border-border/40 bg-card/30 overflow-hidden shadow-2xl backdrop-blur-md">
      <CardHeader className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-foreground font-serif text-xl font-bold">
              Resumen de Bienestar
            </CardTitle>
            <div className="bg-support-medium/10 rounded-full p-1.5 sm:hidden">
              <Sparkles className="text-support-medium h-4 w-4" />
            </div>
          </div>
          <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
            Tendencia Semanal
          </p>
          <p className="text-muted-foreground mt-2 max-w-[95%] text-xs leading-relaxed">
            <b>¿En qué consiste esta medida?</b>
            <br />
            Representa el promedio histórico (del 1 al 5) de cómo reportas tu estado de ánimo en
            cada registro. La zona alta (5) refleja sentimientos positivos, mientras que la zona
            baja (1) refleja fatiga emocional o estrés agudo.
          </p>
        </div>
        <div className="bg-support-medium/10 hidden self-start rounded-full p-2 sm:block">
          <Sparkles className="text-support-medium h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="pr-2 pb-4 pl-0 sm:pr-4">
        <div className="h-[260px] w-full sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{
                top: 10,
                right: isMobile ? 10 : 20,
                left: isMobile ? -25 : -10,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--support-medium)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--support-medium)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={8}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(value) => {
                  if (isMobile) {
                    if (value === 5) return '😊';
                    if (value === 3) return '😐';
                    if (value === 1) return '😭';
                    return '';
                  }
                  if (value === 5) return '5 (Excelente)';
                  if (value === 3) return '3 (Neutral)';
                  if (value === 1) return '1 (Muy Bajo)';
                  return value.toString();
                }}
              />
              <Tooltip
                cursor={{
                  stroke: 'var(--support-medium)',
                  strokeWidth: 1.5,
                  strokeDasharray: '4 4',
                }}
                content={<CustomTooltip />}
              />
              <Area
                type="monotone"
                dataKey="mood_score"
                stroke="var(--support-medium)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMood)"
                animationDuration={2000}
                name="Nivel de Ánimo"
                className="chart-glow"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="border-border/10 mt-4 border-t px-6 pt-3">
          <p className="text-muted-foreground text-[10px] leading-relaxed italic sm:text-[11px]">
            * Cada punto refleja tu equilibrio emocional. Toca los puntos para ver el desglose
            detallado con recomendaciones de autocuidado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
