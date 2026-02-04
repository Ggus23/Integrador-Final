from app.models.audit_log import AuditLog
from sqlalchemy.orm import Session


def log_access(
    db: Session,
    actor_id: int,
    action: str,
    resource_id: str = None,
    details: str = None,
):
    """
    Creates an audit log entry.
    Should be called whenever a Staff member accesses sensitive Student data.
    """
    audit_entry = AuditLog(
        actor_id=actor_id, action=action, resource_id=resource_id, details=details
    )
    db.add(audit_entry)
    db.commit()
