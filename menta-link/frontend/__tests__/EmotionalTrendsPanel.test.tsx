import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EmotionalTrendsPanel } from '@/components/EmotionalTrendsPanel';
import React from 'react';

// Mock Recharts to avoid layout/path issues in JSDOM
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
}));

// Mock the child component to simplify
vi.mock('@/components/EmotionalEvolutionChart', () => ({
  EmotionalEvolutionChart: () => <div data-testid="evolution-chart">Evolution Chart</div>,
}));

const mockData = {
  distribution: { feliz: 40, triste: 30, ansioso: 30 },
  weekly_evolution: [{ week: 'S-1', avg_wellbeing: 4.5, emotion: 'feliz' }],
  ari_score: 0.45,
  ari_level: 'Riesgo Medio',
};

describe('EmotionalTrendsPanel', () => {
  it('renders Wellness Index and level correctly', () => {
    render(<EmotionalTrendsPanel data={mockData} />);

    expect(screen.getByText('Índice de Equilibrio Estudiantil')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('Atención moderada')).toBeInTheDocument();
  });

  it('renders the distribution chart container', () => {
    render(<EmotionalTrendsPanel data={mockData} />);

    expect(screen.getByText('Distribución Emocional Dominante')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders the evolution chart section', () => {
    render(<EmotionalTrendsPanel data={mockData} />);

    expect(screen.getByText('Evolución del Bienestar Estudiantil')).toBeInTheDocument();
    expect(screen.getByTestId('evolution-chart')).toBeInTheDocument();
  });
});
