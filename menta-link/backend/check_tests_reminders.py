import asyncio
import os
import sys

# Añadir el directorio actual al path
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.services.reminders import check_all_reminders


async def main():
    # Detectar si queremos forzar el envío (para pruebas)
    force = "--force" in sys.argv

    print("=" * 50)
    print("🚀 PROCESADOR INTEGRAL DE NOTIFICACIONES MENTALINK")
    if force:
        print("⚠️ MODO DE PRUEBA: Forzando todos los mensajes...")
    print("=" * 50)

    db = SessionLocal()
    try:
        # Ahora llamamos a la función integral
        await check_all_reminders(db, force_all=force)
        print("\n✅ Proceso completado.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
