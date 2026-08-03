import React from 'react';
import { BreathingIntervention } from './BreathingIntervention';
import { CognitiveReframing } from './CognitiveReframing';
import { JournalingIntervention } from './JournalingIntervention';
import { AlertCircle } from 'lucide-react';

export type ActionType =
  | 'BREATHING_EXERCISE'
  | 'COGNITIVE_REFRAME'
  | 'JOURNALING_PROMPT'
  | 'READ_MORE';

interface ActionRegistryProps {
  actionType: ActionType | string;
  metadata?: any;
}

export function ActionRegistry({ actionType, metadata }: ActionRegistryProps) {
  // Patrón Registry: mapea IDs de acción a componentes UI específicos
  const REGISTRY: Record<string, React.FC<any>> = {
    BREATHING_EXERCISE: BreathingIntervention,
    COGNITIVE_REFRAME: CognitiveReframing,
    JOURNALING_PROMPT: JournalingIntervention,
  };

  const InterventionComponent = REGISTRY[actionType];

  if (InterventionComponent) {
    return <InterventionComponent metadata={metadata} />;
  }

  // Fallback (RF-07)
  return (
    <div className="bg-primary/5 border-primary/10 flex items-center gap-4 rounded-2xl border p-6 shadow-sm">
      <div className="bg-primary/10 shrink-0 rounded-full p-3">
        <AlertCircle className="text-primary" size={24} />
      </div>
      <div>
        <h4 className="text-foreground mb-1 font-medium">
          {metadata?.title || 'Sugerencia de Bienestar'}
        </h4>
        <p className="text-muted-foreground text-sm">
          {metadata?.description || 'Te recomendamos aplicar este consejo durante el día.'}
        </p>
        {metadata?.link && (
          <a
            href={metadata.link}
            className="text-primary mt-3 inline-block text-sm font-bold hover:underline"
          >
            Leer más
          </a>
        )}
      </div>
    </div>
  );
}
