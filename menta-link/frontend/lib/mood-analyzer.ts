// Regex patterns for depression, anxiety, and stress (Ported from backend/app/ml/emotion/regex_predictor.py)

export const MOOD_PATTERNS = {
  depresion: {
    tristeza: {
      regex: /\b(triste|deprimid[oa]|melancolí[oa]|desanimad[oa]|baj[oa] de ánimo)\b/gi,
      weight: 1.0,
    },
    desesperanza: {
      regex: /\b(desesperanz[oa]|sin esperanza|sin sentido|nada vale la pena|no hay salida)\b/gi,
      weight: 1.2,
    },
    fatiga: {
      regex: /\b(cansanci[oa]|cansad[oa]|agotamient[oa]|sin energía|fatigad[oa]|sin fuerzas)\b/gi,
      weight: 0.8,
    },
    inutilidad: {
      regex: /\b(inútil|fracasad[oa]|no valgo|no sirvo|incompetente)\b/gi,
      weight: 1.1,
    },
    cambios_sueno: {
      regex: /\b(insomnio|duermo mucho|hipersomnia|despertar temprano)\b/gi,
      weight: 0.9,
    },
    pensamientos_negativos: {
      regex: /\b(culpa|autocrític[oa]|odio a mí mismo|no merezco)\b/gi,
      weight: 1.0,
    },
  },
  ansiedad: {
    nerviosismo: {
      regex: /\b(nervios[oa]|inquiet[oa]|tens[oa]|intranquil[oa]|agitad[oa])\b/gi,
      weight: 1.0,
    },
    preocupacion: {
      regex: /\b(preocupad[oa]|angustiad[oa]|rumiando|pensando demasiado|anticipando lo peor)\b/gi,
      weight: 1.1,
    },
    miedo: { regex: /\b(miedo|temor|pánico|aterrorizad[oa]|fobia)\b/gi, weight: 1.2 },
    sintomas_fisicos: {
      regex:
        /\b(corazón acelerado|palpitaciones|sudor|temblor|falta de aire|opresión en el pecho)\b/gi,
      weight: 1.0,
    },
    evitacion: { regex: /\b(evito|escapo|no salgo|no quiero enfrentar)\b/gi, weight: 0.8 },
    hipervigilancia: {
      regex: /\b(alerta constante|sobresalt[oa]|asustadizo|vigilando todo)\b/gi,
      weight: 0.9,
    },
  },
  estres: {
    sobrecarga: {
      regex: /\b(sobrecargad[oa]|abrumad[oa]|colmad[oa]|no puedo más|demasiadas cosas)\b/gi,
      weight: 1.2,
    },
    presion: {
      regex: /\b(presión|exigencia|plazos|obligaciones|debo hacer todo)\b/gi,
      weight: 1.0,
    },
    irritabilidad: {
      regex: /\b(irritable|enfadad[oa]|frustrad[oa]|pierdo la paciencia|me enojo fácil)\b/gi,
      weight: 1.0,
    },
    agotamiento: {
      regex: /\b(agotamient[oa]|quemad[oa]|burnout|sin motivación|desgaste)\b/gi,
      weight: 1.1,
    },
    problemas_concentracion: {
      regex: /\b(desconcentrad[oa]|olvidadizo|bloqueo mental|no puedo enfocarme)\b/gi,
      weight: 0.9,
    },
    cambios_apetito: {
      regex: /\b(como mucho|sin apetito|atracones|pierdo el hambre)\b/gi,
      weight: 0.8,
    },
  },
};

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

export function analyzeMoodRealtime(text: string) {
  if (!text)
    return {
      scores: { depresion: 0, ansiedad: 0, estres: 0 },
      symptoms: [],
      keyConcepts: [],
      meaningfulPhrases: {},
    };

  const textoLimpio = cleanText(text);
  const tokens = textoLimpio.split(' ');

  const scores = {
    depresion: 0,
    ansiedad: 0,
    estres: 0,
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

    // @ts-ignore
    scores[category] = Math.min(totalWeight / maxPossible, 1.0);
  }

  return {
    scores,
    symptoms: Array.from(new Set(detectedSymptoms)),
    keyConcepts: getKeyConcepts(text, 5),
    meaningfulPhrases: extractMeaningfulPhrases(text, 8),
  };
}
