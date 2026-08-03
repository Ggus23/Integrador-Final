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
    <Card className="bg-card border-border/50 space-y-6 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 rounded-xl p-3">
          <BookOpen className="text-primary" size={24} />
        </div>
        <div>
          <h4 className="text-foreground font-medium">Reflexión Guiada</h4>
          <p className="text-muted-foreground text-sm">
            {metadata.description || 'Tómate un momento para escribir lo que sientes.'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-foreground/80 block text-sm font-medium italic">
          "{metadata.prompt || '¿Qué es lo que más te preocupa en este momento y por qué?'}"
        </label>

        <textarea
          className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/50 w-full rounded-xl border p-4 transition-colors focus:ring-1 focus:outline-none"
          placeholder="Escribe aquí tu reflexión..."
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!text.trim() || saved}
            className="flex items-center gap-2 rounded-xl px-6 transition-all"
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
