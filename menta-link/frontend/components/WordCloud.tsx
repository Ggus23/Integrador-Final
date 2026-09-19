'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { WordCloudItem } from '@/lib/types';

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 42;

const getSentimentColor = (sentiment?: string) => {
  const s = sentiment?.toLowerCase() || '';
  if (s.includes('triste') || s.includes('depre')) return '#EF4444';
  if (s.includes('ansioso') || s.includes('estres') || s.includes('frustrado')) return '#F97316';
  if (s.includes('feliz') || s.includes('motivado')) return '#22C55E';
  return '#B8A075';
};

export function WordCloud({
  items,
  minFontSize = MIN_FONT_SIZE,
  maxFontSize = MAX_FONT_SIZE,
}: {
  items: WordCloudItem[];
  minFontSize?: number;
  maxFontSize?: number;
}) {
  const sizedItems = useMemo(() => {
    if (items.length === 0) return [];
    const frequencies = items.map((item) => item.frequency);
    const min = Math.min(...frequencies);
    const max = Math.max(...frequencies);

    return items.map((item) => {
      let fontSize: number;
      if (max === min) {
        // Todas las palabras tienen la misma frecuencia: tamaño medio
        fontSize = (minFontSize + maxFontSize) / 2;
      } else {
        const t = (item.frequency - min) / (max - min);
        fontSize = minFontSize + t * (maxFontSize - minFontSize);
      }
      return { ...item, fontSize: Math.round(fontSize * 10) / 10 };
    });
  }, [items, minFontSize, maxFontSize]);

  if (sizedItems.length === 0) {
    return (
      <p className="text-muted-foreground text-center text-[10px] italic opacity-50">
        Esperando registros...
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
      {sizedItems.map((item, i) => (
        <motion.span
          key={`${item.word}-${i}`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03, type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.08 }}
          title={`${item.word} — ${item.frequency} repetición(es)`}
          className="cursor-default font-bold tracking-tight transition-colors hover:opacity-80"
          style={{
            fontSize: `${item.fontSize}px`,
            color: item.sentiment ? getSentimentColor(item.sentiment) : '#B8A075',
            textShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}
        >
          {item.word}
        </motion.span>
      ))}
    </div>
  );
}
