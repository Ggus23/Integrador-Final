'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Lightbulb,
    Brain,
    Heart,
    Lock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RecommendationsPanelProps {
    recommendations: string[];
    completedCount: number;
    totalAssessments?: number;
}

export const RecommendationsPanel = ({
    recommendations,
    completedCount,
    totalAssessments = 1
}: RecommendationsPanelProps) => {
    const isLocked = recommendations.length === 0;
    const progressValue = isLocked ? 0 : 100;

    const icons = [
        <Sparkles key="1" className="w-5 h-5 text-yellow-500" />,
        <Lightbulb key="2" className="w-5 h-5 text-blue-500" />,
        <Brain key="3" className="w-5 h-5 text-purple-500" />,
        <Heart key="4" className="w-5 h-5 text-rose-500" />,
    ];

    if (isLocked) {
        return (
            <Card className="p-8 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-6 bg-muted/30">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-25 animate-pulse"></div>
                    <div className="relative bg-background p-4 rounded-full border shadow-sm">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                    </div>
                </div>

                <div className="max-w-md space-y-2">
                    <h3 className="text-xl font-bold font-serif">Recomendaciones Bloqueadas</h3>
                    <p className="text-muted-foreground text-sm">
                        Para brindarte recomendaciones personalizadas, nuestro Asistente de Bienestar necesita que completes al menos la evaluación de estrés (PSS-10).
                    </p>
                </div>

                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        <span>Estado</span>
                        <span>Evaluación PSS-10 requerida</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold font-serif">Tu Plan de Bienestar</h2>
                        <Badge variant="outline" className="text-xs font-normal border-primary/20 bg-primary/5 text-primary">
                            Generado por IA • Basado en PSS-10
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {recommendations.map((rec, index) => (
                    <Card
                        key={index}
                        className="group relative overflow-hidden p-5 transition-all hover:shadow-xl hover:-translate-y-1 border-primary/10 bg-gradient-to-br from-card to-primary/5"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            {icons[index % icons.length]}
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex-shrink-0">
                                <div className="p-2 bg-background rounded-full border shadow-sm group-hover:border-primary/30 transition-colors">
                                    {icons[index % icons.length]}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-foreground leading-relaxed text-sm lg:text-base">
                                    {rec}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs text-muted-foreground italic">
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0" />
                <p>
                    Estas sugerencias se basan en tus resultados de la escala PSS-10 y tu contexto académico actual.
                    Recuerda que estas pautas son preventivas y no sustituyen el consejo médico profesional.
                </p>
            </div>
        </div>
    );

};
