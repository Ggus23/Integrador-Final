'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface RiskFactorsChartProps {
  factors: Record<string, number>;
}

const LABELS: Record<string, string> = {
  pss_score: 'Nivel de Estrés',
  checkin_avg: 'Estado de Ánimo',
  bad_days_freq: 'Frecuencia de Días Bajos',
  study_pressure: 'Presión Académica',
};

const FACTOR_COLORS: Record<string, string> = {
  pss_score: '#ef4444',
  study_pressure: '#f59e0b',
  bad_days_freq: '#fb923c',
  checkin_avg: '#10b981',
};

const FACTOR_DESCRIPTIONS: Record<string, string> = {
  pss_score: 'Impacto del estrés percibido en el riesgo',
  checkin_avg: 'Influencia del estado de ánimo diario',
  bad_days_freq: 'Días con bienestar bajo (<3)',
  study_pressure: 'Presión académica registrada',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 border-border animate-in fade-in zoom-in-95 max-w-[220px] rounded-2xl border p-4 shadow-xl backdrop-blur-md duration-150">
        <p className="text-foreground mb-1 text-sm font-black">{data.name}</p>
        <p className="text-muted-foreground mb-2 text-[10px] leading-snug">
          {FACTOR_DESCRIPTIONS[data.originalKey] || 'Factor de riesgo detectado por IA'}
        </p>
        <div className="border-border/20 mt-2 flex items-center justify-between border-t pt-2">
          <span className="text-muted-foreground text-[10px]">Peso en el modelo:</span>
          <span className="text-foreground text-xs font-bold">
            {(data.impact * 100).toFixed(1)}%
          </span>
        </div>
        <div className="bg-muted/30 mt-2 h-1.5 w-full rounded-full">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(data.impact * 100, 100)}%`, backgroundColor: data.color }}
          />
        </div>
      </div>
    );
  }
  return null;
};

export function RiskFactorsChart({ factors }: RiskFactorsChartProps) {
  const isMobile = useIsMobile();

  if (!factors || Object.keys(factors).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <span className="text-3xl">🔍</span>
        <p className="text-muted-foreground text-sm italic">
          No hay datos de factores de riesgo disponibles.
        </p>
        <p className="text-muted-foreground/70 max-w-[240px] text-[11px]">
          Completa una evaluación PSS-10 y registra tu bienestar para activar el análisis de IA.
        </p>
      </div>
    );
  }

  const data = Object.entries(factors)
    .map(([key, value]) => ({
      name: LABELS[key] || key,
      impact: value,
      originalKey: key,
      color: FACTOR_COLORS[key] || '#6b7280',
    }))
    .sort((a, b) => b.impact - a.impact);

  const maxImpact = Math.max(...data.map((d) => d.impact));

  return (
    <div className="space-y-3">
      {/* Mini summary */}
      <div className="text-muted-foreground flex flex-wrap gap-2 text-[10px]">
        {data.slice(0, 2).map((d) => (
          <span
            key={d.originalKey}
            className="bg-muted/30 border-border/20 flex items-center gap-1 rounded-full border px-2 py-0.5"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <strong className="text-foreground">{d.name}</strong> — mayor influencia
          </span>
        ))}
      </div>

      <div className="h-[250px] w-full sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 5,
              right: isMobile ? 15 : 40,
              left: isMobile ? -10 : 5,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="var(--border)"
              opacity={0.2}
            />
            <XAxis type="number" domain={[0, maxImpact * 1.2]} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={isMobile ? 110 : 145}
              tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="impact"
              radius={[0, 8, 8, 0]}
              barSize={isMobile ? 16 : 22}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Factor labels below chart */}
      <div className="grid grid-cols-2 gap-2">
        {data.map((d) => (
          <div
            key={d.originalKey}
            className="text-muted-foreground flex items-center gap-2 text-[10px]"
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="truncate">{d.name}</span>
            <span className="text-foreground ml-auto font-bold">
              {(d.impact * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
