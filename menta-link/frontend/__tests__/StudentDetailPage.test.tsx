import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StudentDetailPage from '@/app/admin/students/[id]/page';
import React from 'react';

// Mocking dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({ id: '123' }),
}));

vi.mock('@/hooks/useProtected', () => ({
  useProtected: () => ({ user: { role: 'admin' } }),
}));

vi.mock('@/lib/api', () => ({
  apiClient: {
    getStudentDetails: vi.fn().mockResolvedValue({
      full_name: 'John Doe',
      email: 'john@example.com',
      risk_summary: { current_risk_level: 'Low' },
      assessment_responses: [],
      alerts: [],
      recent_checkins: [],
    }),
    getClinicalNotes: vi.fn().mockResolvedValue([]),
    getStudentTrends: vi.fn().mockResolvedValue({
      distribution: {},
      weekly_evolution: [],
      ari_score: 0.2,
      ari_level: 'Bajo Riesgo',
    }),
    getStudentHistory: vi.fn().mockResolvedValue([]),
  },
}));

// Mock Recharts and complex components
vi.mock('@/components/RiskFactorsChart', () => ({ RiskFactorsChart: () => <div>Risk Chart</div> }));
vi.mock('@/components/EmotionalTrendsPanel', () => ({
  EmotionalTrendsPanel: () => <div>Trends Panel</div>,
}));
vi.mock('@/components/layout', () => ({ Layout: ({ children }: any) => <div>{children}</div> }));

describe('StudentDetailPage', () => {
  it('renders student name and tabs after loading', async () => {
    render(<StudentDetailPage />);

    // Wait for data to load (simple way: find name which appears after loading: false)
    const name = await screen.findByText('John Doe');
    expect(name).toBeInTheDocument();

    // Check tabs
    expect(screen.getByText('Resumen Ejecutivo')).toBeInTheDocument();
    expect(screen.getByText('Perfil Analítico IA')).toBeInTheDocument();
    expect(screen.getByText('Línea de Tiempo')).toBeInTheDocument();
  });

  it('switches tabs correctly', async () => {
    render(<StudentDetailPage />);
    await screen.findByText('John Doe');

    // Click the tab trigger
    const analyticalTab = screen.getByRole('tab', { name: /perfil analítico/i });
    fireEvent.pointerDown(analyticalTab, { button: 0 });
    fireEvent.mouseDown(analyticalTab);
    fireEvent.click(analyticalTab);

    // Check if the trends panel is visible
    expect(await screen.findByText('Trends Panel')).toBeInTheDocument();
  });
});
