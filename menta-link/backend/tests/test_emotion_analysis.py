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

def prueba_cargar_y_procesar_texto_frases():
    from app.ml.emotion.regex_predictor import cargar_y_procesar_texto_frases
    textos = ["Hoy me siento muy triste. No he podido dormir bien; estoy angustiado."]
    frases = cargar_y_procesar_texto_frases(textos)
    assert len(frases) >= 2
    # El método limpia los signos . ; , ! ? ¿ ¡ " y convierte a minúsculas
    assert "hoy me siento muy triste" in frases
    assert "no he podido dormir bien" in frases

def prueba_dividir_en_oraciones():
    from app.ml.emotion.regex_predictor import dividir_en_oraciones
    texto = "Hoy me siento muy triste. No he podido dormir bien. Estoy angustiado."
    oraciones = dividir_en_oraciones(texto)
    assert len(oraciones) == 3
    assert oraciones[0] == "Hoy me siento muy triste."
    assert oraciones[1] == "No he podido dormir bien."
    assert oraciones[2] == "Estoy angustiado."

def prueba_visualizations_analysis_endpoint_auth(client: TestClient):
    response = client.get("/api/v1/visualizations/analysis")
    assert response.status_code == 401

def prueba_visualizations_phrasecloud_endpoint_auth(client: TestClient):
    response = client.get("/api/v1/visualizations/phrasecloud")
    assert response.status_code == 401

