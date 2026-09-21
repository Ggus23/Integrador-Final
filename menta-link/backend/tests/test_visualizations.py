from datetime import date

from fastapi.testclient import TestClient

from app.core.security import get_password_hash
from app.models.user import User, UserRole

STOPWORDS_CRITICAS = {"es", "se", "sino", "vi", "todo", "cuando", "veces"}


def _login(client: TestClient, email: str, password: str):
    r = client.post(
        "/api/v1/auth/login", data={"username": email, "password": password}
    )
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _crear_entrada(
    client: TestClient,
    headers: dict,
    experience: str,
    entry_date: date | None = None,
):
    payload = {
        "experience": experience,
        "activities": "estudio",
        "emotion": "Neutral",
        "emotion_color": "Amarillo",
        "wellbeing_level": 3,
    }
    if entry_date:
        payload["date"] = entry_date.isoformat()
    r = client.post("/api/v1/diary/", json=payload, headers=headers)
    assert r.status_code == 200, r.text
    return r.json()


def _crear_usuario(db_session, email: str) -> User:
    user = User(
        email=email,
        hashed_password=get_password_hash("password123"),
        full_name="Test User",
        is_active=True,
        is_email_verified=True,
        role=UserRole.STUDENT,
    )
    db_session.add(user)
    db_session.commit()
    return user


def prueba_wordcloud_agrupa_entradas_del_mismo_dia(client: TestClient, db_session):
    """
    Varias respuestas del mismo día se concatenan antes de contar frecuencias.
    """
    email = "agrupa@unifranz.edu.bo"
    _crear_usuario(db_session, email)
    headers = _login(client, email, "password123")

    _crear_entrada(
        client,
        headers,
        "Hoy estuve en el partido de fútbol",
        entry_date=date(2026, 9, 19),
    )
    _crear_entrada(
        client,
        headers,
        "Ganamos el partido de fútbol",
        entry_date=date(2026, 9, 19),
    )

    cloud = client.get(
        "/api/v1/visualizations/wordcloud?date=2026-09-19", headers=headers
    ).json()
    words = {w["word"]: w for w in cloud}
    assert "partido" in words, f"palabra clave no agrupada: {words}"
    assert words["partido"]["frequency"] >= 2, words["partido"]
    assert any(w["is_dominant"] for w in cloud), cloud


def prueba_wordcloud_filtra_por_dia(client: TestClient, db_session):
    """
    Con ?date solo se incluyen las entradas de esa fecha (YYYY-MM-DD).
    """
    email = "filtra@unifranz.edu.bo"
    _crear_usuario(db_session, email)
    headers = _login(client, email, "password123")

    _crear_entrada(
        client,
        headers,
        "estudié cálculo toda la noche",
        entry_date=date(2026, 9, 10),
    )
    _crear_entrada(
        client,
        headers,
        "El partido de fútbol estuvo genial",
        entry_date=date(2026, 9, 19),
    )

    cloud = client.get(
        "/api/v1/visualizations/wordcloud?date=2026-09-19", headers=headers
    ).json()
    words = {w["word"] for w in cloud}
    assert "fútbol" in words and "partido" in words, words
    assert "cálculo" not in words, f"filtro por día no aisló la fecha: {words}"


def prueba_wordcloud_filtra_stopwords_estrictas(client: TestClient, db_session):
    """
    Conectores/pronombres/preposiciones (es, se, sino, vi, todo, cuando, veces)
    nunca deben aparecer como palabras clave de la nube.
    """
    email = "stop@unifranz.edu.bo"
    _crear_usuario(db_session, email)
    headers = _login(client, email, "password123")

    _crear_entrada(
        client,
        headers,
        "Hoy vi que es un día cuando se hizo todo, sino que las veces que es así",
        entry_date=date(2026, 9, 19),
    )

    cloud = client.get(
        "/api/v1/visualizations/wordcloud?date=2026-09-19", headers=headers
    ).json()
    words = {w["word"] for w in cloud}
    assert not words.intersection(STOPWORDS_CRITICAS), words.intersection(
        STOPWORDS_CRITICAS
    )
    assert "hizo" in words, f"palabra de contenido filtrada por error: {words}"


def prueba_wordcloud_peso_y_dominante(client: TestClient, db_session):
    """
    El JSON devuelve peso normalizado (0-100) y marca la palabra dominante.
    """
    email = "peso@unifranz.edu.bo"
    _crear_usuario(db_session, email)
    headers = _login(client, email, "password123")

    _crear_entrada(
        client,
        headers,
        "Estaba muy triste y ansioso porque perdí todo, muy triste",
        entry_date=date(2026, 9, 19),
    )

    cloud = client.get(
        "/api/v1/visualizations/wordcloud?date=2026-09-19", headers=headers
    ).json()
    words = {w["word"]: w for w in cloud}
    assert "triste" in words and "ansioso" in words, words
    assert words["triste"]["is_dominant"] is True, words["triste"]
    assert words["triste"]["weight"] == 100, words["triste"]
    assert words["ansioso"]["weight"] == 50, words["ansioso"]


def prueba_wordcloud_sin_fecha_acumula_historial(client: TestClient, db_session):
    """
    Compatibilidad: sin ?date la nube acumula todo el historial.
    """
    email = "acumula@unifranz.edu.bo"
    _crear_usuario(db_session, email)
    headers = _login(client, email, "password123")

    _crear_entrada(
        client,
        headers,
        "estuve en la montaña en bicicleta",
        entry_date=date(2026, 9, 10),
    )
    _crear_entrada(
        client,
        headers,
        "el partido de fútbol estuvo genial",
        entry_date=date(2026, 9, 19),
    )

    cloud = client.get("/api/v1/visualizations/wordcloud", headers=headers).json()
    words = {w["word"] for w in cloud}
    assert "bicicleta" in words, words
    assert "partido" in words, words


def prueba_phrasecloud_filtra_por_dia(client: TestClient, db_session):
    email = "frases@unifranz.edu.bo"
    _crear_usuario(db_session, email)
    headers = _login(client, email, "password123")

    _crear_entrada(
        client,
        headers,
        "amo los gatos negros y sus recorridos",
        entry_date=date(2026, 9, 10),
    )
    _crear_entrada(
        client,
        headers,
        "me encanta pasear por el parque",
        entry_date=date(2026, 9, 19),
    )

    cloud_dia = client.get(
        "/api/v1/visualizations/phrasecloud?date=2026-09-19", headers=headers
    ).json()
    assert isinstance(cloud_dia, list), cloud_dia
    if cloud_dia:
        # Las frases del día filtrado no deben mezclar el otro día.
        frases = " ".join(f["phrase"] for f in cloud_dia)
        assert "gatos" not in frases, frases

    vacio = client.get(
        "/api/v1/visualizations/phrasecloud?date=2026-09-01", headers=headers
    ).json()
    assert vacio == [], vacio
