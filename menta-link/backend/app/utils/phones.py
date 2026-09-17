import re

_PHONE_CLEAN_RE = re.compile(r"[^\d+]")
_PHONE_PATTERN = re.compile(r"^\+?\d{7,15}$")


def normalize_phone_number(phone: str) -> str | None:
    """
    Normaliza un número de teléfono para su almacenamiento y comparación.

    Devuelve el número limpio (solo dígitos, con '+' inicial opcional) o
    None si el formato es inválido.
    """
    if not phone:
        return None
    cleaned = _PHONE_CLEAN_RE.sub("", phone.strip())
    if not _PHONE_PATTERN.match(cleaned):
        return None
    return cleaned
