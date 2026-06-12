'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface RiskFactorsChartProps {
  factors: Record<string, number>;
}

const LABELS: Record<string, string> = {
  pss_score: 'Nivel de Estrés',
  checkin_avg: 'Estado de Ánimo',
  bad_days_freq: 'Días Bajos',
  study_pressure: 'Presión Académica',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 border-border border rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
        <p className="text-foreground text-sm font-black">{data.name}</p>
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          <p>
            Importancia / Impacto: <span className="text-foreground font-bold">{data.impact.toFixed(4)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function RiskFactorsChart({ factors }: RiskFactorsChartProps) {
  const isMobile = useIsMobile();

  if (!factors || Object.keys(factors).length === 0) {
    return <div className="text-sm text-muted-foreground italic p-4 text-center">No hay datos de factores de riesgo.</div>;
  }

  // Transform data for Recharts
  const data = Object.entries(factors)
    .map(([key, value]) => ({
      name: LABELS[key] || key,
      impact: value,
      originalKey: key,
    }))
    .sort((a, b) => b.impact - a.impact);

  return (
    <div className="h-[250px] sm:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ 
            top: 10, 
            right: isMobile ? 10 : 30, 
            left: isMobile ? -20 : 10, 
            bottom: 5 
          }}
        >
          <defs>
            <linearGradient id="colorRiskBar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.2} />
          <XAxis type="number" domain={[0, 'auto']} hide />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={isMobile ? 100 : 130} 
            tick={{ fontSize: isMobile ? 10 : 12, fill: 'var(--muted-foreground)' }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="impact" 
            fill="url(#colorRiskBar)" 
            radius={[0, 6, 6, 0]} 
            barSize={isMobile ? 14 : 20} 
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
