// Regex patterns for depression, anxiety, stress AND positive emotions.
// Ported from backend/app/ml/emotion/regex_predictor.py. The patterns are
// compiled with Unicode-aware word boundaries (JS \b does NOT treat accented
// chars like á/é/í/ó/ú/ñ as word characters, which silently broke most Spanish
// matches).

const MOOD_PATTERN_SOURCES: Record<string, Record<string, { pattern: string; weight: number }>> = {
  depresion: {
    tristeza: {
      pattern:
        'triste|deprimid[oa]|melancólic[oa]|melancolí[oa]|desanimad[oa]|baj[oa] de ánimo|desganad[oa]|sin ganas',
      weight: 1.0,
    },
    desesperanza: {
      pattern:
        'desesperanz[oa]|sin esperanza|sin sentido|nada vale la pena|no hay salida|nada tiene sentido|ya no quiero vivir|no quiero seguir (viviendo|así)',
      weight: 1.2,
    },
    fatiga: {
      pattern: 'cansanci[oa]|cansad[oa]|agotamient[oa]|sin energía|fatigad[oa]|sin fuerzas',
      weight: 0.8,
    },
    inutilidad: {
      pattern: 'inútil|fracasad[oa]|no valgo|no sirvo|incompetente',
      weight: 1.1,
    },
    cambios_sueno: {
      pattern:
        'insomnio|duermo mucho|hipersomnia|despertar temprano|problemas de sueño|malos hábitos de sueño',
      weight: 0.9,
    },
    pensamientos_negativos: {
      pattern: 'culpa|autocrític[oa]|odio a mí mismo|no merezco',
      weight: 1.0,
    },
  },
  ansiedad: {
    nerviosismo: {
      pattern: 'nervios[oa]|inquiet[oa]|tens[oa]|intranquil[oa]|agitad[oa]|ansios[oa]|ansiedad',
      weight: 1.0,
    },
    preocupacion: {
      pattern: 'preocupad[oa]|angustiad[oa]|rumiando|pensando demasiado|anticipando lo peor',
      weight: 1.1,
    },
    miedo: {
      pattern: 'miedo|temor|pánico|aterrorizad[oa]|fobia',
      weight: 1.2,
    },
    sintomas_fisicos: {
      pattern:
        'corazón acelerado|palpitaciones|sudor|temblor|falta de aire|opresión en el pecho|taquicardia',
      weight: 1.0,
    },
    evitacion: {
      pattern: 'evito|escapo|no salgo|no quiero enfrentar',
      weight: 0.8,
    },
    hipervigilancia: {
      pattern: 'alerta constante|sobresalt[oa]|asustadizo|vigilando todo',
      weight: 0.9,
    },
  },
  estres: {
    sobrecarga: {
      pattern:
        'sobrecargad[oa]|abrumad[oa]|colmad[oa]|no puedo más|demasiadas cosas|estrés|estres|estresad[oa]s?|estres[oa]',
      weight: 1.2,
    },
    presion: {
      pattern: 'presión|exigencia|plazos|obligaciones|debo hacer todo',
      weight: 1.0,
    },
    irritabilidad: {
      pattern: 'irritable|enfadad[oa]|frustrad[oa]|pierdo la paciencia|me enojo fácil',
      weight: 1.0,
    },
    agotamiento: {
      pattern: 'agotamient[oa]|quemad[oa]|burnout|sin motivación|desgaste',
      weight: 1.1,
    },
    problemas_concentracion: {
      pattern: 'desconcentrad[oa]|olvidadizo|bloqueo mental|no puedo enfocarme',
      weight: 0.9,
    },
    cambios_apetito: {
      pattern:
        'como mucho|sin apetito|atracones|pierdo el hambre|no estoy comiendo|hábitos de alimentación',
      weight: 0.8,
    },
  },
  felicidad: {
    felicidad: {
      pattern: 'feliz|felices|content[oa]|alegre|alegrí[oa]|alegria|sonri[óo]',
      weight: 1.2,
    },
    motivacion: {
      pattern: 'motivad[oa]|entusiasmad[oa]|con ganas|optimista|ilusionad[oa]|con energía',
      weight: 1.1,
    },
    tranquilidad: {
      pattern: 'tranquil[oa]|calmad[oa]|relajad[oa]|en paz|sin preocupaciones',
      weight: 0.9,
    },
    satisfaccion: {
      pattern:
        'genial|excelente|increíble|increible|maravillos[oa]|satisfech[oa]|me fue bien|todo bien|muy bien|logré|logre|aprobé|aprobe|éxito|exito',
      weight: 1.0,
    },
    agradecimiento: {
      pattern: 'agradecid[oa]s?|orgullos[oa]|gracias a dios',
      weight: 0.8,
    },
  },
};

// Unicode-aware word boundaries: JS \b/\B only know the ASCII \w character
// class, so accented Spanish letters break matches. These lookarounds emulate
// Python `re`'s unicode \b behavior.
function makeWordRegex(pattern: string) {
  return new RegExp(`(?<![\\p{L}\\p{N}_])(?:${pattern})(?![\\p{L}\\p{N}_])`, 'giu');
}

function compilePatterns(
  sources: Record<string, Record<string, { pattern: string; weight: number }>>
): Record<string, Record<string, { regex: RegExp; weight: number }>> {
  const compiled: Record<string, Record<string, { regex: RegExp; weight: number }>> = {};
  for (const [category, patterns] of Object.entries(sources)) {
    compiled[category] = {};
    for (const [symptom, { pattern, weight }] of Object.entries(patterns)) {
      compiled[category][symptom] = { regex: makeWordRegex(pattern), weight };
    }
  }
  return compiled;
}

export const MOOD_PATTERNS = compilePatterns(MOOD_PATTERN_SOURCES);

const NEGATIONS = new Set(['no', 'ni', 'nunca', 'jamás', 'sin', 'tampoco', 'ningún', 'ninguna']);
const INTENSIFIERS = new Set([
  'muy',
  'mucho',
  'demasiado',
  'siempre',
  'constantemente',
  'extremadamente',
  'terriblemente',
]);
const STOPWORDS_FINALES = new Set([
  'y',
  'e',
  'ni',
  'o',
  'u',
  'de',
  'del',
  'la',
  'las',
  'lo',
  'los',
  'el',
  'que',
  'por',
  'para',
  'con',
  'sin',
  'a',
  'ante',
  'bajo',
  'cabe',
  'contra',
  'desde',
  'durante',
  'en',
  'entre',
  'hacia',
  'hasta',
  'mediante',
  'para',
  'por',
  'según',
  'sin',
  'so',
  'sobre',
  'tras',
  'ya',
  'también',
  'más',
  'pero',
  'aunque',
  'si',
  'no',
]);

function cleanText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\wáéíóúüñ\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function contieneEmocion(frase: string) {
  for (const category of Object.values(MOOD_PATTERNS)) {
    for (const { regex } of Object.values(category)) {
      regex.lastIndex = 0;
      if (regex.test(frase)) return true;
    }
  }
  return false;
}

export function getKeyConcepts(text: string, topN: number = 10): string[] {
  const textoLimpio = cleanText(text);
  const tokens = textoLimpio.split(' ');
  if (tokens.length < 2) return [];

  const posicionesEmocionales: number[] = [];
  for (const category of Object.values(MOOD_PATTERNS)) {
    for (const { regex } of Object.values(category)) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(textoLimpio)) !== null) {
        const palabraMatch = match[0];
        for (let i = 0; i < tokens.length; i++) {
          if (tokens[i] === palabraMatch) {
            posicionesEmocionales.push(i);
          }
        }
      }
    }
  }

  const frasesCandidatas: string[] = [];
  for (const pos of new Set(posicionesEmocionales)) {
    const inicio = Math.max(0, pos - 2);
    const fin = Math.min(tokens.length, pos + 3);
    const fragmento = tokens.slice(inicio, fin).join(' ');
    if (fragmento.split(' ').length >= 2) {
      frasesCandidatas.push(fragmento);
    }
  }

  const counts: Record<string, number> = {};
  frasesCandidatas.forEach((f) => (counts[f] = (counts[f] || 0) + 1));

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map((e) => e[0]);
}

export function extractMeaningfulPhrases(text: string, topN: number = 10): Record<string, number> {
  const textoLimpio = cleanText(text);
  const tokens = textoLimpio.split(' ');
  if (tokens.length < 2) return {};

  const frasesCandidatas: string[] = [];

  // Bigramas
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigrama = `${tokens[i]} ${tokens[i + 1]}`;
    if (contieneEmocion(bigrama)) {
      const ultima = tokens[i + 1];
      if (!STOPWORDS_FINALES.has(ultima)) {
        frasesCandidatas.push(bigrama);
      }
    }
  }

  // Trigramas
  for (let i = 0; i < tokens.length - 2; i++) {
    const trigrama = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
    if (contieneEmocion(trigrama)) {
      const ultima = tokens[i + 2];
      if (!STOPWORDS_FINALES.has(ultima)) {
        frasesCandidatas.push(trigrama);
      }
    }
  }

  const counts: Record<string, number> = {};
  frasesCandidatas.forEach((f) => (counts[f] = (counts[f] || 0) + 1));

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  return Object.fromEntries(sorted);
}

export type MoodScores = {
  depresion: number;
  ansiedad: number;
  estres: number;
  felicidad: number;
};

export function analyzeMoodRealtime(text: string) {
  if (!text)
    return {
      scores: { depresion: 0, ansiedad: 0, estres: 0, felicidad: 0 } as MoodScores,
      symptoms: [],
      keyConcepts: [],
      meaningfulPhrases: {},
    };

  const textoLimpio = cleanText(text);
  const tokens = textoLimpio.split(' ');

  const scores: MoodScores = {
    depresion: 0,
    ansiedad: 0,
    estres: 0,
    felicidad: 0,
  };

  const detectedSymptoms: string[] = [];

  for (const [category, patterns] of Object.entries(MOOD_PATTERNS)) {
    let totalWeight = 0;
    const maxPossible = Object.values(patterns).reduce((acc, p) => acc + p.weight, 0);

    for (const [symptom, { regex, weight }] of Object.entries(patterns)) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(textoLimpio)) !== null) {
        const start = match.index;
        const context = textoLimpio.substring(Math.max(0, start - 50), start);
        const contextWords = context.split(/\s+/).filter(Boolean);

        const hasNegation = contextWords.some((w) => NEGATIONS.has(w));
        const hasIntensifier = contextWords.some((w) => INTENSIFIERS.has(w));

        if (!hasNegation) {
          let contribution = weight;
          if (hasIntensifier) contribution *= 1.5;
          totalWeight += contribution;
          detectedSymptoms.push(`${category}:${symptom}`);
        }
      }
    }

    scores[category as keyof MoodScores] = Math.min(totalWeight / maxPossible, 1.0);
  }

  return {
    scores,
    symptoms: Array.from(new Set(detectedSymptoms)),
    keyConcepts: getKeyConcepts(text, 5),
    meaningfulPhrases: extractMeaningfulPhrases(text, 8),
  };
}
