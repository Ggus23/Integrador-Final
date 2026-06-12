'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface RiskDistributionChartProps {
  data: Record<string, number>;
}

const CustomTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-card/95 border-border border rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
          <p className="text-foreground text-sm font-black">Riesgo {data.name}</p>
        </div>
        <div className="mt-2 text-xs text-muted-foreground space-y-1">
          <p>
            Alumnos: <span className="text-foreground font-bold">{data.value}</span>
          </p>
          <p>
            Proporción: <span className="text-foreground font-bold">{percentage}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  const isMobile = useIsMobile();

  const chartData = [
    { name: 'Bajo', value: data['Low'] || data['bajo'] || 0, color: '#10b981' },
    { name: 'Medio', value: data['Medium'] || data['medio'] || 0, color: '#f59e0b' },
    { name: 'Alto', value: data['High'] || data['alto'] || 0, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  const totalStudents = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const renderLegend = (value: string) => {
    const item = chartData.find((d) => d.name === value);
    const percentage = totalStudents > 0 ? (((item?.value || 0) / totalStudents) * 100).toFixed(0) : 0;
    return (
      <span className="text-foreground text-xs font-semibold ml-1 mr-3">
        {value} ({percentage}%)
      </span>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Distribución de Riesgo (IA)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex items-center justify-center p-8">
            No hay datos suficientes para graficar.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Label only on desktop to avoid clipping on mobile screen edges
  const renderLabel = isMobile
    ? undefined
    : ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIUS = outerRadius * 1.25;
        const x = cx + RADIUS * Math.cos(-midAngle * (Math.PI / 180));
        const y = cy + RADIUS * Math.sin(-midAngle * (Math.PI / 180));
        return (
          <text
            x={x}
            y={y}
            fill="var(--foreground)"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={11}
            fontWeight="bold"
          >
            {`${(percent * 100).toFixed(0)}%`}
          </text>
        );
      };

  return (
    <Card className="col-span-4 md:col-span-2 lg:col-span-1 border-border/40 bg-card/30 shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground font-serif text-lg font-bold">
          Distribución de Riesgo (IA)
        </CardTitle>
        <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
          Estado Académico Global
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={isMobile ? 45 : 60}
                outerRadius={isMobile ? 65 : 80}
                paddingAngle={5}
                dataKey="value"
                label={renderLabel}
                labelLine={!isMobile}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={totalStudents} />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={8}
                formatter={renderLegend}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
