import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import get_password_hash  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.user import User  # noqa: E402


def fix_dev_hashes():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Checking {len(users)} users...")
        fixed_count = 0

        # For dev context, "profe123", "psico123" etc are known, but we can't guess.
        # So we'll set a default "Reset123!" for invalid ones, or just re-hash if
        # we know the mapping.

        # Mapping email -> expected default password (from seed_data.py)
        default_passwords = {
            "profesor@mentalink.edu": "Profe123!",
            "psicologo@mentalink.edu": "Psico123!",
            "test@gmail.com": "password123",
        }

        for user in users:
            print(f"Checking user: {user.email}")

            # Simple check: does verify_password crash?
            # In our updated code, verify_password() catches exceptions and returns False.
            # So if it's invalid hash, verify_password("anything", hash) returns False.
            # But we want to know if the HASH FORMAT is invalid.
            # verify_password handles that now.

            # If the user is one of our known seeds, let's just force update the hash to be sure.
            if user.email in default_passwords:
                plain = default_passwords[user.email]
                new_hash = get_password_hash(plain)
                if (
                    user.hashed_password != new_hash
                ):  # Simple string check won't work for salt, but we can update anyway
                    print(f"  -> Updating hash for {user.email}")
                    user.hashed_password = new_hash
                    fixed_count += 1
            else:
                # Check if hash looks like argon2/bcrypt
                if not user.hashed_password.startswith(
                    "$argon2"
                ) and not user.hashed_password.startswith("$2b$"):
                    print(
                        f"  -> Invalid hash format detected for {user.email}. Converting plain text?"
                    )
                    # Assuming it might be plain text stored by mistake?
                    # Try to use current value as plain text
                    # Start generic "Reset123!" if we can't recover
                    print("  -> Setting to 'Reset123!'")
                    user.hashed_password = get_password_hash("Reset123!")
                    fixed_count += 1

        db.commit()
        print(f"Fixed {fixed_count} users.")
    finally:
        db.close()


if __name__ == "__main__":
    fix_dev_hashes()
