def test_404_not_found(client):
    """
    Test that a non-existent route returns the custom 404 JSON.
    """
    response = client.get("/api/v1/non-existent-route-xyz")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Resource not found"


def test_500_internal_error(client):
    """
    Test that an internal error returns the custom 500 JSON.
    """
    from app.main import app

    @app.get("/force_error")
    def force_error():
        raise ValueError("Simulated failure")

    # We use the app instance but ensure we don't trigger real DB initialization
    # the client fixture already handled dependency overrides.
    # Note: TestClient with app directly will still use the overrides if they are set in the global app object
    # which the 'client' fixture does.

    from fastapi.testclient import TestClient

    test_client_500 = TestClient(app, raise_server_exceptions=False)

    response = test_client_500.get("/force_error")
    assert response.status_code == 500
    data = response.json()
    assert data["detail"] == "Internal server error. Please try again later."
