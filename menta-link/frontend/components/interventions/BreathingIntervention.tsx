import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function BreathingIntervention({ metadata }: { metadata?: any }) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'Inhala' | 'Mantén' | 'Exhala'>('Inhala');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          const next = prev + 1;
          if (next <= 4) setPhase('Inhala');
          else if (next <= 11) setPhase('Mantén');
          else if (next <= 19) setPhase('Exhala');
          else return 0; // Restart cycle
          return next;
        });
      }, 1000);
    } else {
      setTimer(0);
      setPhase('Inhala');
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const circleVariants: Variants = {
    Inhala: { scale: 1.5, transition: { duration: 4, ease: 'linear' } },
    Mantén: { scale: 1.5, transition: { duration: 7, ease: 'linear' } },
    Exhala: { scale: 1, transition: { duration: 8, ease: 'linear' } },
  };

  return (
    <div className="bg-card border-border/50 flex flex-col items-center justify-center rounded-2xl border p-8 shadow-sm backdrop-blur-md">
      <h3 className="text-primary mb-2 font-serif text-lg">Respiración 4-7-8</h3>
      <p className="text-muted-foreground mb-12 max-w-xs text-center text-sm">
        {metadata?.description ||
          'Una técnica para reducir la ansiedad rápidamente. Sigue el círculo.'}
      </p>

      <div className="relative mb-12 flex h-32 w-32 items-center justify-center">
        {/* Animated breathing circle */}
        <motion.div
          animate={isActive ? phase : 'Exhala'}
          variants={circleVariants}
          className="bg-primary/20 absolute h-24 w-24 rounded-full blur-md"
        />
        <motion.div
          animate={isActive ? phase : 'Exhala'}
          variants={circleVariants}
          className="from-primary to-primary/60 absolute h-20 w-20 rounded-full bg-gradient-to-tr opacity-80"
        />

        {/* Text inside circle */}
        <div className="pointer-events-none absolute z-10 flex flex-col items-center justify-center">
          <span className="text-primary-foreground text-sm font-bold tracking-widest uppercase shadow-black/20 drop-shadow-md">
            {isActive ? phase : 'Listo'}
          </span>
          {isActive && (
            <span className="text-primary-foreground/90 mt-1 font-mono text-xs shadow-black/20 drop-shadow-md">
              {timer <= 4 ? 4 - timer : timer <= 11 ? 11 - timer : 19 - timer}s
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsActive(!isActive)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 rounded-full px-6 py-3 shadow-sm transition-colors"
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
          <span>{isActive ? 'Pausar' : 'Comenzar'}</span>
        </button>
        {isActive && (
          <button
            onClick={() => {
              setIsActive(false);
              setTimer(0);
              setPhase('Inhala');
            }}
            className="bg-muted/50 hover:bg-muted text-muted-foreground flex items-center gap-2 rounded-full px-4 py-3 transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
