'use client';

import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface EvolutionData {
  week: string;
  avg_wellbeing: number;
  emotion: string;
}

interface EmotionalEvolutionChartProps {
  data: EvolutionData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 border-border border rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
        <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase mb-1">
          {data.week}
        </p>
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          <p>
            Bienestar Promedio:{' '}
            <span className="text-foreground font-bold">{data.avg_wellbeing.toFixed(2)}</span> / 5.0
          </p>
          <p>
            Ánimo Principal:{' '}
            <span className="text-foreground font-bold capitalize">{data.emotion}</span>
          </p>
        </div>
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

  const hasValidPoints = processedData.some((item) => item.avg_wellbeing !== null);

  if (!hasValidPoints) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-card/10 border border-border/10 rounded-2xl min-h-[200px]">
        <span className="text-3xl mb-2 select-none">📊</span>
        <p className="text-sm font-bold text-muted-foreground">Sin datos de evolución</p>
        <p className="text-[11px] text-muted-foreground/80 max-w-[280px] mt-1">
          El estudiante aún no tiene registros de bienestar en su diario emocional para este período.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[250px] sm:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={processedData} 
          margin={{ 
            top: 15, 
            right: isMobile ? 15 : 30, 
            left: isMobile ? -20 : 10, 
            bottom: 5 
          }}
        >
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
            ticks={[1, 2, 3, 4, 5]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            dx={isMobile ? -2 : -10}
            tickFormatter={(val) => {
              if (isMobile) {
                if (val === 5) return '😊';
                if (val === 3) return '😐';
                if (val === 1) return '😭';
                return '';
              }
              return val.toString();
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="avg_wellbeing"
            stroke="var(--primary)"
            strokeWidth={3.5}
            connectNulls={true}
            dot={{ r: 5, fill: 'var(--primary)', strokeWidth: 1.5, stroke: 'var(--background)' }}
            activeDot={{ r: 7, strokeWidth: 0 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
