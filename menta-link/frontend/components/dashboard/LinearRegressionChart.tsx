'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle, TrendingDown, TrendingUp, Minus, Info } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';

interface DataPoint {
  student_id: number;
  student_name: string;
  stress_score: number;
  academic_avg: number;
}

interface RegressionLine {
  slope: number;
  intercept: number;
  r_value: number;
  r_squared: number;
  p_value: number;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}

interface LinearRegressionData {
  points: DataPoint[];
  regression_line: RegressionLine | null;
  equation: string;
  interpretation: string;
  data_count: number;
  r_squared: number;
  correlation: string;
  strength: string;
}

const CustomDot = (props: any) => {
  const { cx, cy } = props;
  return <circle cx={cx} cy={cy} r={6} fill="#3b82f6" fillOpacity={0.5} stroke="none" />;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/98 border-border animate-in fade-in zoom-in-95 max-w-[260px] rounded-2xl border p-4 shadow-2xl backdrop-blur-md duration-150">
        <p className="text-foreground mb-1 truncate text-sm font-black">{data.name}</p>
        <div className="border-border/20 space-y-2 border-t pt-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-[11px]">Estrés PSS-10:</span>
            <span className="text-foreground text-[11px] font-bold">{data.x} / 40</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-[11px]">Promedio Acad.:</span>
            <span className="text-foreground text-[11px] font-bold">{data.y.toFixed(1)} / 10</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const getCorrelationIcon = (slope?: number) => {
  if (slope === undefined) return <Minus className="h-4 w-4" />;
  if (slope < -0.05) return <TrendingDown className="h-4 w-4 text-rose-500" />;
  if (slope > 0.05) return <TrendingUp className="h-4 w-4 text-emerald-500" />;
  return <Minus className="h-4 w-4 text-slate-400" />;
};

export function LinearRegressionChart() {
  const isMobile = useIsMobile();
  const [data, setData] = useState<LinearRegressionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRegressionData();
  }, []);

  const fetchRegressionData = async () => {
    try {
      setLoading(true);
      const result = await apiClient.request('GET', '/analysis/linear-regression');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const scatterData = useMemo(() => {
    if (!data) return [];
    return data.points.map((point) => ({
      x: point.stress_score,
      y: point.academic_avg,
      name: point.student_name,
      id: point.student_id,
    }));
  }, [data]);

  const lineData = useMemo(() => {
    if (!data?.regression_line) return [];
    const { slope, intercept } = data.regression_line;
    const points: { x: number; y: number }[] = [];
    // Genera puntos ordenados secuencialmente para que Recharts dibuje la recta sin alteraciones
    for (let x = 0; x <= 40; x += 1) {
      points.push({ x, y: slope * x + intercept });
    }
    return points;
  }, [data]);

  const rSquaredPct = data ? (data.r_squared * 100).toFixed(1) : '0';
  const slope = data?.regression_line?.slope;
  const correlationDir =
    slope !== undefined && slope < -0.05
      ? 'negativa'
      : slope !== undefined && slope > 0.05
        ? 'positiva'
        : 'neutral';

  const strengthLabel = data
    ? data.strength?.toLowerCase().includes('fuerte') ||
      data.strength?.toLowerCase().includes('strong')
      ? 'Fuerte'
      : data.strength?.toLowerCase().includes('modera') ||
          data.strength?.toLowerCase().includes('moderate')
        ? 'Moderada'
        : data.strength?.toLowerCase().includes('débil') ||
            data.strength?.toLowerCase().includes('weak')
          ? 'Débil'
          : data.strength || 'N/A'
    : 'N/A';

  if (loading) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex h-[460px] items-center justify-center">
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            <span className="text-xs font-semibold">Calculando correlación estadística...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex h-[460px] items-center justify-center">
          <div className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error || 'No hay datos disponibles'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 bg-card/30 overflow-hidden shadow-2xl backdrop-blur-md">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-foreground flex items-center gap-2 font-serif text-xl font-bold">
              Estrés vs. Rendimiento Académico
            </CardTitle>
            <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
              Regresión Lineal · {data.data_count} estudiantes
            </p>
          </div>
          <div className="text-muted-foreground bg-muted/30 border-border/20 flex items-center gap-1.5 self-start rounded-lg border px-2 py-1 text-[10px]">
            <Info className="h-3 w-3 shrink-0" />
            <span>Cada punto es un student</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        <div className="border-border/20 bg-background/40 h-[340px] w-full rounded-2xl border p-2 sm:h-[420px] sm:p-4">
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                margin={{
                  top: 20,
                  right: isMobile ? 10 : 30,
                  bottom: isMobile ? 15 : 45,
                  left: isMobile ? -20 : 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Estrés"
                  label={{
                    value: 'Nivel de Estrés PSS-10 (0–40)',
                    position: 'bottom',
                    offset: 15,
                    fontSize: 11,
                    fill: 'var(--muted-foreground)',
                  }}
                  domain={[0, 40]}
                  ticks={[0, 10, 20, 30, 40]}
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Promedio"
                  label={{
                    value: 'Promedio de Calificaciones',
                    angle: -90,
                    position: 'insideLeft',
                    offset: -5,
                    fontSize: 11,
                    fill: 'var(--muted-foreground)',
                  }}
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{
                    strokeDasharray: '3 3',
                    stroke: 'var(--muted-foreground)',
                    strokeOpacity: 0.4,
                  }}
                  content={<CustomTooltip />}
                />

                <Scatter
                  name="Estudiantes"
                  data={scatterData}
                  shape={<CustomDot />}
                  className="cursor-pointer"
                />

                {lineData.length > 1 && (
                  <Line
                    type="linear"
                    name="Tendencia"
                    data={lineData}
                    dataKey="y"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-sm italic">
              <span className="text-3xl">📭</span>
              <span>No hay suficientes datos para mostrar el gráfico</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border-border/20 bg-background/40 hover:bg-background/60 rounded-xl border p-3 transition-all">
            <div className="text-muted-foreground mb-1 text-[9px] font-black tracking-widest uppercase">
              Ecuación
            </div>
            <div className="text-foreground truncate font-mono text-sm font-bold">
              {data.equation}
            </div>
            <div className="text-muted-foreground mt-0.5 text-[9px]">Fórmula de la recta</div>
          </div>

          <div className="border-border/20 bg-background/40 hover:bg-background/60 rounded-xl border p-3 transition-all">
            <div className="text-muted-foreground mb-1 text-[9px] font-black tracking-widest uppercase">
              R² — Precisión
            </div>
            <div className="text-foreground text-lg font-bold">{rSquaredPct}%</div>
            <div className="text-muted-foreground mt-0.5 text-[9px]">
              {parseFloat(rSquaredPct) >= 50
                ? 'El modelo explica bien los datos'
                : parseFloat(rSquaredPct) >= 25
                  ? 'Correlación moderada'
                  : 'Correlación débil'}
            </div>
          </div>

          <div className="border-border/20 bg-background/40 hover:bg-background/60 rounded-xl border p-3 transition-all">
            <div className="text-muted-foreground mb-1 text-[9px] font-black tracking-widest uppercase">
              Dirección
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              {getCorrelationIcon(slope)}
              <span className="text-foreground text-sm font-bold capitalize">
                {correlationDir === 'negativa'
                  ? 'Negativa'
                  : correlationDir === 'positiva'
                    ? 'Positiva'
                    : 'Neutra'}
              </span>
            </div>
            <div className="text-muted-foreground mt-0.5 text-[9px]">
              {correlationDir === 'negativa'
                ? 'A mayor estrés, menor nota'
                : correlationDir === 'positiva'
                  ? 'A mayor estrés, mayor nota'
                  : 'Sin tendencia clara'}
            </div>
          </div>

          <div className="border-border/20 bg-background/40 hover:bg-background/60 rounded-xl border p-3 transition-all">
            <div className="text-muted-foreground mb-1 text-[9px] font-black tracking-widest uppercase">
              Fuerza
            </div>
            <div className="text-foreground mt-1 text-sm font-bold">{strengthLabel}</div>
            <div className="text-muted-foreground mt-0.5 text-[9px]">
              {data.data_count} estudiantes analizados
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="text-foreground mb-1.5 flex items-center gap-1.5 text-xs font-black tracking-wider uppercase">
            <Info className="h-3.5 w-3.5 text-amber-500" />
            Conclusión del Análisis:
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">{data.interpretation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
