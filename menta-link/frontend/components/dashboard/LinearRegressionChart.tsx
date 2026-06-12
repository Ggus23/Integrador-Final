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
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card/95 border-border border rounded-2xl p-4 shadow-xl backdrop-blur-md max-w-[280px] animate-in fade-in zoom-in-95 duration-150">
        <p className="text-foreground text-sm font-black truncate">{data.name}</p>
        <p className="text-[9px] text-muted-foreground font-mono">ID: {data.id}</p>
        
        <div className="mt-2 text-xs text-muted-foreground space-y-1 border-t border-border/10 pt-2">
          <p>
            Nivel de Estrés (PSS): <span className="text-foreground font-bold">{data.x}</span> / 40
          </p>
          <p>
            Promedio de Calificaciones: <span className="text-foreground font-bold">{data.y.toFixed(2)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
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
      console.error('Error fetching regression data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex h-[400px] items-center justify-center">
          <div className="text-muted-foreground flex flex-col items-center gap-2">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            <span className="text-xs font-semibold">Cargando análisis de correlación...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex h-[400px] items-center justify-center">
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

  // Línea de regresión
  const lineData = data.regression_line
    ? [
        {
          x: data.regression_line.x_min,
          y: data.regression_line.y_min,
        },
        {
          x: data.regression_line.x_max,
          y: data.regression_line.y_max,
        },
      ]
    : [];

  return (
    <Card className="border-border/40 bg-card/30 shadow-2xl backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-4">
        <div className="space-y-1">
          <CardTitle className="text-foreground font-serif text-xl font-bold flex items-center gap-2">
            <span>📊 Correlación: Estrés vs Desempeño</span>
          </CardTitle>
          <p className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
            Análisis de Regresión Lineal Global
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Gráfico */}
        <div className="h-[280px] sm:h-[400px] w-full rounded-2xl border border-border/20 bg-background/40 p-2 sm:p-4">
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ 
                  top: 20, 
                  right: isMobile ? 10 : 20, 
                  bottom: isMobile ? 10 : 40, 
                  left: isMobile ? -25 : 10 
                }}
                data={scatterData}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Estrés"
                  label={isMobile ? undefined : { value: 'Nivel de Estrés (0-40)', position: 'bottom', offset: 10 }}
                  domain={[0, 40]}
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Promedio"
                  label={isMobile ? undefined : { value: 'Promedio de Calificaciones', angle: -90, position: 'insideLeft', offset: -10 }}
                  domain={[0, 10]}
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: 'var(--muted-foreground)', strokeOpacity: 0.5 }}
                  content={<CustomTooltip />}
                />
                <Scatter
                  name="Estudiantes"
                  data={scatterData}
                  fill="var(--primary)"
                  fillOpacity={0.65}
                  className="cursor-pointer"
                />
                {lineData.length === 2 && (
                  <Line
                    type="linear"
                    name="Línea de Regresión"
                    data={lineData}
                    stroke="var(--support-high)"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm italic">
              No hay suficientes datos para mostrar el gráfico
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/20 bg-background/30 p-4 transition-all hover:bg-background/50">
              <div className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">Ecuación</div>
              <div className="font-mono text-base font-bold mt-1 text-foreground">{data.equation}</div>
            </div>
            <div className="rounded-xl border border-border/20 bg-background/30 p-4 transition-all hover:bg-background/50">
              <div className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">R² (Explicación)</div>
              <div className="text-lg font-bold mt-1 text-foreground">
                {(data.r_squared * 100).toFixed(1)}%
              </div>
              <div className="text-muted-foreground text-[9px] mt-0.5">
                Varianza explicada por el modelo
              </div>
            </div>
            <div className="rounded-xl border border-border/20 bg-background/30 p-4 transition-all hover:bg-background/50">
              <div className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                Muestra (Estudiantes)
              </div>
              <div className="text-lg font-bold mt-1 text-foreground">{data.data_count}</div>
              <div className="text-muted-foreground text-[9px] mt-0.5">
                Con perfil y notas registradas
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-support-medium/20 bg-support-medium/5 p-4">
            <div className="text-foreground text-xs font-black uppercase tracking-wider mb-1">Análisis Clínico / Académico:</div>
            <p className="text-muted-foreground leading-relaxed text-xs">
              {data.interpretation}
            </p>
          </div>

          <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 text-[11px] border-t border-border/10 pt-3">
            <p>
              <strong>Dirección de Correlación:</strong> <span className="text-foreground font-semibold">{data.correlation.charAt(0).toUpperCase() + data.correlation.slice(1)}</span>
            </p>
            <p>
              <strong>Fuerza de Asociación:</strong> <span className="text-foreground font-semibold">{data.strength.charAt(0).toUpperCase() + data.strength.slice(1)}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
