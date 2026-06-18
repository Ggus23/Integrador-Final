'use client';

import { useEffect, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
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

const getStressZoneColor = (x: number) => {
  if (x <= 13) return '#10b981'; // bajo
  if (x <= 26) return '#f59e0b'; // moderado
  return '#ef4444'; // alto
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const color = getStressZoneColor(payload.x);
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={color} fillOpacity={0.75} stroke="white" strokeWidth={1.5} />
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const stressLevel = data.x <= 13 ? '🟢 Estrés Bajo' : data.x <= 26 ? '🟡 Estrés Moderado' : '🔴 Estrés Alto';
    const gradeLevel = data.y >= 7 ? '📈 Buen rendimiento' : data.y >= 5 ? '⚠️ Rendimiento regular' : '📉 Rendimiento bajo';
    return (
      <div className="bg-card/98 border-border border rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-[280px] animate-in fade-in zoom-in-95 duration-150">
        <p className="text-foreground text-sm font-black truncate mb-1">{data.name}</p>
        <p className="text-[9px] text-muted-foreground font-mono mb-2">ID: {data.id}</p>

        <div className="space-y-2 border-t border-border/20 pt-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-muted-foreground">Nivel de Estrés:</span>
            <span className="text-foreground font-bold text-[11px]">{data.x} / 40</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-muted-foreground">Promedio Acad.:</span>
            <span className="text-foreground font-bold text-[11px]">{data.y.toFixed(1)} / 10</span>
          </div>
          <div className="mt-2 pt-2 border-t border-border/10 space-y-1">
            <p className="text-[10px] font-semibold">{stressLevel}</p>
            <p className="text-[10px] font-semibold">{gradeLevel}</p>
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

  const scatterData = data.points.map((point) => ({
    x: point.stress_score,
    y: point.academic_avg,
    name: point.student_name,
    id: point.student_id,
  }));

  const lineData = data.regression_line
    ? [
        { x: data.regression_line.x_min, y: data.regression_line.y_min },
        { x: data.regression_line.x_max, y: data.regression_line.y_max },
      ]
    : [];

  const rSquaredPct = (data.r_squared * 100).toFixed(1);
  const slope = data.regression_line?.slope;
  const correlationDir = slope !== undefined && slope < -0.05 ? 'negativa' : slope !== undefined && slope > 0.05 ? 'positiva' : 'neutral';

  const strengthLabel =
    data.strength?.toLowerCase().includes('fuerte') || data.strength?.toLowerCase().includes('strong')
      ? 'Fuerte'
      : data.strength?.toLowerCase().includes('modera') || data.strength?.toLowerCase().includes('moderate')
      ? 'Moderada'
      : data.strength?.toLowerCase().includes('débil') || data.strength?.toLowerCase().includes('weak')
      ? 'Débil'
      : data.strength || 'N/A';

  return (
    <Card className="border-border/40 bg-card/30 shadow-2xl backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-foreground font-serif text-xl font-bold flex items-center gap-2">
              📊 Estrés vs. Rendimiento Académico
            </CardTitle>
            <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
              Regresión Lineal Global · {data.data_count} estudiantes
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/30 border border-border/20 rounded-lg px-2 py-1 self-start">
            <Info className="h-3 w-3 shrink-0" />
            <span>Cada punto es un estudiante</span>
          </div>
        </div>

        {/* Cómo leer el gráfico */}
        <div className="mt-3 rounded-xl border border-border/20 bg-background/30 p-3 text-xs text-muted-foreground leading-relaxed">
          <p className="font-bold text-foreground mb-1">¿Cómo leer este gráfico?</p>
          <p>
            El <strong>eje horizontal (X)</strong> muestra el nivel de estrés (0 = sin estrés, 40 = estrés máximo).
            El <strong>eje vertical (Y)</strong> muestra el promedio de calificaciones (0–10).
            La <strong>línea naranja</strong> es la tendencia estadística calculada por regresión lineal:
            si baja de izquierda a derecha, más estrés se asocia con peores notas.
          </p>
        </div>

        {/* Leyenda de colores */}
        <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-muted-foreground">Estrés Bajo (0–13)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-muted-foreground">Estrés Moderado (14–26)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="text-muted-foreground">Estrés Alto (27–40)</span>
          </div>
          {lineData.length === 2 && (
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 bg-orange-400 rounded-full" style={{ background: 'linear-gradient(90deg, #fb923c, #f97316)' }} />
              <span className="text-muted-foreground">Línea de tendencia</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        {/* Gráfico */}
        <div className="h-[300px] sm:h-[380px] w-full rounded-2xl border border-border/20 bg-background/40 p-2 sm:p-4">
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: isMobile ? 10 : 25,
                  bottom: isMobile ? 15 : 45,
                  left: isMobile ? -20 : 5,
                }}
              >
                <defs>
                  <linearGradient id="trendLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#fb923c" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={1} />
                  </linearGradient>
                </defs>

                {/* Zona de nota aprobatoria */}
                <ReferenceArea y1={5} y2={10} fill="#10b981" fillOpacity={0.04} />
                <ReferenceArea y1={0} y2={5} fill="#ef4444" fillOpacity={0.04} />

                {/* Línea de nota mínima aprobatoria */}
                <ReferenceLine
                  y={5}
                  stroke="#10b981"
                  strokeDasharray="6 3"
                  strokeOpacity={0.5}
                  strokeWidth={1.5}
                  label={isMobile ? undefined : { value: 'Nota mínima (5.0)', position: 'right', fontSize: 9, fill: '#10b981' }}
                />

                {/* Línea zona de estrés alto */}
                <ReferenceLine
                  x={26}
                  stroke="#ef4444"
                  strokeDasharray="6 3"
                  strokeOpacity={0.4}
                  strokeWidth={1.5}
                  label={isMobile ? undefined : { value: 'Zona crítica', position: 'top', fontSize: 9, fill: '#ef4444' }}
                />

                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Estrés"
                  label={
                    isMobile
                      ? undefined
                      : { value: 'Nivel de Estrés PSS-10 (0–40)', position: 'bottom', offset: 15, fontSize: 11, fill: 'var(--muted-foreground)' }
                  }
                  domain={[0, 40]}
                  ticks={[0, 10, 13, 20, 26, 30, 40]}
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Promedio"
                  label={
                    isMobile
                      ? undefined
                      : { value: 'Promedio de Calificaciones (0–10)', angle: -90, position: 'insideLeft', offset: -5, fontSize: 11, fill: 'var(--muted-foreground)' }
                  }
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 5, 6, 8, 10]}
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3', stroke: 'var(--muted-foreground)', strokeOpacity: 0.4 }} content={<CustomTooltip />} />
                <Scatter
                  name="Estudiantes"
                  data={scatterData}
                  shape={<CustomDot />}
                  className="cursor-pointer"
                />
                {lineData.length === 2 && (
                  <Line
                    type="linear"
                    name="Tendencia"
                    data={lineData}
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={false}
                    isAnimationActive={false}
                    strokeDasharray="0"
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground text-sm italic gap-2">
              <span className="text-3xl">📭</span>
              <span>No hay suficientes datos para mostrar el gráfico</span>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border/20 bg-background/40 p-3 hover:bg-background/60 transition-all">
            <div className="text-muted-foreground text-[9px] font-black tracking-widest uppercase mb-1">Ecuación</div>
            <div className="font-mono text-sm font-bold text-foreground truncate">{data.equation}</div>
            <div className="text-muted-foreground text-[9px] mt-0.5">Fórmula de la línea</div>
          </div>

          <div className="rounded-xl border border-border/20 bg-background/40 p-3 hover:bg-background/60 transition-all">
            <div className="text-muted-foreground text-[9px] font-black tracking-widest uppercase mb-1">R² — Precisión</div>
            <div className="text-lg font-bold text-foreground">{rSquaredPct}%</div>
            <div className="text-muted-foreground text-[9px] mt-0.5">
              {parseFloat(rSquaredPct) >= 50 ? 'El modelo explica bien los datos' : 'Correlación débil'}
            </div>
          </div>

          <div className="rounded-xl border border-border/20 bg-background/40 p-3 hover:bg-background/60 transition-all">
            <div className="text-muted-foreground text-[9px] font-black tracking-widest uppercase mb-1">Dirección</div>
            <div className="flex items-center gap-1.5 mt-1">
              {getCorrelationIcon(slope)}
              <span className="text-sm font-bold text-foreground capitalize">
                {correlationDir === 'negativa' ? 'Negativa' : correlationDir === 'positiva' ? 'Positiva' : 'Neutra'}
              </span>
            </div>
            <div className="text-muted-foreground text-[9px] mt-0.5">
              {correlationDir === 'negativa' ? '↑ Estrés → ↓ Notas' : correlationDir === 'positiva' ? '↑ Estrés → ↑ Notas' : 'Sin tendencia clara'}
            </div>
          </div>

          <div className="rounded-xl border border-border/20 bg-background/40 p-3 hover:bg-background/60 transition-all">
            <div className="text-muted-foreground text-[9px] font-black tracking-widest uppercase mb-1">Fuerza</div>
            <div className="text-sm font-bold text-foreground mt-1">{strengthLabel}</div>
            <div className="text-muted-foreground text-[9px] mt-0.5">{data.data_count} estudiantes analizados</div>
          </div>
        </div>

        {/* Interpretación */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="text-foreground text-xs font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-amber-500" />
            Conclusión del Análisis:
          </div>
          <p className="text-muted-foreground leading-relaxed text-xs">{data.interpretation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
