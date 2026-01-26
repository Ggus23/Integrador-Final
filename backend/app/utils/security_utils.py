import secrets
import string


def generate_random_token(length: int = 32) -> str:
    """Generates a secure random token."""
    return secrets.token_urlsafe(length)


def generate_strong_password(length: int = 12) -> str:
    """Generates a secure random password."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return "".join(secrets.choice(alphabet) for i in range(length))
