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
    <div className="flex flex-col items-center justify-center p-8 bg-card backdrop-blur-md rounded-2xl border border-border/50 shadow-sm">
      <h3 className="text-primary text-lg font-serif mb-2">Respiración 4-7-8</h3>
      <p className="text-muted-foreground text-sm mb-12 text-center max-w-xs">
        {metadata?.description || "Una técnica para reducir la ansiedad rápidamente. Sigue el círculo."}
      </p>

      <div className="relative flex items-center justify-center w-32 h-32 mb-12">
        {/* Animated breathing circle */}
        <motion.div
          animate={isActive ? phase : 'Exhala'}
          variants={circleVariants}
          className="absolute w-24 h-24 bg-primary/20 rounded-full blur-md"
        />
        <motion.div
          animate={isActive ? phase : 'Exhala'}
          variants={circleVariants}
          className="absolute w-20 h-20 bg-gradient-to-tr from-primary to-primary/60 rounded-full opacity-80"
        />
        
        {/* Text inside circle */}
        <div className="absolute z-10 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-primary-foreground font-bold text-sm tracking-widest uppercase shadow-black/20 drop-shadow-md">
            {isActive ? phase : 'Listo'}
          </span>
          {isActive && (
            <span className="text-primary-foreground/90 text-xs font-mono mt-1 shadow-black/20 drop-shadow-md">
              {timer <= 4 ? 4 - timer : timer <= 11 ? 11 - timer : 19 - timer}s
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-colors shadow-sm"
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
          <span>{isActive ? 'Pausar' : 'Comenzar'}</span>
        </button>
        {isActive && (
          <button
            onClick={() => { setIsActive(false); setTimer(0); setPhase('Inhala'); }}
            className="flex items-center gap-2 px-4 py-3 bg-muted/50 hover:bg-muted text-muted-foreground rounded-full transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
