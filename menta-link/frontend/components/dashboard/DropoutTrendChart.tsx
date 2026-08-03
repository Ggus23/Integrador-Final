'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DropoutTrendChartProps {
  data: any[];
}

const getSuccessLevel = (prob: number) => {
  if (prob >= 85) return { label: 'Muy Alta Continuidad', emoji: '🚀', color: 'text-emerald-500' };
  if (prob >= 70) return { label: 'Estabilidad Académica', emoji: '📈', color: 'text-teal-500' };
  if (prob >= 50) return { label: 'Riesgo Moderado', emoji: '⚠️', color: 'text-amber-500' };
  return { label: 'Riesgo Alto de Deserción', emoji: '🚨', color: 'text-rose-500' };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = parseFloat(payload[0].value);
    const { label, emoji, color } = getSuccessLevel(value);

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
              Éxito Proyectado:{' '}
              <span className="text-foreground font-bold">{value.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function DropoutTrendChart({ data }: DropoutTrendChartProps) {
  const isMobile = useIsMobile();

  const formattedData = [...data].reverse().map((item) => ({
    ...item,
    date: new Date(item.created_at).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
    }),
    continuity: (100 - item.dropout_probability * 100).toFixed(1),
  }));

  if (!formattedData.length)
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="text-muted-foreground flex h-[350px] items-center justify-center italic">
          Completa tus evaluaciones para proyectar tu meta académica
        </CardContent>
      </Card>
    );

  return (
    <Card className="border-border/40 bg-card/30 overflow-hidden shadow-2xl backdrop-blur-md">
      <CardHeader className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-foreground font-serif text-xl font-bold italic">
              Meta de Continuidad Académica
            </CardTitle>
            <div className="bg-support-low/10 rounded-full p-1.5 sm:hidden">
              <Target className="text-support-low h-4 w-4" />
            </div>
          </div>
          <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
            Proyección de Éxito (%)
          </p>
          <p className="text-muted-foreground mt-2 max-w-[95%] text-xs leading-relaxed">
            <b>¿En qué consiste esta medida?</b>
            <br />
            Esta gráfica representa tu probabilidad (0% al 100%) de completar tu carrera. Una IA
            calcula esta métrica cruzando tu historial emocional, notas y condiciones de becas.
          </p>
        </div>
        <div className="bg-support-low/10 hidden self-start rounded-full p-2 sm:block">
          <Target className="text-support-low h-4 w-4" />
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
                <linearGradient id="colorContinuity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--support-low)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--support-low)" stopOpacity={0} />
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
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(value) => {
                  if (isMobile) {
                    if (value === 100) return '🚀';
                    if (value === 50) return '⚠️';
                    if (value === 0) return '🚨';
                    return '';
                  }
                  return `${value}%`;
                }}
              />
              <Tooltip
                cursor={{
                  stroke: 'var(--support-low)',
                  strokeWidth: 1.5,
                  strokeDasharray: '4 4',
                }}
                content={<CustomTooltip />}
              />
              <Area
                type="monotone"
                dataKey="continuity"
                stroke="var(--support-low)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorContinuity)"
                animationDuration={2500}
                name="Probabilidad de Éxito"
                className="chart-glow"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="border-border/10 mt-4 border-t px-6 pt-3">
          <p className="text-muted-foreground text-[10px] leading-relaxed italic sm:text-[11px]">
            * Esta métrica estima tu estabilidad académica actual. ¡Completa tus evaluaciones
            periódicamente para mantener tu proyección al día!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
