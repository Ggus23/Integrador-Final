import math
from typing import Any


def paginate_query(query: Any, page: int, page_size: int) -> Any:
    """
    Applies pagination to a SQLAlchemy query.
    """
    return query.offset((page - 1) * page_size).limit(page_size)


def calculate_pages(total_items: int, page_size: int) -> int:
    """
    Calculates total number of pages.
    """
    if page_size == 0:
        return 0
    return math.ceil(total_items / page_size)
