import random
from datetime import date, datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.assessment import Assessment
from app.models.assessment_response import AssessmentResponse
from app.models.emotional_checkin import EmotionalCheckin
from app.models.emotional_diary import EmotionalDiary
from app.models.user import User


async def check_all_reminders(db: Session, force_all: bool = False):
    """
    Sistema centralizado de recordatorios con 'Ventanas de Tiempo'
    para evitar saturar al usuario.
    """
    users = db.query(User).filter(User.expo_push_token.isnot(None)).all()
    assessments = db.query(Assessment).all()
    today = date.today()
    current_hour = datetime.now().hour

    messages_to_send = []
    print(
        f"🧠 Procesando reglas (Hora actual: {current_hour}:00) para {len(users)} usuarios..."
    )

    for user in users:
        # --- VENTANA MAÑANA (8:00 - 11:00): APOYO Y BIENESTAR ---
        if force_all or (8 <= current_hour <= 11):
            # Prioridad 1: Apoyo aleatorio
            if force_all or random.random() < 0.2:
                mensajes_apoyo = [
                    "¡Buen día! Recuerda que tu salud mental es lo primero hoy.",
                    "Tómate un respiro antes de empezar tus clases.",
                    "Un pequeño paso hoy es un gran avance mañana.",
                ]
                messages_to_send.append(
                    {
                        "to": user.expo_push_token,
                        "title": "✨ MentaLink: Buenos días",
                        "body": random.choice(mensajes_apoyo),
                        "data": {"screen": "Profile"},
                    }
                )

            # Prioridad 2: Bienestar (si no ha hecho checkin)
            has_checkin = (
                db.query(EmotionalCheckin)
                .filter(
                    EmotionalCheckin.user_id == user.id,
                    func.date(EmotionalCheckin.created_at) == today,
                )
                .first()
            )
            if force_all or not has_checkin:
                messages_to_send.append(
                    {
                        "to": user.expo_push_token,
                        "title": "🌈 ¿Cómo empiezas tu día?",
                        "body": "Registra tu estado de ánimo matutino en un segundo.",
                        "data": {"screen": "Diary"},
                    }
                )

        # --- VENTANA TARDE (13:00 - 17:00): TESTS HABILITADOS ---
        if force_all or (13 <= current_hour <= 17):
            for assessment in assessments:
                last_resp = (
                    db.query(AssessmentResponse)
                    .filter(
                        AssessmentResponse.user_id == user.id,
                        AssessmentResponse.assessment_id == assessment.id,
                    )
                    .order_by(AssessmentResponse.created_at.desc())
                    .first()
                )

                if (
                    force_all
                    or not last_resp
                    or (datetime.now() - last_resp.created_at.replace(tzinfo=None)).days
                    >= 15
                ):
                    messages_to_send.append(
                        {
                            "to": user.expo_push_token,
                            "title": f"📝 Test {assessment.type} disponible",
                            "body": f"Tienes un momento libre? Tu evaluación de {assessment.type} ya está habilitada.",
                            "data": {"screen": "Stats"},
                        }
                    )

        # --- VENTANA NOCHE (19:00 - 23:00): RECORDATORIO DE DIARIO ---
        if force_all or (19 <= current_hour <= 23):
            has_diary_today = (
                db.query(EmotionalDiary)
                .filter(
                    EmotionalDiary.user_id == user.id,
                    func.date(EmotionalDiary.created_at) == today,
                )
                .first()
            )

            if force_all or not has_diary_today:
                messages_to_send.append(
                    {
                        "to": user.expo_push_token,
                        "title": "🌙 Cierra tu día con MentaLink",
                        "body": "No olvides registrar tus experiencias de hoy antes de descansar.",
                        "data": {"screen": "Diary"},
                    }
                )

    # Envío final por lotes
    if messages_to_send:
        print(f"🚀 Enviando {len(messages_to_send)} notificaciones oportunas...")
        from app.services.notifications import send_push_notifications

        await send_push_notifications(messages_to_send)
        print("✅ Todo enviado.")
    else:
        print("📭 No hay notificaciones oportunas para esta hora.")
