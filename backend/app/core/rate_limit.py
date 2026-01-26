from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize the limiter with the remote address as the key
limiter = Limiter(key_func=get_remote_address)

# Default limits can be configured here
# e.g., limiter.limit("5/minute")(route_handler)
