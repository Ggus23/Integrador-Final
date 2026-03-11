'use client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DropoutTrendChartProps {
  data: any[];
}

export function DropoutTrendChart({ data }: DropoutTrendChartProps) {
  const formattedData = [...data].reverse().map((item) => ({
    ...item,
    date: new Date(item.created_at).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
    }),
    probability: (item.dropout_probability * 100).toFixed(1),
  }));

  if (!formattedData.length)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolución Riesgo de Abandono</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground py-10 text-center">
          Aún no tienes suficientes evaluaciones para mostrar una tendencia.
        </CardContent>
      </Card>
    );

  return (
    <Card className="col-span-4 transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-risk-high h-2 w-2 animate-pulse rounded-full" />
          Evolución Probabilidad de Abandono (%)
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={formattedData}>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              unit="%"
            />
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-30" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--background)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Line
              type="monotone"
              dataKey="probability"
              stroke="#ef4444"
              strokeWidth={3}
              activeDot={{ r: 8, stroke: '#ef4444', strokeWidth: 2, fill: 'white' }}
              name="Probabilidad"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
