from enum import Enum


class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

    @classmethod
    def from_str(cls, value: str) -> "RiskLevel":
        """Case-insensitive lookup so legacy strings like 'low' still work."""
        normalized = value.strip().capitalize()
        for member in cls:
            if member.value == normalized:
                return member
        return cls.LOW

    def encode(self) -> int:
        """Numeric encoding for ML feature use."""
        return {
            RiskLevel.LOW: 0,
            RiskLevel.MEDIUM: 1,
            RiskLevel.HIGH: 2,
            RiskLevel.CRITICAL: 3,
        }[self]


class AssessmentType(str, Enum):
    PSS = "PSS-10"
    DASS_21 = "DASS-21"
    GAD_7 = "GAD-7"
    PHQ_9 = "PHQ-9"


# PHQ-9 question key whose value > 0 triggers an immediate CRITICAL alert.
PHQ9_CRITICAL_ITEM_KEY = "q9"
