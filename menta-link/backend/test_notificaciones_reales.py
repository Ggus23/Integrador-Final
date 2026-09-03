import asyncio
import os
import sys

# Añadir el directorio actual al path para poder importar 'app'
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.user import User
from app.services.notifications import send_push_notification


async def disparar_notificacion(email, tipo):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            print(f"❌ Error: No se encontró al usuario con email: {email}")
            return

        if not user.expo_push_token:
            print(f"❌ Error: El usuario {user.full_name} no tiene un token guardado.")
            print(
                "👉 Asegúrate de haber iniciado sesión en la app móvil con este usuario."
            )
            return

        config = {
            "test": {
                "title": "📝 Tests habilitados",
                "body": f"Hola {user.full_name}, tu psicólogo ha habilitado nuevos tests. Entra para completarlos.",
                "data": {"screen": "Stats"},
            },
            "diario": {
                "title": "🔥 ¡No pierdas tu racha!",
                "body": "Aún no has completado tu diario de hoy. Tómate 2 minutos para conectar contigo.",
                "data": {"screen": "Diary"},
            },
            "apoyo": {
                "title": "✨ Un mensaje para ti",
                "body": "Hoy es un gran día para ser amable contigo mismo. ¡Vas muy bien!",
                "data": {"screen": "Profile"},
            },
        }

        print(f"\n🚀 Enviando notificación de tipo '{tipo}' a {user.full_name}...")
        print(f"📱 Token destino: {user.expo_push_token}")

        result = await send_push_notification(
            to=user.expo_push_token,
            title=config[tipo]["title"],
            body=config[tipo]["body"],
            data=config[tipo]["data"],
        )

        if result:
            print("✅ ¡Notificación enviada con éxito!")
            print(f"Respuesta de Expo: {result}")
        else:
            print("⚠️ Hubo un problema al enviar la notificación.")

    finally:
        db.close()


async def main():
    # El correo que vimos en tus logs
    MI_CORREO = "cbbe.agustin.pacar.tr@unifranz.edu.bo"

    print("\n" + "=" * 40)
    print("   SISTEMA DE PRUEBAS MENTALINK PUSH")
    print("=" * 40)
    print(f"Usuario objetivo: {MI_CORREO}")
    print("\nSelecciona el tipo de mensaje:")
    print("1. Notificación de Test (Aviso del Psicólogo)")
    print("2. Recordatorio de Diario (Para evitar perder la racha)")
    print("3. Mensaje de Apoyo (Motivacional)")
    print("q. Salir")

    opcion = input("\nElige una opción (1-3 o q): ").lower()

    tipos = {"1": "test", "2": "diario", "3": "apoyo"}

    if opcion == "q":
        return
    elif opcion in tipos:
        await disparar_notificacion(MI_CORREO, tipos[opcion])
    else:
        print("❌ Opción no válida.")


if __name__ == "__main__":
    asyncio.run(main())
