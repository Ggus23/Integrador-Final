from slowapi import Limiter
from slowapi.util import get_remote_address

# Global limiter instance to be shared across the application
# Academic Note: Centralizing the rate limiter ensures consistent policy enforcement
# and prevents circular dependency issues between main and routers.
limiter = Limiter(key_func=get_remote_address)
