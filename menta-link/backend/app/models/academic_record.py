from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class AcademicRecord(Base):
    """
    Model for storing student academic information for dropout prediction.
    As per Revision.txt roadmap.
    """

    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    gpa = Column(Float, default=0.0)  # Promedio Acumulado
    enrolled_credits = Column(Integer, default=0)  # Créditos Inscritos
    failed_classes = Column(Integer, default=0)  # Contador de Materias Reprobadas

    # Semester Hitos (Global for the entire semester)
    # Hito 2: Processual + Milestone
    hito2_procesual = Column(Float, default=0.0)
    hito2_nota = Column(Float, default=0.0)

    # Hito 3: Processual + Milestone
    hito3_procesual = Column(Float, default=0.0)
    hito3_nota = Column(Float, default=0.0)

    # Hito 4: Processual + Milestone
    hito4_procesual = Column(Float, default=0.0)
    hito4_nota = Column(Float, default=0.0)

    # Hito 5: Processual + Milestone
    hito5_procesual = Column(Float, default=0.0)
    hito5_nota = Column(Float, default=0.0)

    # Relación con el User
    user = relationship("User", back_populates="academic_record")
