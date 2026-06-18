'use client';

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EvolutionData {
  week: string;
  avg_wellbeing: number;
  emotion: string;
}

interface EmotionalEvolutionChartProps {
  data: EvolutionData[];
}

const EMOTION_EMOJIS: Record<string, string> = {
  feliz: '😊',
  neutral: '😐',
  triste: '😔',
  ansioso: '😰',
  frustrado: '😤',
  motivado: '🚀',
};

const getWellbeingColor = (val: number) => {
  if (val >= 4) return '#10b981';
  if (val >= 3) return '#6ee7b7';
  if (val >= 2) return '#f59e0b';
  return '#ef4444';
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const val = data.avg_wellbeing;
    if (val === null || val === undefined) return null;
    const emoji = EMOTION_EMOJIS[data.emotion?.toLowerCase()] || '😐';
    const color = getWellbeingColor(val);
    const label = val >= 4.5 ? 'Excelente' : val >= 3.5 ? 'Bueno' : val >= 2.5 ? 'Neutral' : val >= 1.5 ? 'Bajo' : 'Muy Bajo';

    return (
      <div className="bg-card/97 border-border border rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-[220px] animate-in fade-in zoom-in-95 duration-150">
        <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase mb-2">
          {data.week}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img">{emoji}</span>
          <div>
            <p className="text-sm font-black" style={{ color }}>{label}</p>
            <p className="text-muted-foreground text-[11px]">
              Bienestar: <span className="font-bold" style={{ color }}>{val.toFixed(1)}</span> / 5.0
            </p>
          </div>
        </div>
        {data.emotion && data.emotion !== 'Sin datos' && (
          <div className="mt-2 pt-2 border-t border-border/20">
            <p className="text-[10px] text-muted-foreground">
              Ánimo dominante: <span className="font-bold text-foreground capitalize">{data.emotion}</span>
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function EmotionalEvolutionChart({ data }: EmotionalEvolutionChartProps) {
  const isMobile = useIsMobile();

  const processedData = (data || []).map((item) => {
    const val = item.avg_wellbeing !== undefined ? item.avg_wellbeing : (item as any).score;
    return {
      ...item,
      avg_wellbeing: item.emotion === 'Sin datos' || val === 0 ? null : val,
    };
  });

  const validPoints = processedData.filter((d) => d.avg_wellbeing !== null);
  const hasValidPoints = validPoints.length > 0;

  if (!hasValidPoints) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card/10 border border-border/10 rounded-2xl min-h-[200px] gap-2">
        <span className="text-4xl mb-1">📊</span>
        <p className="text-sm font-bold text-muted-foreground">Sin datos de evolución</p>
        <p className="text-[11px] text-muted-foreground/80 max-w-[280px]">
          El estudiante aún no tiene registros de bienestar en su diario emocional para este período.
        </p>
      </div>
    );
  }

  // Trend calculation
  const first = validPoints[0]?.avg_wellbeing ?? 0;
  const last = validPoints[validPoints.length - 1]?.avg_wellbeing ?? 0;
  const avgWell = validPoints.reduce((s, d) => s + (d.avg_wellbeing ?? 0), 0) / validPoints.length;
  const trend = last - first;

  return (
    <div className="space-y-3">
      {/* Trend summary row */}
      <div className="flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5 bg-muted/30 border border-border/20 rounded-lg px-2.5 py-1">
          {trend > 0.3 ? (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          ) : trend < -0.3 ? (
            <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
          ) : (
            <Minus className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span className="text-muted-foreground">
            Tendencia:{' '}
            <strong className={trend > 0.3 ? 'text-emerald-500' : trend < -0.3 ? 'text-rose-500' : 'text-slate-400'}>
              {trend > 0.3 ? 'Mejorando' : trend < -0.3 ? 'Decayendo' : 'Estable'}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/30 border border-border/20 rounded-lg px-2.5 py-1">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getWellbeingColor(avgWell) }} />
          <span className="text-muted-foreground">
            Promedio del período:{' '}
            <strong className="text-foreground">{avgWell.toFixed(1)}/5.0</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/30 border border-border/20 rounded-lg px-2.5 py-1">
          <span className="text-muted-foreground">
            Semanas registradas:{' '}
            <strong className="text-foreground">{validPoints.length}</strong>
          </span>
        </div>
      </div>

      <div className="h-[260px] sm:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={processedData}
            margin={{
              top: 15,
              right: isMobile ? 15 : 30,
              left: isMobile ? -20 : 10,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="wellbeingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Reference zones */}
            <ReferenceLine y={4} stroke="#10b981" strokeDasharray="5 3" strokeOpacity={0.4} strokeWidth={1} />
            <ReferenceLine y={2.5} stroke="#f59e0b" strokeDasharray="5 3" strokeOpacity={0.4} strokeWidth={1} />

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.2} />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              dy={8}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 2.5, 3, 4, 5]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              dx={isMobile ? -2 : -10}
              tickFormatter={(val) => {
                if (isMobile) {
                  if (val === 5) return '😊';
                  if (val === 2.5) return '😐';
                  if (val === 1) return '😭';
                  return '';
                }
                if (val === 5) return '5 — Excelente';
                if (val === 4) return '4 — Bueno';
                if (val === 2.5) return '2.5 — Neutral';
                if (val === 1) return '1 — Muy bajo';
                return val.toString();
              }}
              width={isMobile ? 30 : 100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="avg_wellbeing"
              stroke="var(--primary)"
              strokeWidth={3}
              fill="url(#wellbeingGradient)"
              connectNulls
              dot={{ r: 5, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--background)' }}
              activeDot={{ r: 7, strokeWidth: 0, fill: 'var(--primary)' }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Scale legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>4–5 · Saludable</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span>2.5–4 · Atención moderada</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span>1–2.5 · Riesgo</span>
        </div>
      </div>
    </div>
  );
}
