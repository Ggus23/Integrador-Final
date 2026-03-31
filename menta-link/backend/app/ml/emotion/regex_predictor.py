import logging
import re
from collections import Counter

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.util import bigrams

logger = logging.getLogger(__name__)

# Descarga automática de recursos de NLTK
try:
    nltk.download("stopwords", quiet=True)
    nltk.download("punkt", quiet=True)
    nltk.download("punkt_tab", quiet=True)
except Exception as e:
    logger.warning("Failed to download NLTK resources: %s", e)

PATRONES_EMOCIONES = {
    "feliz": re.compile(
        r"\b("
        r"feliz|felices|felicidad|alegre|alegres|alegr[íaío]s?|content[oa]s?|dichos[oa]s?|eufóric[oa]s?|euforia|"
        r"amor|amoros[oa]s?|cariño|cariños[oa]s?|encantad[oa]s?|enamorad[oa]s?|"
        r"gratitud|agradecid[oa]s?|satisfech[oa]s?|orgullos[oa]s?|ilusionad[oa]s?|"
        r"bien|genial|excelente|maravill[oa]s[oa]s?|fantástic[oa]s?|increíble|increíbles|"
        r"hermos[oa]s?|bonit[oa]s?|lind[oa]s?|perfect[oa]s?|"
        r"disfrut[oóae]s?|sonreír|sonrío|reír|reí|celebr[oóae]s?|"
        r"emocionad[oa]s?|entusiasmad[oa]s?|motivad[oa]s?|esperanzad[oa]s?|"
        r"felizmente|afortunadamente|afortunad[oa]s?|"
        r"serenidad|calma|paz|equilibrio|crecer|mejor|adelante|acept[oa]s?|aceptar|aceptarlas|comprenderme|"
        r"tranquilidad|tranquil[oa]s?|consciente|conscientemente|propósito|mejorar"
        r")\b",
        re.IGNORECASE | re.UNICODE,
    ),
    "triste": re.compile(
        r"\b("
        r"triste|tristeza|tristezas|melancolía|melancólico|melancólica|"
        r"deprimid[oa]|depresión|depresivo|depresiva|llorando|llor[éaeo]|"
        r"pérdida|perdí|perdido|perdida|soledad|sol[oa]|abandon[oa]d[oa]|"
        r"vacío|vacía|vacíos|vacías|"
        r"dolor|doloroso|dolorosa|sufrimiento|sufr[eo]|sufrir|"
        r"angustia|angustiado|angustiada|pena|penoso|penosa|"
        r"desesperado|desesperada|desesperanza|sin esperanza|"
        r"cansado|cansada|agotad[oa]|exhausto|exhausta|"
        r"extrañ[aoóe]|nostalgia|nostálgico|nostálgica|"
        r"llorar|lament[oóae]|sufro|decaíd[oa]|abatid[oa]"
        r")\b",
        re.IGNORECASE | re.UNICODE,
    ),
    "ansioso": re.compile(
        r"\b("
        r"ansios[oa]|ansiedad|nervios[oa]|nerviosismo|nervios|"
        r"angustiad[oa]|angustia|preocupad[oa]|preocupación|preocupaciones|"
        r"miedo|miedos[oa]|temeroso|temerosa|terror|pánico|"
        r"aterrado|aterrada|asustado|asustada|"
        r"estrés|estresad[oa]|agobiad[oa]|agobio|abrumad[oa]|"
        r"presión|presiones|sobrecargad[oa]|"
        r"incertidumbre|inseguro|insegura|inseguridad|duda|dudas|"
        r"inestable|inestabilidad|confundid[oa]|confusión|"
        r"tembland[oa]|temblor|taquicardia|sudando|insomnio|"
        r"temo|temer|preocupo|angustio|me ahog[ao]|sin aire"
        r")\b",
        re.IGNORECASE | re.UNICODE,
    ),
}


class RegexEmotionAnalyzer:
    def __init__(self):
        self.stop_es = set(stopwords.words("spanish")) if stopwords else set()
        # Conservar palabras conectoras de sentido emocional
        self.negaciones = {
            "no",
            "ni",
            "sin",
            "jamás",
            "jamas",
            "nunca",
            "pero",
            "aunque",
            "muy",
            "tan",
            "más",
            "mas",
            "poco",
            "mucho",
        }
        self.stop_es = self.stop_es - self.negaciones

        stop_extra = {
            "hoy",
            "ayer",
            "mañana",
            "día",
            "dias",
            "días",
            "vez",
            "veces",
            "también",
            "tambien",
            "así",
            "asi",
            "cada",
            "etc",
            "si",
            "mi",
            "me",
            "le",
        }
        self.stop_es.update(stop_extra)

    def analyze_emotion(self, text: str) -> dict:
        resultados = {emocion: [] for emocion in PATRONES_EMOCIONES}

        for emocion, patron in PATRONES_EMOCIONES.items():
            coincidencias = patron.findall(text)
            resultados[emocion] = coincidencias

        conteos = {em: len(words) for em, words in resultados.items()}
        total_matches = sum(conteos.values())

        emocion_dominante = "neutral"
        if total_matches > 0:
            emocion_dominante = max(conteos, key=conteos.get)

        # Generar "scores" normalizados para compatibilidad con el predictor original
        scores = {
            "feliz": 0.0,
            "neutral": 0.0,
            "triste": 0.0,
            "ansioso": 0.0,
            "frustrado": 0.0,
            "motivado": 0.0,
        }

        if total_matches > 0:
            for em, count in conteos.items():
                scores[em] = float(count / total_matches)
        else:
            scores["neutral"] = 1.0

        return {
            "emotion": emocion_dominante,
            "confidence": (
                scores[emocion_dominante] if emocion_dominante != "neutral" else 1.0
            ),
            "scores": scores,
            "matches": resultados,
        }

    def clean_and_tokenize(self, text: str):
        texto_lower = text.lower()
        # Eliminar puntuación, pero mantener tildes y ñ
        texto_limpio = re.sub(r"[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]", " ", texto_lower)

        try:
            tokens = word_tokenize(texto_limpio, language="spanish")
        except Exception:
            tokens = texto_limpio.split()

        # Las "negaciones" son vitales para el sentimiento
        tokens_finales = []
        for t in tokens:
            # Mantener si NO es stopword O si es una de nuestras negaciones/intensificadores vitales
            if t in self.negaciones or (t not in self.stop_es and len(t) > 2):
                # Limpiar tildes de las palabras comunes para agrupar (opcional)
                # t = "".join(c for c in unicodedata.normalize('NFD', t) if unicodedata.category(c) != 'Mn')
                tokens_finales.append(t)

        return tokens_finales

    def extract_bigrams(self, tokens, top_n=30):
        if not tokens or len(tokens) < 2:
            return {}

        # Generar bigramas
        pares = list(bigrams(tokens))
        frases = [f"{w1} {w2}" for w1, w2 in pares]

        # Opcional: Trigramas para más contexto en frases muy cortas
        if len(tokens) >= 3:
            for i in range(len(tokens) - 2):
                frases.append(f"{tokens[i]} {tokens[i+1]} {tokens[i+2]}")

        # Priorizar frases que contienen palabras del léxico emocional
        frases_con_sentido = []
        for f in frases:
            # Si la frase tiene alguna coincidencia emocional, es prioritaria
            if any(patron.search(f) for patron in PATRONES_EMOCIONES.values()):
                frases_con_sentido.append(f)
            # O si contiene negaciones/intensificadores
            elif any(neg in f.split() for neg in self.negaciones):
                frases_con_sentido.append(f)

        # Si no hay frases con sentido detectado, volvemos a las más comunes normales
        final_list = frases_con_sentido if frases_con_sentido else frases

        conteo = Counter(final_list)
        return dict(conteo.most_common(top_n))


_regex_analyzer = None


def get_regex_emotion_analyzer():
    global _regex_analyzer
    if _regex_analyzer is None:
        _regex_analyzer = RegexEmotionAnalyzer()
    return _regex_analyzer
