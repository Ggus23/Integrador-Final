"""
Script to change the admin password to 12345678.
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from app.core.config import settings

DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI
engine = create_engine(DATABASE_URL, echo=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def main():
    email = "admin@unifranz.edu.bo"
    password = "12345678"
    hashed_password = pwd_context.hash(password)
    
    try:
        with engine.connect() as conn:
            with conn.begin():
                # Check if user exists
                result = conn.execute(
                    text("SELECT id, full_name, role FROM users WHERE email = :email"),
                    {"email": email}
                )
                user = result.fetchone()
                
                if not user:
                    print(f"⚠️ User '{email}' not found.")
                    sys.exit(1)
                
                user_id, full_name, role = user
                
                # Update password
                conn.execute(
                    text("UPDATE users SET hashed_password = :hashed_password, must_change_password = :must_change_password WHERE id = :id"),
                    {
                        "hashed_password": hashed_password,
                        "must_change_password": False,
                        "id": user_id
                    }
                )
                
                print("=" * 60)
                print(f"✅ PASSWORD UPDATED SUCCESSFULLY!")
                print("-" * 60)
                print(f"👤 User:       {full_name} ({role})")
                print(f"📧 Email:      {email}")
                print(f"🔑 Password:   {password}")
                print("=" * 60)
                
    except Exception as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)
    finally:
        engine.dispose()

if __name__ == "__main__":
    main()
