'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function AuroraBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-background pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-colors duration-1000">
      {/* 
        Implementación fluida usando Framer Motion, inspirada directamente en Aceternity UI.
        Mezclando los gradientes de manera orgánica sin CSS estático.
      */}
      <div className="absolute inset-0 isolate h-full w-full opacity-100 mix-blend-normal dark:opacity-50 dark:mix-blend-screen">
        {/* Orbe Principal (Mint / Amatista) */}
        <motion.div
          animate={{
            x: ['0vw', '-10vw', '10vw', '0vw'],
            y: ['0vh', '10vh', '-10vh', '0vh'],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-[20%] -left-[10%] h-[100vh] w-[80vw] rounded-[100%] blur-[90px]"
          style={{ backgroundColor: 'var(--aurora-1)' }}
        />

        {/* Orbe Secundario (Peach / Coral Vibrante) */}
        <motion.div
          animate={{
            x: ['0vw', '10vw', '-10vw', '0vw'],
            y: ['0vh', '-10vh', '10vh', '0vh'],
            scale: [1, 1.2, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -right-[10%] -bottom-[20%] h-[110vh] w-[80vw] rounded-[100%] blur-[100px]"
          style={{ backgroundColor: 'var(--aurora-2)' }}
        />

        {/* Orbe Terciario de soporte (Terracota) para anclar el centro */}
        <motion.div
          animate={{
            x: ['0vw', '15vw', '-15vw', '0vw'],
            y: ['0vh', '15vh', '-15vh', '0vh'],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-[10%] left-[10%] h-[80vh] w-[80vw] rounded-[100%] opacity-80 blur-[100px] dark:opacity-30"
          style={{ backgroundColor: 'var(--aurora-3)' }}
        />
      </div>
    </div>
  );
}
