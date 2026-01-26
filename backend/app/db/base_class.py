from typing import Any

from sqlalchemy.orm import as_declarative, declared_attr


@as_declarative()
class Base:
    """
    Base class for all SQLAlchemy models.
    Automatically generates __tablename__ from class name.
    """

    id: Any
    __name__: str

    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
