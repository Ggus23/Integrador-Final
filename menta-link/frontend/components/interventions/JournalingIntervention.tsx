'use client';
import React, { useState } from 'react';
import { BookOpen, Send, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface JournalingInterventionProps {
  metadata: {
    prompt?: string;
    description?: string;
  };
}

export function JournalingIntervention({ metadata }: JournalingInterventionProps) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (text.trim()) {
      // Aquí se conectaría con el backend para guardar la reflexión en el diario
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <Card className="p-6 bg-card border-border/50 shadow-sm space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-xl">
          <BookOpen className="text-primary" size={24} />
        </div>
        <div>
          <h4 className="text-foreground font-medium">Reflexión Guiada</h4>
          <p className="text-muted-foreground text-sm">{metadata.description || 'Tómate un momento para escribir lo que sientes.'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-foreground/80 text-sm font-medium italic block">
          "{metadata.prompt || '¿Qué es lo que más te preocupa en este momento y por qué?'}"
        </label>
        
        <textarea
          className="w-full bg-background border border-border/50 rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
          placeholder="Escribe aquí tu reflexión..."
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={!text.trim() || saved}
            className="rounded-xl px-6 flex items-center gap-2 transition-all"
          >
            {saved ? (
              <>
                <CheckCircle2 size={18} />
                Guardado
              </>
            ) : (
              <>
                <Send size={18} />
                Guardar Reflexión
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
