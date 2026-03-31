import logging
import sys
from typing import Any

# Configure the basic logging format
# Academic Note: Security logging is a core requirement for auditability in systems
# that handle sensitive data like mental health records.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        # In production, this would typically go to a file or a centralized
        # logging service
        # logging.FileHandler("security_audit.log"),
    ],
)

# Shared security logger for tracking authentication and authorization events
security_logger = logging.getLogger("security")


def log_security_event(event_type: str, details: Any, level: int = logging.WARNING):
    """
    Utility to consistently log security-related events.
    Useful for detecting brute-force or unauthorized access patterns in
    bachelor thesis research.
    """
    message = f"SECURITY_EVENT[{event_type}]: {details}"
    security_logger.log(level, message)
