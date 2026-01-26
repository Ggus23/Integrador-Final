from enum import Enum


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AssessmentType(str, Enum):
    PSS = "pss"
    DASS_21 = "dass_21"
    GAD_7 = "gad_7"
    PHQ_9 = "phq_9"
