from app.core.security import get_password_hash
from app.models.user import User, UserRole


def prueba_creacion_psicologo_por_admin(client, db_session):
    admin_data = {
        "email": "admin_maker@gmail.com",
        "hashed_password": get_password_hash("AdminPass123"),
        "full_name": "Admin Maker",
        "role": UserRole.ADMIN,
        "is_active": True,
        "is_email_verified": True,
    }

    admin = User(**admin_data)
    db_session.add(admin)
    db_session.commit()

    login_res = client.post(
        "/api/v1/auth/login",
        data={"username": admin_data["email"], "password": "AdminPass123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    psy_payload = {
        "full_name": "Dr. Psych",
        "email": "psych@gmail.com",
        "password": "Password123",
        "role": "psychologist",
    }

    response = client.post("/api/v1/users/internal", json=psy_payload, headers=headers)
    assert response.status_code == 201

    data = response.json()
    assert data["role"] == "psychologist"
    assert data["email"] == "psych@gmail.com"

    user_db = db_session.query(User).filter(User.email == "psych@gmail.com").first()
    assert user_db is not None
    assert user_db.role == UserRole.PSYCHOLOGIST
    assert user_db.is_active is True
    assert user_db.is_email_verified is True


def prueba_registro_publico_bloquea_psicologo(client):
    payload = {
        "full_name": "Hacker",
        "email": "hacker@gmail.com",
        "password": "Password123",
        "role": "psychologist",
    }
    response = client.post("/api/v1/users/", json=payload)
    assert response.status_code == 422
    assert "Solo se permite el registro de estudiantes" in response.text


def prueba_admin_confirma_telefono_de_usuario(client, db_session):
    admin = User(
        email="phone_admin@gmail.com",
        hashed_password=get_password_hash("AdminPass123"),
        full_name="Phone Admin",
        role=UserRole.ADMIN,
        is_active=True,
        is_email_verified=True,
    )
    patient = User(
        email="phone_patient@unifranz.edu.bo",
        hashed_password=get_password_hash("PatientPass123"),
        full_name="Phone Patient",
        role=UserRole.STUDENT,
        phone_number="+59179717725",
        is_phone_verified=False,
    )
    psychologist = User(
        email="phone_psychologist@gmail.com",
        hashed_password=get_password_hash("PsychPass123"),
        full_name="Phone Psychologist",
        role=UserRole.PSYCHOLOGIST,
        is_active=True,
        is_email_verified=True,
    )
    db_session.add_all([admin, psychologist, patient])
    db_session.commit()

    psychologist_login = client.post(
        "/api/v1/auth/login",
        data={"username": psychologist.email, "password": "PsychPass123"},
    )
    psychologist_headers = {
        "Authorization": f"Bearer {psychologist_login.json()['access_token']}"
    }
    review_response = client.patch(
        f"/api/v1/users/{patient.id}/phone-verification",
        headers=psychologist_headers,
    )
    assert review_response.status_code == 200
    assert review_response.json()["phone_verification_status"] == "verified"
    assert review_response.json()["phone_reviewed_by_id"] == psychologist.id


def prueba_psicologo_agenda_cita_para_estudiante(client, db_session):
    from app.models.appointment import AppointmentStatus

    psychologist = User(
        email="appointment_psychologist@gmail.com",
        hashed_password=get_password_hash("PsychPass123"),
        full_name="Appointment Psychologist",
        role=UserRole.PSYCHOLOGIST,
        is_active=True,
        is_email_verified=True,
    )
    student = User(
        email="appointment_student@unifranz.edu.bo",
        hashed_password=get_password_hash("StudentPass123"),
        full_name="Appointment Student",
        role=UserRole.STUDENT,
        is_active=True,
        is_email_verified=True,
    )
    db_session.add_all([psychologist, student])
    db_session.commit()

    login_res = client.post(
        "/api/v1/auth/login",
        data={
            "username": psychologist.email,
            "password": "PsychPass123",
        },
    )
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}
    response = client.post(
        f"/api/v1/appointments/student/{student.id}",
        json={
            "appointment_date": "2030-01-15T15:00:00Z",
            "reason": "Seguimiento acordado por llamada",
        },
        headers=headers,
    )

    assert response.status_code == 201
    assert response.json()["user_id"] == student.id
    assert response.json()["psychologist_id"] == psychologist.id
    assert response.json()["status"] == AppointmentStatus.CONFIRMED.value
