'use client';

import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface EvolutionData {
  week: string;
  avg_wellbeing: number;
  emotion: string;
}

interface EmotionalEvolutionChartProps {
  data: EvolutionData[];
}

export function EmotionalEvolutionChart({ data }: EmotionalEvolutionChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-gray-500">No hay datos de evolución emocional.</div>;
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="week"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            dy={10}
          />
          <YAxis
            domain={[1, 5]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: number, name: string, props: any) => [
              value,
              `Bienestar (Emoción: ${props.payload.emotion})`,
            ]}
          />
          <Line
            type="monotone"
            dataKey="avg_wellbeing"
            stroke="#0d9488"
            strokeWidth={3}
            dot={{ r: 6, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 8, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
