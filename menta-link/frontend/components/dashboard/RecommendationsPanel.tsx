'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lightbulb, Brain, Heart, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RecommendationsPanelProps {
  recommendations: any[];
  completedCount: number;
  totalAssessments?: number;
}

export const RecommendationsPanel = ({
  recommendations,
  completedCount,
  totalAssessments = 1,
}: RecommendationsPanelProps) => {
  const isLocked = recommendations.length === 0;
  const progressValue = isLocked ? 0 : 100;

  const icons = [
    <Sparkles key="1" className="h-5 w-5 text-yellow-500" />,
    <Lightbulb key="2" className="h-5 w-5 text-blue-500" />,
    <Brain key="3" className="h-5 w-5 text-purple-500" />,
    <Heart key="4" className="h-5 w-5 text-rose-500" />,
  ];

  if (isLocked) {
    return (
      <Card className="bg-muted/30 flex flex-col items-center justify-center space-y-6 border-2 border-dashed p-8 text-center">
        <div className="relative">
          <div className="from-primary to-accent absolute -inset-1 animate-pulse rounded-full bg-gradient-to-r opacity-25 blur"></div>
          <div className="bg-background relative rounded-full border p-4 shadow-sm">
            <Lock className="text-muted-foreground h-8 w-8" />
          </div>
        </div>

        <div className="max-w-md space-y-2">
          <h3 className="font-serif text-xl font-bold">Recomendaciones Bloqueadas</h3>
          <p className="text-muted-foreground text-sm">
            Para brindarte recomendaciones personalizadas, nuestro Asistente de Bienestar necesita
            que completes al menos la evaluación de estrés (PSS-10).
          </p>
        </div>

        <div className="w-full max-w-xs space-y-2">
          <div className="text-muted-foreground flex justify-between text-xs font-medium tracking-wider uppercase">
            <span>Estado</span>
            <span>Evaluación PSS-10 requerida</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
      </Card>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded-lg p-2">
            <Sparkles className="text-primary h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold">Tu Plan de Bienestar</h2>
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-primary text-xs font-normal"
            >
              Generado por IA • Basado en PSS-10
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {recommendations.map((rec, index) => (
          <Card
            key={index}
            className="group border-primary/10 from-card to-primary/5 relative overflow-hidden bg-gradient-to-br p-5 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 transition-opacity group-hover:opacity-20">
              {icons[index % icons.length]}
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">
                <div className="bg-background group-hover:border-primary/30 rounded-full border p-2 shadow-sm transition-colors">
                  {icons[index % icons.length]}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-foreground text-sm leading-relaxed lg:text-base">
                  {typeof rec === 'string' ? rec : (rec.metadata?.description || rec.metadata?.title || 'Sugerencia de Bienestar')}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-muted-foreground flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs italic">
        <AlertCircle className="h-4 w-4 shrink-0 text-blue-500" />
        <p>
          Estas sugerencias se basan en tus resultados de la escala PSS-10 y tu contexto académico
          actual. Recuerda que estas pautas son preventivas y no sustituyen el consejo médico
          profesional.
        </p>
      </div>
    </div>
  );
};
