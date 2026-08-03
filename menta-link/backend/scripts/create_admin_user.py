"""
Script para crear un usuario ADMIN de prueba.
Ejecución: python scripts/create_admin_user.py
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from app.core.config import settings

# Configurar conexión a BD
DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI
engine = create_engine(DATABASE_URL, echo=False)

# Contexto para hashear contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin():
    """Crea un usuario admin de prueba"""
    
    try:
        with engine.connect() as conn:
            with conn.begin():
                # Actualizar admin viejo de .test a .edu.bo si existe
                conn.execute(text("UPDATE users SET email = 'admin@unifranz.edu.bo' WHERE email = 'admin@unifranz.test'"))
                
                # Datos del admin
                email = "admin@unifranz.edu.bo"
                password = "Admin123!"
                full_name = "Administrador MenTaLink"
                
                # Hashear contraseña
                hashed_password = pwd_context.hash(password)
                
                # Verificar si ya existe
                result = conn.execute(
                    text("SELECT id, email FROM users WHERE email = :email"),
                    {"email": email}
                )
                existing = result.fetchone()
                
                if existing:
                    print(f"⚠️ Admin ya existe: {email}. Actualizando contraseña a Admin123!...")
                    conn.execute(
                        text("UPDATE users SET hashed_password = :hashed_password, role = :role, is_active = :is_active WHERE id = :id"),
                        {
                            "hashed_password": hashed_password,
                            "role": "ADMIN",
                            "is_active": True,
                            "id": existing[0]
                        }
                    )
                    print("✅ CONTRASEÑA DE ADMIN ACTUALIZADA EXITOSAMENTE")
                    return
                
                # Crear usuario
                conn.execute(
                    text("""
                        INSERT INTO users (full_name, email, hashed_password, role, is_active, is_email_verified, must_change_password)
                        VALUES (:full_name, :email, :hashed_password, :role, :is_active, :is_email_verified, :must_change_password)
                    """),
                    {
                        "full_name": full_name,
                        "email": email,
                        "hashed_password": hashed_password,
                        "role": "ADMIN",
                        "is_active": True,
                        "is_email_verified": True,
                        "must_change_password": False,
                    }
                )
                
                print("✅ USUARIO ADMIN CREADO EXITOSAMENTE")
                print("=" * 50)
                print(f"📧 Email:       {email}")
                print(f"🔑 Contraseña:  {password}")
                print(f"👤 Nombre:      {full_name}")
                print(f"👑 Rol:         ADMIN")
                print("=" * 50)
                print("\n✨ Datos de Login:")
                print(f"   Email: admin@unifranz.edu.bo")
                print(f"   Password: Admin123!")
                print("\n🎯 El admin puede:")
                print("   ✓ Ver dashboard con gráfico de regresión lineal")
                print("   ✓ Gestionar usuarios")
                print("   ✓ Ver reportes globales")
                print("   ✓ Acceder a todas las alertas")
                print("\n🚀 Pasos siguientes:")
                print("   1. Inicia sesión en http://localhost:3000")
                print("   2. Usa las credenciales de arriba")
                print("   3. Ve al dashboard")
                print("   4. Verás el gráfico de regresión lineal")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise
    finally:
        engine.dispose()

if __name__ == "__main__":
    print("🔄 Creando usuario ADMIN...\n")
    create_admin()
