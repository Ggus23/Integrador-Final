'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { WordCloudItem } from '@/lib/types';

const FONT_FAMILY = '"DM Sans", sans-serif';
const FONT_WEIGHT = 700;
const MIN_FONT_SIZE = 18;
const MAX_FONT_SIZE = 64;
const GAP = 3;
const GRID_CELL = 8;
const AREA_PADDING = 10;
const AREA_HEIGHT = 460;
const MAX_STEPS = 12000;

type PlacedWord = {
  key: string;
  word: string;
  fontSize: number;
  toneClass: string;
  isDominant: boolean;
  natural: { width: number; height: number };
  box: { width: number; height: number };
  center: { x: number; y: number };
};

type CloudPlacement = {
  words: PlacedWord[];
  height: number;
};

function toneForWeight(weight: number, isDominant: boolean): string {
  if (isDominant) return 'text-primary';
  if (weight >= 60) return 'text-foreground';
  if (weight >= 30) return 'text-foreground/75';
  return 'text-muted-foreground';
}

function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function measureWord(text: string, fontSize: number): { width: number; height: number } {
  if (typeof document === 'undefined') {
    return { width: fontSize * text.length * 0.6, height: fontSize * 1.12 };
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { width: fontSize * text.length * 0.6, height: fontSize * 1.12 };
  ctx.font = `${FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`;
  return { width: ctx.measureText(text).width, height: fontSize * 1.12 };
}

function buildCloud(
  items: WordCloudItem[],
  width: number,
  minFontSize: number,
  maxFontSize: number
): CloudPlacement {
  const areaWidth = Math.max(width - AREA_PADDING * 2, 120);

  const random = mulberry32(
    hashString(items.map((i) => `${i.word}:${i.frequency}`).join('|') + `:${areaWidth}`)
  );

  const frequencies = items.map((i) => i.frequency);
  const minF = Math.min(...frequencies);
  const maxF = Math.max(...frequencies);
  const range = maxF - minF;

  const getWeight = (item: WordCloudItem): number => {
    if (typeof item.weight === 'number' && item.weight > 0) return item.weight;
    if (range === 0) return 50;
    return ((item.frequency - minF) / range) * 100;
  };

  const weights = items.map(getWeight);
  const dominantWeight = Math.max(...weights);

  const nodes = items.map((item, idx) => {
    const word = item.word;
    const weight = weights[idx];
    const isDominant = item.is_dominant === true || weight === dominantWeight;

    let fontSize: number;
    if (range === 0 && typeof item.weight !== 'number') fontSize = (minFontSize + maxFontSize) / 2;
    else fontSize = minFontSize + (weight / 100) * (maxFontSize - minFontSize);

    const natural = measureWord(word, fontSize);
    const box = { width: natural.width + GAP, height: natural.height + GAP };

    return {
      key: `${word}-${idx}`,
      word,
      isDominant,
      fontSize,
      natural,
      box,
      toneClass: toneForWeight(weight, isDominant),
    };
  });

  nodes.sort((a, b) => b.box.width * b.box.height - a.box.width * a.box.height);

  const gridW = Math.ceil(areaWidth / GRID_CELL);
  const gridH = Math.ceil(AREA_HEIGHT / GRID_CELL);
  const grid = new Uint8Array(gridW * gridH);

  const cx = areaWidth / 2;
  const cy = AREA_HEIGHT / 2;
  const words: PlacedWord[] = [];
  let maxBottom = 0;

  const fits = (x: number, y: number, w: number, h: number) => {
    const x0 = Math.round(x - w / 2);
    const y0 = Math.round(y - h / 2);
    const x1 = Math.round(x + w / 2);
    const y1 = Math.round(y + h / 2);
    if (x0 < 0 || y0 < 0 || x1 > areaWidth || y1 > AREA_HEIGHT) return false;
    const c0 = Math.floor(x0 / GRID_CELL);
    const r0 = Math.floor(y0 / GRID_CELL);
    const c1 = Math.floor((x1 - 1) / GRID_CELL);
    const r1 = Math.floor((y1 - 1) / GRID_CELL);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (grid[r * gridW + c]) return false;
      }
    }
    return true;
  };

  const mark = (x: number, y: number, w: number, h: number) => {
    const x0 = Math.round(x - w / 2);
    const y0 = Math.round(y - h / 2);
    const x1 = Math.round(x + w / 2);
    const y1 = Math.round(y + h / 2);
    const c0 = Math.floor(x0 / GRID_CELL);
    const r0 = Math.floor(y0 / GRID_CELL);
    const c1 = Math.floor((x1 - 1) / GRID_CELL);
    const r1 = Math.floor((y1 - 1) / GRID_CELL);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        grid[r * gridW + c] = 1;
      }
    }
  };

  for (const node of nodes) {
    const startAngle = random() * Math.PI * 2;
    let placed = false;

    for (let i = 0; i < MAX_STEPS && !placed; i++) {
      const r = 1.5 + Math.sqrt(i) * 3.4;
      const a = startAngle + i * 0.24;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;

      if (fits(x, y, node.box.width, node.box.height)) {
        mark(x, y, node.box.width, node.box.height);
        words.push({
          key: node.key,
          word: node.word,
          fontSize: node.fontSize,
          toneClass: node.toneClass,
          isDominant: node.isDominant,
          natural: node.natural,
          box: node.box,
          center: { x, y },
        });
        maxBottom = Math.max(maxBottom, y + node.box.height / 2);
        placed = true;
      }
    }
  }

  return { words, height: Math.max(200, maxBottom + 14) };
}

export function WordCloud({
  items,
  minFontSize = MIN_FONT_SIZE,
  maxFontSize = MAX_FONT_SIZE,
}: {
  items: WordCloudItem[];
  minFontSize?: number;
  maxFontSize?: number;
}) {
  const [width, setWidth] = useState(0);
  const [cloud, setCloud] = useState<CloudPlacement>({ words: [], height: 200 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const apply = () =>
      setWidth((prev) =>
        prev === Math.floor(el.getBoundingClientRect().width)
          ? prev
          : Math.floor(el.getBoundingClientRect().width)
      );
    if (typeof ResizeObserver === 'undefined') {
      apply();
      return;
    }
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0]?.contentRect.width ?? 0);
      if (w > 0) setWidth((prev) => (prev === w ? prev : w));
    });
    ro.observe(el);
    apply();
    return () => ro.disconnect();
  }, []);

  const seedKey = useMemo(() => items.map((i) => `${i.word}:${i.frequency}`).join('|'), [items]);

  useEffect(() => {
    if (width <= 0 || items.length === 0) return;
    let disposed = false;
    const run = () => {
      if (!disposed) setCloud(buildCloud(items, width, minFontSize, maxFontSize));
    };
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    if (fonts && typeof fonts.ready?.then === 'function') {
      fonts.ready.then(run).catch(run);
    } else {
      run();
    }
    return () => {
      disposed = true;
    };
  }, [items, seedKey, width, minFontSize, maxFontSize]);

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center text-[10px] italic opacity-50">
        Esperando registros...
      </p>
    );
  }

  return (
    <div ref={wrapperRef} className="w-full">
      <div className="relative w-full" style={{ height: cloud.height }}>
        {cloud.words.map((w, i) => (
          <motion.div
            key={w.key}
            className="absolute"
            style={{ left: w.center.x, top: w.center.y, zIndex: w.isDominant ? 10 : 1 }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02, type: 'spring', stiffness: 260, damping: 22 }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: w.natural.width,
                height: w.natural.height,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span
                className={`cursor-default font-bold tracking-tight whitespace-nowrap transition-opacity hover:opacity-80 ${w.toneClass}`}
                title={`${w.word} — ${items.find((it) => it.word === w.word)?.frequency ?? 0} repetición(es)`}
                style={{
                  fontSize: `${w.fontSize}px`,
                  lineHeight: 1.12,
                  fontWeight: w.isDominant ? 900 : FONT_WEIGHT,
                  fontFamily: FONT_FAMILY,
                  textShadow: w.isDominant
                    ? '0 0 26px rgba(224, 154, 112, 0.4), 0 2px 6px rgba(0,0,0,0.25)'
                    : undefined,
                  letterSpacing: '-0.01em',
                }}
              >
                {w.word}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
