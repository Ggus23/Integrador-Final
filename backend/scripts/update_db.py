from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.user import User, UserRole

db = SessionLocal()

# 1. Update Agustin Pacar (ID 7)
agustin = db.query(User).filter(User.id == 7).first()
if agustin:
    old_email = agustin.email
    agustin.email = "lexontroper@gmail.com"
    print(f"Updated user ID 7 (Agustin Pacar): {old_email} -> {agustin.email}")
else:
    print("User ID 7 not found!")

# 2. Flush to make sure email is free (transactional)
db.flush()

# 3. Create new Admin
admin_email = "pacaragustin@gmail.com"
existing_admin = db.query(User).filter(User.email == admin_email).first()

if not existing_admin:
    new_admin = User(
        full_name="Admin Agustin",
        email=admin_email,
        hashed_password=get_password_hash("Admin123"),
        role=UserRole.ADMIN,
        is_active=True,
        is_email_verified=True,
    )
    db.add(new_admin)
    print(f"Created new admin: {admin_email}")
else:
    print(f"Admin with email {admin_email} already exists!")

db.commit()
db.close()
print("Database changes committed.")
