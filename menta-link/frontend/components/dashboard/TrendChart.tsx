'use client';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface TrendChartProps {
  data: any[];
}

export function TrendChart({ data }: TrendChartProps) {
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
    <Card className="border-border/40 bg-card/30 shadow-2xl backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-foreground font-serif text-xl font-bold">
            Resumen de Bienestar
          </CardTitle>
          <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
            Tendencia Semanal
          </p>
        </div>
        <div className="bg-support-medium/10 rounded-full p-2">
          <Sparkles className="text-support-medium h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="pl-0">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--support-medium)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--support-medium)" stopOpacity={0} />
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
              domain={[1, 5]}
              ticks={[1, 3, 5]}
            />
            <Tooltip
              cursor={{ stroke: 'var(--support-medium)', strokeWidth: 1, strokeDasharray: '4 4' }}
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
        <div className="px-6 pb-2">
          <p className="text-muted-foreground text-[11px] leading-relaxed italic">
            * Cada punto refleja tu equilibrio emocional. Las áreas suaves indican la estabilidad de
            tu semana.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
