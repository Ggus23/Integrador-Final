def prueba_error_404_no_encontrado(client):
    response = client.get("/api/v1/ruta-inexistente-xyz")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Resource not found"


def prueba_error_500_interno(client):
    from fastapi.testclient import TestClient

    from app.main import app

    @app.get("/forzar_error")
    def forzar_error():
        raise ValueError("Fallo simulado")

    cliente_prueba_500 = TestClient(app, raise_server_exceptions=False)

    response = cliente_prueba_500.get("/forzar_error")
    assert response.status_code == 500
    data = response.json()
    assert data["detail"] == "Internal server error. Please try again later."
