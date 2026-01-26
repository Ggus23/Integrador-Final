'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Checkin } from '@/lib/types';

export default function CheckinsPage() {
  const { user } = useProtected();
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mood_score: 3,
    note: '',
  });

  useEffect(() => {
    if (!user) return;

    const fetchCheckins = async () => {
      try {
        const data = await apiClient.getMyCheckins();
        setCheckins(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load check-ins');
      } finally {
        setLoading(false);
      }
    };

    fetchCheckins();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newCheckin = await apiClient.createCheckin(formData);
      setCheckins([newCheckin, ...checkins]);
      setFormData({
        mood_score: 3,
        note: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit check-in');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-foreground font-serif text-4xl font-bold">Emotional Check-ins</h1>
          <p className="text-muted-foreground mt-2">Quick daily check-in to track your wellbeing</p>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded border p-4 text-sm">
            {error}
          </div>
        )}

        <Card className="border-border bg-card p-8">
          <h2 className="text-foreground font-serif text-xl font-bold">Check-in de Hoy</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-foreground block text-sm font-medium">
                Estado de Ánimo: {formData.mood_score}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.mood_score}
                onChange={(e) =>
                  setFormData({ ...formData, mood_score: Number.parseInt(e.target.value) })
                }
                className="form-range text-primary w-full"
              />
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>Muy Mal</span>
                <span>Muy Bien</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-foreground block text-sm font-medium">Notas (opcional)</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="¿Algo más que quieras compartir?"
                className="border-input bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 shadow-sm outline-none focus:ring-1"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="from-primary to-accent w-full bg-gradient-to-r text-white shadow-md hover:opacity-90"
            >
              {submitting ? 'Enviando...' : 'Enviar Check-in'}
            </Button>
          </form>
        </Card>

        {/* Check-ins History */}
        <div className="space-y-4">
          <h2 className="text-foreground font-serif text-xl font-bold">Historial Reciente</h2>
          {checkins.length === 0 ? (
            <p className="text-muted-foreground">
              No hay check-ins todavía. ¡Comienza completando uno arriba!
            </p>
          ) : (
            <div className="space-y-3">
              {checkins.map((checkin) => (
                <Card
                  key={checkin.id}
                  className="border-border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-full space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground font-medium">
                          Ánimo: {checkin.mood_score}/5
                        </span>
                        <p className="text-muted-foreground text-xs">
                          {new Date(checkin.created_at).toLocaleString()}
                        </p>
                      </div>
                      {checkin.note && (
                        <p className="text-muted-foreground bg-muted/50 mt-2 rounded-md p-2 text-sm">
                          {checkin.note}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
