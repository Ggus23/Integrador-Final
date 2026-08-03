"""
Script to change the password of a user in the database.
Usage:
  python scripts/change_password.py --email admin@unifranz.edu.bo --password NewPassword123!
"""

import sys
import os
import argparse
import secrets
import string

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from app.core.config import settings

DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI
engine = create_engine(DATABASE_URL, echo=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_random_password(length=12):
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(characters) for _ in range(length))

def main():
    parser = argparse.ArgumentParser(description="Change a user's password in the database.")
    parser.add_argument("--email", type=str, default="admin@unifranz.edu.bo", help="User email address")
    parser.add_argument("--password", type=str, help="New password (optional, a random secure password will be generated if not provided)")
    
    args = parser.parse_args()
    
    email = args.email
    password = args.password
    
    if not password:
        password = generate_random_password()
        print(f"🔑 No password provided. Generating a random secure password...")
        
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
                    print(f"⚠️ User '{email}' not found. Let's check if another admin email exists...")
                    # Let's list some users so the admin knows what emails are available
                    users_result = conn.execute(text("SELECT email, role FROM users LIMIT 10"))
                    existing_users = users_result.fetchall()
                    if existing_users:
                        print("Existing users in database:")
                        for u in existing_users:
                            print(f" - {u[0]} ({u[1]})")
                    else:
                        print("No users found in database.")
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
