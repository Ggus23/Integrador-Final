from app.models.phone_otp import PhoneOTPCode
from app.models.user import User


def prueba_flujo_otp_y_registro(client, db_session, sms_codes):
    phone = "+59171234567"
    email = "otp.student@unifranz.edu.bo"

    # 1. Solicitar código
    response = client.post("/api/v1/auth/request-otp", json={"phone_number": phone})
    assert response.status_code == 200

    code = sms_codes[phone]
    assert code and len(code) == 6 and code.isdigit()

    otp = (
        db_session.query(PhoneOTPCode)
        .filter(PhoneOTPCode.phone_number == phone)
        .first()
    )
    assert otp is not None
    assert otp.used_at is None

    # 2. Verificar con un código incorrecto → 400
    response_bad = client.post(
        "/api/v1/auth/verify-otp",
        json={"phone_number": phone, "code": "000000"},
    )
    assert response_bad.status_code == 400

    # 3. Verificar con el código correcto → token de verificación
    response_ok = client.post(
        "/api/v1/auth/verify-otp",
        json={"phone_number": phone, "code": code},
    )
    assert response_ok.status_code == 200
    token = response_ok.json()["phone_verified_token"]
    assert token

    # 4. Registrar el estudiante con el teléfono verificado
    payload = {
        "full_name": "Estudiante OTP",
        "email": email,
        "password": "Password123",
        "role": "student",
        "phone_number": phone,
        "phone_verified_token": token,
    }
    response_reg = client.post("/api/v1/users/", json=payload)
    assert response_reg.status_code == 201
    data = response_reg.json()
    assert data["email"] == email
    assert data["phone_number"] == phone
    assert data["is_phone_verified"] is True

    user_db = db_session.query(User).filter(User.email == email).first()
    assert user_db is not None
    assert user_db.is_phone_verified is True


def prueba_registro_requiere_telefono(client):
    # Sin número de teléfono → error de validación
    payload_sin_phone = {
        "full_name": "Sin Celular",
        "email": "sinphone@unifranz.edu.bo",
        "password": "Password123",
        "role": "student",
    }
    response = client.post("/api/v1/users/", json=payload_sin_phone)
    assert response.status_code == 422

    # Con teléfono pero sin token de verificación → 400
    payload_sin_token = {
        "full_name": "Sin Token",
        "email": "sintoken@unifranz.edu.bo",
        "password": "Password123",
        "role": "student",
        "phone_number": "71234567",
    }
    response_no_token = client.post("/api/v1/users/", json=payload_sin_token)
    assert response_no_token.status_code == 400
    assert "verificar" in response_no_token.json()["detail"].lower()


def prueba_token_verificacion_tel_incorrecto(client, sms_codes):
    phone = "71223344"
    client.post("/api/v1/auth/request-otp", json={"phone_number": phone})
    code = sms_codes[phone]
    response = client.post(
        "/api/v1/auth/verify-otp",
        json={"phone_number": phone, "code": code},
    )
    token = response.json()["phone_verified_token"]

    # Usar el token con un teléfono distinto al verificado → 400
    payload = {
        "full_name": "Token Ajeno",
        "email": "tokenajeno@unifranz.edu.bo",
        "password": "Password123",
        "role": "student",
        "phone_number": "99887766",
        "phone_verified_token": token,
    }
    response_reg = client.post("/api/v1/users/", json=payload)
    assert response_reg.status_code == 400
    assert "verificación" in response_reg.json()["detail"] or "verificaci" in response_reg.json()[
        "detail"
    ].lower()


def prueba_telefono_duplicado_rechazado(client, db_session, sms_codes):
    phone = "70000001"
    email = "dup@unifranz.edu.bo"

    client.post("/api/v1/auth/request-otp", json={"phone_number": phone})
    code = sms_codes[phone]
    token = client.post(
        "/api/v1/auth/verify-otp",
        json={"phone_number": phone, "code": code},
    ).json()["phone_verified_token"]

    payload = {
        "full_name": "Primero",
        "email": email,
        "password": "Password123",
        "role": "student",
        "phone_number": phone,
        "phone_verified_token": token,
    }
    assert client.post("/api/v1/users/", json=payload).status_code == 201

    # Al solicitar un nuevo OTP del mismo teléfono, el código anterior se invalida
    client.post("/api/v1/auth/request-otp", json={"phone_number": phone})
    new_code = sms_codes[phone]
    assert new_code != code

    token2 = client.post(
        "/api/v1/auth/verify-otp",
        json={"phone_number": phone, "code": new_code},
    ).json()["phone_verified_token"]

    payload2 = {
        "full_name": "Segundo",
        "email": "dup2@unifranz.edu.bo",
        "password": "Password123",
        "role": "student",
        "phone_number": phone,
        "phone_verified_token": token2,
    }
    response = client.post("/api/v1/users/", json=payload2)
    assert response.status_code == 409