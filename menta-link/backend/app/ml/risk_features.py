from typing import Any

import pandas as pd

FEATURE_COLUMNS = [
    "pss_score",
    "gad7_score",
    "phq9_score",
    "mood_avg",
    "bad_days_count",
    "academic_pressure_avg",
]

FEATURE_RANGES = {
    "pss_score": (0, 40),
    "gad7_score": (0, 21),
    "phq9_score": (0, 27),
    "mood_avg": (1, 5),
    "bad_days_count": (0, 7),
    "academic_pressure_avg": (1, 5),
}
TARGET_COLUMN = "risk_level"
RISK_LABELS = {"low": "Low", "medium": "Medium", "high": "High"}


def validate_training_data(data: pd.DataFrame) -> pd.DataFrame:
    required_columns = [*FEATURE_COLUMNS, TARGET_COLUMN]
    missing_columns = [column for column in required_columns if column not in data]
    if missing_columns:
        raise ValueError(
            f"Training data is missing required columns: {missing_columns}"
        )

    validated = data[required_columns].copy()
    for column, (minimum, maximum) in FEATURE_RANGES.items():
        original = validated[column]
        numeric = pd.to_numeric(original, errors="coerce")
        invalid_values = original.notna() & numeric.isna()
        if invalid_values.any():
            raise ValueError(f"{column} contains non-numeric values")
        observed = numeric.dropna()
        if observed.empty:
            raise ValueError(f"{column} must contain at least one observed score")
        if not observed.between(minimum, maximum).all():
            raise ValueError(
                f"{column} scores must be within the range {minimum} to {maximum}"
            )
        if column in {"pss_score", "gad7_score", "phq9_score", "bad_days_count"}:
            if not observed.mod(1).eq(0).all():
                raise ValueError(f"{column} scores must be whole numbers")
        validated[column] = numeric

    labels = validated[TARGET_COLUMN].astype("string").str.strip().str.casefold()
    invalid_labels = labels.isna() | ~labels.isin(RISK_LABELS)
    if invalid_labels.any():
        raise ValueError("risk_level must contain only Low, Medium, or High labels")
    validated[TARGET_COLUMN] = labels.map(RISK_LABELS).astype(str)

    return validated


def as_feature_record(
    pss_score: float | None,
    gad7_score: float | None,
    phq9_score: float | None,
    mood_avg: float,
    bad_days_count: int,
    academic_pressure_avg: float,
) -> dict[str, Any]:
    return {
        "pss_score": pss_score,
        "gad7_score": gad7_score,
        "phq9_score": phq9_score,
        "mood_avg": mood_avg,
        "bad_days_count": bad_days_count,
        "academic_pressure_avg": academic_pressure_avg,
    }
