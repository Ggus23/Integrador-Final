'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout';
import { useProtected } from '@/hooks/useProtected';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Hourglass, AlertCircle, ArrowRight, X } from 'lucide-react';
import type { RiskAlert } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function AlertsPage() {
  const { user } = useProtected();
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'student') return;

    const fetchAlerts = async () => {
      try {
        const data = await apiClient.getMyAlerts();
        setAlerts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">Loading...</div>
      </Layout>
    );
  }

  const getAlertConfig = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
      case 'bajo':
        return {
          color: 'bg-support-low',
          bg: 'rgba(122, 158, 126, 0.15)',
          icon: <Sprout className="h-5 w-5" />,
          action: 'Ver Progreso',
          pulse: false,
        };
      case 'medium':
      case 'medio':
        return {
          color: 'bg-amber-500',
          bg: 'rgba(212, 137, 74, 0.15)',
          icon: <Hourglass className="h-5 w-5" />,
          action: 'Revisar Sugerencia',
          pulse: false,
        };
      case 'high':
      case 'alto':
        return {
          color: 'bg-risk-high',
          bg: 'rgba(185, 64, 64, 0.2)',
          icon: <AlertCircle className="h-5 w-5" />,
          action: 'Practicar Calma',
          pulse: true,
        };
      default:
        return {
          color: 'bg-muted',
          bg: 'rgba(0,0,0,0.05)',
          icon: <AlertCircle className="h-5 w-5" />,
          action: 'Ver Más',
          pulse: false,
        };
    }
  };

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-foreground font-serif text-4xl font-bold">
            Sugerencias de Bienestar
          </h1>
          <p className="text-muted-foreground mt-2">
            Pequeños recordatorios para cuidar tu equilibrio y salud emocional.
          </p>
        </div>

        {error && (
          <div className="border-destructive bg-destructive/10 text-destructive rounded border p-4 text-sm">
            {error}
          </div>
        )}

        {alerts.length === 0 ? (
          <Card className="border-border bg-card animate-fade-in p-8 text-center shadow-sm">
            <p className="text-muted-foreground">
              Todo parece estar en equilibrio. ¡Sigue cuidando de ti!
            </p>
          </Card>
        ) : (
          <motion.div layout className="space-y-6">
            <AnimatePresence mode="popLayout">
              {alerts.map((alert) => {
                const config = getAlertConfig(alert.severity);
                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <Card className="border-border/40 bg-card/75 relative overflow-hidden p-0 shadow-xl backdrop-blur-md">
                      {/* Aurora Background Internal */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
                        <motion.div
                          animate={
                            config.pulse
                              ? {
                                  scale: [1, 1.2, 1],
                                  opacity: [0.3, 0.6, 0.3],
                                }
                              : {}
                          }
                          transition={{ duration: 4, repeat: Infinity }}
                          className={cn(
                            'absolute -top-20 -right-20 h-64 w-64 rounded-full blur-[80px]',
                            config.color
                          )}
                        />
                      </div>

                      <div className="relative z-10 p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className={cn(
                              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg',
                              config.color
                            )}
                          >
                            {config.icon}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'text-[10px] font-black tracking-widest uppercase opacity-60'
                                )}
                              >
                                {alert.severity.toUpperCase() === 'HIGH'
                                  ? 'Acción Requerida'
                                  : 'Sugerencia'}
                              </span>
                              <span className="text-muted-foreground text-[10px] font-bold">
                                •{' '}
                                {new Date(alert.created_at).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                            <h3 className="text-foreground mt-1 text-lg leading-tight font-bold">
                              {alert.message}
                            </h3>

                            <div className="mt-6 flex items-center justify-between gap-4">
                              <Button
                                size="sm"
                                className={cn(
                                  'h-10 rounded-xl px-4 font-bold shadow-md transition-all hover:scale-105 active:scale-95',
                                  config.color
                                )}
                              >
                                {config.action} <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>

                              <button
                                onClick={() => dismissAlert(alert.id)}
                                className="text-muted-foreground hover:bg-muted/50 rounded-lg p-2 transition-colors"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
