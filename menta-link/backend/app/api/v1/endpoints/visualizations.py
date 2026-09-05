from collections import Counter
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.api import deps
from app.ml.emotion.regex_predictor import (
    STOPWORDS_ANALISIS,
    get_regex_emotion_analyzer,
)

router = APIRouter()


@router.get("/wordcloud")
def get_word_cloud(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Generar nube de palabras a partir del historial de diarios con sentimiento.
    """
    entries = (
        db.query(models.EmotionalDiary)
        .filter(models.EmotionalDiary.user_id == current_user.id)
        .all()
    )

    text = " ".join([e.experience for e in entries if e.experience])
    if not text:
        return []

    # Limpiar encabezados estructurales del diario antes del análisis
    text = text.replace("PASÓ HOY:", "").replace("APRENDIZAJES:", "")

    regex_analyzer = get_regex_emotion_analyzer()
    tokens = regex_analyzer.clean_and_tokenize(text)

    # Filtrar palabras que son solo conectores en la NUBE DE PALABRAS (pero que se mantienen en frases)
    conectores = {
        "pero",
        "muy",
        "tan",
        "más",
        "mas",
        "poco",
        "mucho",
        "aunque",
        "incluso",
        "también",
        "tambien",
        "está",
        "estoy",
        "tengo",
        "pasó",
        "hoy",
        "aprendizajes",
        "aprendizajes:",
        "hoy:",
        "sin",
        "cada",
        "una",
        "esto",
        "este",
        "estos",
        "estive",
        "estaba",
    }
    tokens_filtrados = [
        t for t in tokens if t not in conectores and t not in STOPWORDS_ANALISIS
    ]

    counts = Counter(tokens_filtrados).most_common(50)

    result = []
    for word, freq in counts:
        # Detectar sentimiento de la palabra individual
        sentiment_data = regex_analyzer.analyze_emotion(word)
        result.append(
            {"word": word, "frequency": freq, "sentiment": sentiment_data["emotion"]}
        )

    return result


@router.get("/phrasecloud")
def get_phrase_cloud(
    db: Session = Depends(deps.get_db),
    current_user: models.user.User = Depends(deps.get_current_user),
) -> Any:
    """
    Generar nube de frases (bigramas) a partir del historial de diarios con sentimiento.
    """
    entries = (
        db.query(models.EmotionalDiary)
        .filter(models.EmotionalDiary.user_id == current_user.id)
        .all()
    )

    text = " ".join([e.experience for e in entries if e.experience])
    if not text:
        return []

    # Limpiar encabezados estructurales del diario antes del análisis
    text = text.replace("PASÓ HOY:", "").replace("APRENDIZAJES:", "")

    regex_analyzer = get_regex_emotion_analyzer()
    tokens = regex_analyzer.clean_and_tokenize(text)
    bigrams_counts = regex_analyzer.extract_bigrams(tokens, top_n=30)

    result = []
    for phrase, freq in bigrams_counts.items():
        # Detectar sentimiento de la frase (conjunto)
        sentiment_data = regex_analyzer.analyze_emotion(phrase)
        result.append(
            {
                "phrase": phrase,
                "frequency": freq,
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
        .order_by(models.EmotionalDiary.created_at.desc())
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
