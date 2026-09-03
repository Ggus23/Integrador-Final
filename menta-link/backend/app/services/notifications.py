import os
from typing import List, Optional

import httpx

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
# Se puede configurar en el archivo .env del backend
EXPO_ACCESS_TOKEN = os.getenv("EXPO_ACCESS_TOKEN")


async def send_push_notification(
    to: str, title: str, body: str, data: Optional[dict] = None
):
    """
    Sends a push notification to an Expo app using the push token.
    """
    message = {
        "to": to,
        "sound": "default",
        "title": title,
        "body": body,
        "data": data or {},
    }

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if EXPO_ACCESS_TOKEN:
        headers["Authorization"] = f"Bearer {EXPO_ACCESS_TOKEN}"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(EXPO_PUSH_URL, json=message, headers=headers)
            if response.status_code != 200:
                print(f"❌ Error de Expo ({response.status_code}): {response.text}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"❌ Error de red/HTTP: {e}")
            return None


async def send_push_notifications(messages: List[dict]):
    """
    Sends multiple push notifications in chunks of 100 (Expo limit).
    """
    if not messages:
        return []

    # Chunk the messages into groups of 100
    chunks = [messages[i : i + 100] for i in range(0, len(messages), 100)]

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if EXPO_ACCESS_TOKEN:
        headers["Authorization"] = f"Bearer {EXPO_ACCESS_TOKEN}"

    all_results = []
    async with httpx.AsyncClient() as client:
        for chunk in chunks:
            try:
                response = await client.post(EXPO_PUSH_URL, json=chunk, headers=headers)
                if response.status_code != 200:
                    print(
                        f"❌ Error en lote de Expo ({response.status_code}): {response.text}"
                    )
                response.raise_for_status()
                all_results.append(response.json())
            except httpx.HTTPError as e:
                print(f"❌ Error de red en lote: {e}")

    return all_results
