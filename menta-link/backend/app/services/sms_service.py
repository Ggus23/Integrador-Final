import base64
import json
import logging
import urllib.error
import urllib.request
from abc import ABC, abstractmethod
from urllib.parse import urlencode

from app.core.config import settings

logger = logging.getLogger(__name__)


class SmsService(ABC):
    @abstractmethod
    def send_otp(self, phone_number: str, code: str) -> bool:
        pass


class MockSmsService(SmsService):
    """
    Servicio de desarrollo que falla de forma explícita cuando no hay proveedor
    SMS configurado. Nunca debe simular un envío exitoso en producción.
    """

    def send_otp(self, phone_number: str, code: str) -> bool:
        logger.error("SMS provider is not configured; OTP was not sent")
        return False


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


class InfobipSmsService(SmsService):
    """Envío de SMS mediante la API HTTP de Infobip."""

    def send_otp(self, phone_number: str, code: str) -> bool:
        base_url = settings.INFOBIP_BASE_URL.rstrip("/")
        api_key = settings.INFOBIP_API_KEY
        sender = settings.INFOBIP_FROM_NUMBER

        if not (base_url and api_key and sender):
            logger.error("Infobip no está configurado correctamente.")
            return False

        payload = json.dumps(
            {
                "messages": [
                    {
                        "from": sender,
                        "destinations": [{"to": phone_number}],
                        "text": (
                            f"MENTA-LINK: tu código de verificación es {code}. "
                            f"Válido por {settings.OTP_EXPIRE_MINUTES} minutos."
                        ),
                    }
                ]
            }
        ).encode("utf-8")
        headers = {
            "Authorization": f"App {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        try:
            request = urllib.request.Request(
                f"{base_url}/sms/2/text/advanced",
                data=payload,
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(request, timeout=10) as response:
                if response.status in (200, 201, 202):
                    logger.info("SMS OTP enviado mediante Infobip")
                    return True
                logger.error("Infobip devolvió estado HTTP: %s", response.status)
                return False
        except urllib.error.HTTPError as error:
            logger.error("Infobip rechazó el SMS: HTTP %s", error.code)
            return False
        except Exception:
            logger.exception("Error enviando SMS mediante Infobip")
            return False


def get_sms_service() -> SmsService:
    if settings.SMS_ENABLED and settings.SMS_PROVIDER.lower() == "twilio":
        return TwilioSmsService()
    if settings.SMS_ENABLED and settings.SMS_PROVIDER.lower() == "infobip":
        return InfobipSmsService()
    if settings.SMS_ENABLED:
        logger.error("Proveedor SMS no soportado: %s", settings.SMS_PROVIDER)
    return MockSmsService()


sms_service = get_sms_service()


def reset_sms_service() -> None:
    """Re-crea el servicio (útil para tests y hot-reload)."""
    global sms_service
    sms_service = get_sms_service()
