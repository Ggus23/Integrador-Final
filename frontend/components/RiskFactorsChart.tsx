'use client';

import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface RiskFactorsChartProps {
    factors: Record<string, number>;
}

const LABELS: Record<string, string> = {
    pss_score: 'Nivel de Estrés',
    checkin_avg: 'Estado de Ánimo',
    bad_days_freq: 'Días Bajos',
    study_pressure: 'Presión Académica',
};

export function RiskFactorsChart({ factors }: RiskFactorsChartProps) {
    if (!factors || Object.keys(factors).length === 0) {
        return <div className="text-gray-500 text-sm">No hay datos de factores de riesgo.</div>;
    }

    // Transform data for Recharts
    const data = Object.entries(factors).map(([key, value]) => ({
        name: LABELS[key] || key,
        impact: value,
        originalKey: key
    })).sort((a, b) => b.impact - a.impact);

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 'auto']} hide />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                        formatter={(value: number) => [value.toFixed(4), 'Importancia']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar
                        dataKey="impact"
                        fill="#0d9488"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
