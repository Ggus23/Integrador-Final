import base64
import json
import logging
import urllib.error
import urllib.request
from abc import ABC, abstractmethod
from typing import Optional
from urllib.parse import urlencode

from app.core.config import settings

logger = logging.getLogger(__name__)


class SmsService(ABC):
    @abstractmethod
    def send_otp(self, phone_number: str, code: str) -> bool:
        pass


class MockSmsService(SmsService):
    """
    En desarrollo sin proveedor SMS configurado, imprime el código OTP en
    consola/logs para que el flujo completo pueda probarse localmente.
    """

    def send_otp(self, phone_number: str, code: str) -> bool:
        logger.warning(f"SMS_MOCK: Sending OTP {code} to {phone_number}")
        print(f"SMS_MOCK: Codigo de verificacion para {phone_number}: {code}", flush=True)
        return True


class TwilioSmsService(SmsService):
    """
    Envío de SMS vía Twilio REST API usando únicamente urllib (sin SDK),
    para no introducir dependencias adicionales.
    """

    def send_otp(self, phone_number: str, code: str) -> bool:
        account_sid = settings.TWILIO_ACCOUNT_SID
        auth_token = settings.TWILIO_AUTH_TOKEN
        from_number = settings.TWILIO_FROM_NUMBER

        if not (account_sid and auth_token and from_number):
            logger.error("Twilio no está configurado correctamente.")
            return False

        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        payload = urlencode(
            {
                "To": phone_number,
                "From": from_number,
                "Body": (
                    f"MENTA-LINK: tu código de verificación es {code}. "
                    f"Válido por {settings.OTP_EXPIRE_MINUTES} minutos. "
                    "No lo compartas con nadie."
                ),
            }
        ).encode("utf-8")

        credentials = f"{account_sid}:{auth_token}"
        auth_header = "Basic " + base64.b64encode(credentials.encode()).decode()

        headers = {
            "Authorization": auth_header,
            "Content-Type": "application/x-www-form-urlencoded",
        }

        try:
            req = urllib.request.Request(url, data=payload, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status in (200, 201):
                    logger.info(f"SMS enviado exitosamente a {phone_number} vía Twilio")
                    return True
                logger.error(f"Twilio devolvió estado HTTP: {response.status}")
                return False
        except urllib.error.HTTPError as e:
            try:
                error_body = e.read().decode("utf-8")
            except Exception:  # noqa: BLE001
                error_body = ""
            logger.error(f"Failed to send SMS via Twilio: {e.code} - {error_body}")
            return False
        except Exception as e:  # noqa: BLE001
            logger.error(f"Failed to send SMS via Twilio: {str(e)}")
            return False


def get_sms_service() -> SmsService:
    if settings.SMS_ENABLED:
        return TwilioSmsService()
    return MockSmsService()


sms_service = get_sms_service()


def reset_sms_service() -> None:
    """Re-crea el servicio (útil para tests y hot-reload)."""
    global sms_service
    sms_service = get_sms_service()