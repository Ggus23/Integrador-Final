from collections import Counter
from datetime import date
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import models
from app.api import deps
from app.ml.emotion.regex_predictor import (
    STOPWORDS_ANALISIS,
    get_regex_emotion_analyzer,
)

router = APIRouter()

# Stopwords estrictas para la NUBE DE PALABRAS: artículos, preposiciones,
# conjunciones, pronombres, verbos auxiliares, adverbios vacíos y encabezados
# estructurales del diario. Mantener aquí (y no solo en STOPWORDS_ANALISIS)
# evita que conectores como "es", "se", "sino", "vi", "todo", "cuando" o
# "veces" contaminen la nube.
WORDCLOUD_STOPWORDS = {
    # Artículos
    "el",
    "la",
    "los",
    "las",
    "lo",
    "un",
    "una",
    "unos",
    "unas",
    "al",
    "del",
    # Preposiciones
    "a",
    "ante",
    "bajo",
    "cabe",
    "con",
    "contra",
    "de",
    "desde",
    "durante",
    "en",
    "entre",
    "hacia",
    "hasta",
    "mediante",
    "para",
    "por",
    "según",
    "sin",
    "so",
    "sobre",
    "tras",
    # Conjunciones
    "e",
    "o",
    "u",
    "y",
    "ni",
    "que",
    "aunque",
    "como",
    "mas",
    "pero",
    "porque",
    "pues",
    "sino",
    "mientras",
    "cuando",
    "además",
    "incluso",
    "también",
    "tambien",
    "tampoco",
    "entonces",
    "luego",
    # Pronombres y determinantes
    "yo",
    "tú",
    "usted",
    "ustedes",
    "él",
    "ella",
    "ello",
    "ellos",
    "ellas",
    "nosotros",
    "nosotras",
    "vosotros",
    "vosotras",
    "me",
    "te",
    "se",
    "nos",
    "os",
    "le",
    "les",
    "mi",
    "mis",
    "ti",
    "tu",
    "tus",
    "su",
    "sus",
    "nuestro",
    "nuestra",
    "nuestros",
    "nuestras",
    "vuestro",
    "vuestra",
    "algo",
    "nada",
    "alguien",
    "nadie",
    "este",
    "esta",
    "estos",
    "estas",
    "ese",
    "esa",
    "esos",
    "esas",
    "aquel",
    "aquella",
    "aquellos",
    "aquellas",
    "esto",
    "eso",
    "aquello",
    "cada",
    "otro",
    "otra",
    "otros",
    "otras",
    "mismo",
    "misma",
    "mismos",
    "mismas",
    "cual",
    "cuales",
    "cualquier",
    "quien",
    "quienes",
    "cuyo",
    "cuya",
    # Verbos auxiliares / cópula
    "ser",
    "sido",
    "siendo",
    "es",
    "soy",
    "eres",
    "somos",
    "sois",
    "son",
    "era",
    "eras",
    "éramos",
    "eran",
    "fue",
    "fui",
    "fueron",
    "fuera",
    "será",
    "estar",
    "estando",
    "está",
    "estás",
    "estoy",
    "estamos",
    "están",
    "estaba",
    "estabas",
    "estábamos",
    "estaban",
    "estuve",
    "estuviste",
    "estuvo",
    "estuvimos",
    "estiveron",
    "estive",
    "ha",
    "has",
    "hemos",
    "han",
    "había",
    "hubo",
    "hay",
    "he",
    "haber",
    "habido",
    # Verbos impersonales/frecuentes sin valor como palabra clave
    "tengo",
    "tiene",
    "tienen",
    "tenía",
    "tenia",
    "tuve",
    "tuvo",
    "paso",
    "pasa",
    "pasó",
    "pasado",
    "vi",
    "vio",
    "veo",
    "ver",
    "saber",
    "sabía",
    "quiero",
    "quiere",
    "puedo",
    "puede",
    "hace",
    "hacer",
    "hice",
    "debo",
    "debemos",
    "hoy",
    "ayer",
    "mañana",
    "día",
    "dia",
    "días",
    "dias",
    "ahora",
    "después",
    "despues",
    "antes",
    "siempre",
    "nunca",
    "jamás",
    "casi",
    # Adverbios / intensificadores
    "muy",
    "mucho",
    "mucha",
    "muchos",
    "muchas",
    "poco",
    "poca",
    "pocos",
    "pocas",
    "más",
    "mas",
    "menos",
    "tan",
    "tanto",
    "tanta",
    "tantos",
    "tantas",
    "bastante",
    "demasiado",
    "también",
    "tambien",
    "si",
    "sí",
    "así",
    "asi",
    "ya",
    "solo",
    "sola",
    "sólo",
    "últimamente",
    "ultimamente",
    # Cuantificadores vacíos
    "todo",
    "toda",
    "todos",
    "todas",
    "cada",
    "veces",
    "vez",
    "cosas",
    "cosa",
    # Encabezados estructurales del diario
    "aprendizajes",
    "aprendizaje",
    "aprendí",
    "aprendi",
    # Palabras solicitadas explícitamente (seguridad ante variantes)
    "es",
    "se",
    "sino",
    "vi",
    "todo",
    "cuando",
    "veces",
}


def _collect_entries_text(entries: List[models.EmotionalDiary]) -> str:
    """
    Concatenar los textos (experience) de un grupo de entradas y limpiar los
    encabezados estructurales que el frontend inyecta.
    """
    text = " ".join([e.experience for e in entries if e.experience])
    text = text.replace("PASÓ HOY:", "").replace("APRENDIZAJES:", "")
    return text


def _filter_keyword_tokens(tokens: List[str]) -> List[str]:
    """Aplicar filtrado estricto de stopwords y tokens sin valor para la nube."""
    stopwords = WORDCLOUD_STOPWORDS | STOPWORDS_ANALISIS
    return [t for t in tokens if t not in stopwords and len(t) > 2 and t.isalpha()]


@router.get("/wordcloud")
def get_word_cloud(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
    date: Optional[date] = Query(
        None, description="Filtrar y agrupar por día (formato YYYY-MM-DD)."
    ),
) -> Any:
    """
    Generar nube de palabras con agrupación diaria.

    Si se especifica ``date`` (YYYY-MM-DD), se concatenan TODAS las entradas de
    ese día antes de contar frecuencias. Sin ``date``, se usa el historial
    completo (comportamiento acumulativo de compatibilidad).

    Retorna un arreglo estructurado ``[{word, frequency, weight, is_dominant,
    sentiment}]`` donde ``weight`` es el peso normalizado (0-100) de cada
    palabra clave y ``is_dominant`` marca la palabra clave dominante del día.
    """
    query = db.query(models.EmotionalDiary).filter(
        models.EmotionalDiary.user_id == current_user.id
    )
    if date:
        query = query.filter(models.EmotionalDiary.date == date)
    entries = query.all()

    text = _collect_entries_text(entries)
    if not text:
        return []

    regex_analyzer = get_regex_emotion_analyzer()
    tokens = regex_analyzer.clean_and_tokenize(text)

    tokens_filtrados = _filter_keyword_tokens(tokens)

    counts = Counter(tokens_filtrados).most_common(50)
    if not counts:
        return []

    max_freq = counts[0][1]
    result = []
    for word, freq in counts:
        # Detectar sentimiento de la palabra individual
        sentiment_data = regex_analyzer.analyze_emotion(word)
        result.append(
            {
                "word": word,
                "frequency": freq,
                "weight": round(freq / max_freq * 100, 1) if max_freq else 0,
                "is_dominant": freq == max_freq,
                "sentiment": sentiment_data["emotion"],
            }
        )

    return result


@router.get("/phrasecloud")
def get_phrase_cloud(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
    date: Optional[date] = Query(
        None, description="Filtrar y agrupar por día (formato YYYY-MM-DD)."
    ),
) -> Any:
    """
    Generar nube de frases (bigramas) a partir del historial de diarios.

    Acepta el mismo filtro ``date`` de agrupación diaria que /wordcloud.
    """
    query = db.query(models.EmotionalDiary).filter(
        models.EmotionalDiary.user_id == current_user.id
    )
    if date:
        query = query.filter(models.EmotionalDiary.date == date)
    entries = query.all()

    text = _collect_entries_text(entries)
    if not text:
        return []

    regex_analyzer = get_regex_emotion_analyzer()
    tokens = regex_analyzer.clean_and_tokenize(text)
    bigrams_counts = regex_analyzer.extract_bigrams(tokens, top_n=30)

    max_freq = max(bigrams_counts.values()) if bigrams_counts else 0
    result = []
    for phrase, freq in bigrams_counts.items():
        # Detectar sentimiento de la frase (conjunto)
        sentiment_data = regex_analyzer.analyze_emotion(phrase)
        result.append(
            {
                "phrase": phrase,
                "frequency": freq,
                "weight": round(freq / max_freq * 100, 1) if max_freq else 0,
                "is_dominant": freq == max_freq,
                "sentiment": sentiment_data["emotion"],
            }
        )

    return result


@router.get("/analysis")
def get_detailed_analysis(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Obtiene conceptos clave y frases relevantes del historial del usuario.
    """
    entries = (
        db.query(models.EmotionalDiary)
        .filter(models.EmotionalDiary.user_id == current_user.id)
        .order_by(models.EmotionalDiary.id.desc())
        .limit(1)
        .all()
    )

    full_text = ". ".join([e.experience for e in entries if e.experience])
    if not full_text:
        return {"key_concepts": [], "relevant_phrases": []}

    # Limpiar encabezados estructurales
    full_text = full_text.replace("PASÓ HOY:", "").replace("APRENDIZAJES:", "")

    regex_analyzer = get_regex_emotion_analyzer()

    key_concepts = regex_analyzer.get_key_concepts(full_text, top_n=10)
    relevant_phrases_dict = regex_analyzer.extraer_frases_relevantes(full_text, top_n=5)

    # Patrones recurrentes del último diario
    tokens = regex_analyzer.clean_and_tokenize(full_text)
    patterns_dict = regex_analyzer.extract_bigrams(tokens, top_n=8)

    # Fallback: si el texto no contiene suficientes palabras emocionales
    # explícitas (entradas poéticas o figurativas), completar cada cuadro con
    # conceptos/frases/patrones reales del propio texto para que nunca queden
    # vacíos ni se vean con un solo elemento suelto.
    if len(key_concepts) < 5:
        for extra in regex_analyzer.get_fallback_concepts(full_text, top_n=10):
            if extra not in key_concepts:
                key_concepts.append(extra)
    key_concepts = key_concepts[:10]

    frases_items = list(relevant_phrases_dict.items())
    if len(frases_items) < 2:
        for frase, count in regex_analyzer.get_fallback_phrases(
            full_text, top_n=5
        ).items():
            if frase not in relevant_phrases_dict:
                frases_items.append((frase, count))
    relevant_phrases = [{"phrase": p, "count": c} for p, c in frases_items[:5]]

    patrones = patterns_dict
    if len(patrones) < 3:
        for extra, count in regex_analyzer.get_fallback_patterns(
            tokens, top_n=8
        ).items():
            if extra not in patrones:
                patrones[extra] = count
    patterns_dict = dict(list(patrones.items())[:8])

    recurrent_patterns = [
        {
            "phrase": p,
            "frequency": f,
            "sentiment": regex_analyzer.analyze_emotion(p)["emotion"],
        }
        for p, f in patterns_dict.items()
    ]

    return {
        "key_concepts": key_concepts,
        "relevant_phrases": relevant_phrases,
        "recurrent_patterns": recurrent_patterns,
    }
