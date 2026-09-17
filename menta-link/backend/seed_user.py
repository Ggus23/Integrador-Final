from passlib.context import CryptContext
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Importa tu modelo y enum directamente desde tu proyecto FastAPI
from app.models.user import (
    User,
    UserRole,
)  # Ajusta la ruta de importación según la carpeta de user.py

# Credenciales exactas obtenidas de tu docker-compose
DATABASE_URL = "postgresql://postgres:postgresql@localhost:5432/mentalink"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_test_user():
    db = SessionLocal()
    try:
        email = "cbbe.agustin.pacar.tr@unifranz.edu.bo"
        hashed = pwd_context.hash("12345678")

        # Buscar si el usuario ya existe
        existing_user = db.query(User).filter(User.email == email).first()

        if existing_user:
            existing_user.is_email_verified = True
            existing_user.is_phone_verified = True
            existing_user.phone_number = "79717725"
            db.commit()
            print(f"¡Usuario {email} actualizado correctamente como verificado!")
            return

        # Insertar usando los atributos exactos de tu modelo user.py
        new_user = User(
            full_name="Agustin Pacar Triveño",
            email=email,
            hashed_password=hashed,
            role=UserRole.STUDENT,
            is_active=True,
            is_email_verified=True,
            phone_number="79717725",
            is_phone_verified=True,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"¡Usuario de prueba verificado creado con éxito! ID: {new_user.id}")

    except Exception as e:
        db.rollback()
        print(f"Error al insertar el usuario: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_test_user()
