from datetime import datetime

import pytz


def get_current_utc_time() -> datetime:
    """Returns the current time in UTC."""
    return datetime.now(pytz.utc)


def convert_to_utc(dt: datetime) -> datetime:
    """Converts a naive datetime or timezone-aware datetime to UTC."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=pytz.utc)
    return dt.astimezone(pytz.utc)
