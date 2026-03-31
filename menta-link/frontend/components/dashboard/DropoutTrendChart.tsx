'use client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface DropoutTrendChartProps {
  data: any[];
}

export function DropoutTrendChart({ data }: DropoutTrendChartProps) {
  // We invert the probability to show "Continuity/Success" instead of "Risk"
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
    <Card className="border-border/40 bg-card/30 shadow-2xl backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-foreground font-serif text-xl font-bold italic">
            Meta de Continuidad Académica
          </CardTitle>
          <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
            Proyección de Éxito (%)
          </p>
        </div>
        <div className="bg-support-low/10 rounded-full p-2">
          <Target className="text-support-low h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="pl-0">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorContinuity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--support-low)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--support-low)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="var(--muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              ticks={[0, 50, 100]}
            />
            <Tooltip
              cursor={{ stroke: 'var(--support-low)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '12px',
              }}
              itemStyle={{ color: 'var(--foreground)', fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{
                color: 'var(--muted-foreground)',
                marginBottom: '4px',
                fontSize: '10px',
              }}
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
        <div className="px-6 pb-2">
          <p className="text-muted-foreground text-[11px] leading-relaxed italic">
            * Esta métrica estima tu estabilidad académica actual. ¡Sigue así para mantener tu meta!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
