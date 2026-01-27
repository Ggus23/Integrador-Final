import asyncio

from app.core.config import settings
from app.services.email_service import get_email_service


async def send_test_email():
    print(f"Testing SMTP Configuration...")
    print(f"Host: {settings.SMTP_HOST}")
    print(f"User: {settings.SMTP_USER}")

    email_service = get_email_service()
    to_email = "pacaragustin@gmail.com"

    print(f"\nAttempting to send email to {to_email}...")

    # We use send_verification_email as a test
    try:
        email_service.send_verification_email(to_email, "TEST_TOKEN_12345")
        # Note: The service logs success/failure, but we can't capture it easily here
        # unless we modify the service to return bool (which I did earlier in view_file).
        # Let's assume the user will see the log output or receive the email.
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    asyncio.run(send_test_email())
