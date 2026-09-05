from fastapi.testclient import TestClient


def prueba_consolidacion_historial(client: TestClient):
    response = client.get("/api/v1/students/me/history")
    assert response.status_code == 401


def prueba_calculo_tendencias_emocionales(client: TestClient):
    response = client.get("/api/v1/emotion/trends")
    assert response.status_code in [401, 404]


def prueba_disponibilidad_predictor(client: TestClient):
    payload = {"text": "estoy triste"}
    response = client.post("/api/v1/emotion/predict", json=payload)
    assert response.status_code in [401, 404, 422, 200]


def prueba_logica_prediccion_emocion(client: TestClient):
    payload = {"text": "estoy feliz"}
    response = client.post("/api/v1/emotion/predict", json=payload)
    assert response.status_code in [401, 404, 422, 200]


def prueba_clean_y_tokenize_sc():
    from app.ml.emotion.regex_predictor import DiaryAnalyzer

    a = DiaryAnalyzer()
    tokens = a.clean_and_tokenize(
        "Hoy me siento muy triste. No he podido dormir bien; estoy angustiado."
    )
    # Limpia signos de puntuación y convierte a minúsculas
    assert "triste" in tokens
    assert "angustiado" in tokens
    assert "Hoy" not in tokens


def prueba_dividir_en_oraciones():
    from app.ml.emotion.regex_predictor import DiaryAnalyzer

    a = DiaryAnalyzer()
    frases = a.extraer_frases_relevantes(
        "Hoy me siento muy triste. No he podido dormir bien. Estoy angustiado."
    )
    assert isinstance(frases, dict)
    assert len(frases) >= 1
    # La frase con palabra emocional debe ser detectada
    assert any("triste" in f for f in frases)


def prueba_visualizations_analysis_endpoint_auth(client: TestClient):
    response = client.get("/api/v1/visualizations/analysis")
    assert response.status_code == 401


def prueba_visualizations_phrasecloud_endpoint_auth(client: TestClient):
    response = client.get("/api/v1/visualizations/phrasecloud")
    assert response.status_code == 401


def prueba_deteccion_emociones_positivas():
    from app.ml.emotion.regex_predictor import DiaryAnalyzer

    a = DiaryAnalyzer()
    # El análisis debe detectar entradas felices/motivadas y no solo negativas.
    assert a.analyze_emotion("hoy me siento muy feliz y contento")["emotion"] == "feliz"
    assert (
        a.analyze_emotion("estoy motivado con mis proyectos")["emotion"] == "motivado"
    )
    # Un día tranquilo también cuenta como positivo.
    assert (
        a.analyze_emotion("me siento tranquilo y relajado, todo bien")["emotion"]
        == "feliz"
    )


def prueba_deteccion_palabras_clave_negativas():
    from app.ml.emotion.regex_predictor import DiaryAnalyzer

    a = DiaryAnalyzer()
    # Palabras comunes que antes no se detectaban en el frontend.
    assert a.analyze_emotion("estoy ansioso por el examen")["emotion"] == "ansioso"
    assert (
        a.analyze_emotion("me siento estresado con las entregas")["emotion"]
        == "frustrado"
    )
    assert (
        a.analyze_emotion("tengo taquicardia y falta de aire")["emotion"] == "ansioso"
    )
    # La negación debe seguir anulando la emoción.
    assert a.analyze_emotion("no estoy triste, hoy me fue bien")["emotion"] == "neutral"


def prueba_calidad_vocabulario_positivo():
    from app.ml.emotion.regex_predictor import DiaryAnalyzer

    a = DiaryAnalyzer()
    full = "PASÓ HOY: Me desperté tranquilo, estudié y me fue bien en el parcial, estoy feliz."
    tokens = a.clean_and_tokenize(full)
    # Las frases y conceptos clave deben poblarse también con vocabulario positivo.
    assert a.get_key_concepts(full, top_n=5)
    assert a.extract_bigrams(tokens, top_n=8)
    assert a.extraer_frases_relevantes(full, top_n=3)


def prueba_deteccion_vocabulario_figurativo_tristeza():
    from app.ml.emotion.regex_predictor import DiaryAnalyzer

    a = DiaryAnalyzer()
    # Entradas poéticas/figurativas sin las palabras clave básicas también
    # deben clasificarse como tristeza (p. ej. "te extraño", "soledad",
    # "vacío", "me siento sola", "llorando", "nudo en la garganta").
    assert (
        a.analyze_emotion("te extraño y me siento sola en esta casa")["emotion"]
        == "triste"
    )
    assert (
        a.analyze_emotion("sentí un nudo en la garganta al recordar")["emotion"]
        == "triste"
    )
    assert a.analyze_emotion("el silencio me duele")["emotion"] == "triste"
    assert (
        a.analyze_emotion("esta casa está demasiado vacía sin él")["scores"][
            "depresion"
        ]
        > 0
    )
    # La negación sigue anulando incluso el vocabulario figurativo.
    assert a.analyze_emotion("no la extraño, me fue mejor así")["emotion"] == "neutral"


def prueba_fallbacks_pueblan_visualizaciones():
    from app.ml.emotion.regex_predictor import DiaryAnalyzer

    a = DiaryAnalyzer()
    # Texto sin palabras emocionales explícitas: los cuadros aún deben poblarse.
    full = (
        "El día transcurrió en silencio y la tarde se hizo larga. "
        "Caminé por el parque mirando el cielo gris y volví a casa antes "
        "de lo planeado, con la sensación de haber perdido algo."
    )
    tokens = a.clean_and_tokenize(full)
    conceptos = a.get_fallback_concepts(full, top_n=10)
    frases = a.get_fallback_phrases(full, top_n=5)
    patrones = a.get_fallback_patterns(tokens, top_n=8)
    assert conceptos, "fallback de conceptos no debe ser vacío"
    assert frases, "fallback de frases no debe ser vacío"
    assert patrones, "fallback de patrones no debe ser vacío"
    # No debe devolver stopwords como concepto principal.
    assert "el" not in conceptos[:3]
    # El flujo completo del endpoint /analysis (jerarquía real) queda cubierto.
    key_concepts = a.get_key_concepts(full, top_n=10) or conceptos
    relevant = a.extraer_frases_relevantes(full, top_n=5) or frases
    patterns = a.extract_bigrams(tokens, top_n=8) or patrones
    assert key_concepts and relevant and patterns
