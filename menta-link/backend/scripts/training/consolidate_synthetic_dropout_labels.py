"""Build a thesis-only dataset with simulated dropout labels."""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sqlalchemy import select

BACKEND_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND_DIR))

from app.db.session import SessionLocal
from app.ml.risk_features import FEATURE_COLUMNS
from app.models.ai_prediction import AIPrediction
from scripts.training.seed_synthetic_risk_history import SYNTHETIC_MODEL_NAME

DB_TO_FEATURE = {
    "pss_score": "pss_score",
    "gad_score": "gad7_score",
    "phq_score": "phq9_score",
    "mood_avg": "mood_avg",
    "bad_days_count": "bad_days_count",
    "academic_pressure_avg": "academic_pressure_avg",
}
TARGET_SOURCE = "synthetic_probability_rule_v1"


def _synthetic_dropout_probability(features: pd.Series) -> float:
    if (
        features["academic_pressure_avg"] > 4
        and features["phq9_score"] > 14
        and features["mood_avg"] < 2
    ):
        return 0.85

    return float(
        min(
            0.03
            + 0.14 * features["phq9_score"] / 27
            + 0.10 * features["gad7_score"] / 21
            + 0.10 * features["pss_score"] / 40
            + 0.10 * features["bad_days_count"] / 7
            + 0.12 * (5 - features["mood_avg"]) / 4
            + 0.12 * (features["academic_pressure_avg"] - 1) / 4,
            0.75,
        )
    )


def consolidate_synthetic_dataset(
    output_path: str | Path,
    seed: int = 42,
) -> pd.DataFrame:
    statement = select(
        AIPrediction.user_id,
        AIPrediction.created_at,
        AIPrediction.pss_score,
        AIPrediction.gad_score,
        AIPrediction.phq_score,
        AIPrediction.mood_avg,
        AIPrediction.bad_days_count,
        AIPrediction.academic_pressure_avg,
    ).where(AIPrediction.model_name == SYNTHETIC_MODEL_NAME)

    with SessionLocal() as db:
        rows = pd.read_sql(statement, db.connection())

    if rows.empty:
        raise ValueError(
            "No synthetic demo observations found. Run "
            "seed_synthetic_risk_history.py first."
        )
    rows = rows.rename(columns=DB_TO_FEATURE)
    rows["synthetic_student_id"] = rows["user_id"].map(
        lambda user_id: f"synthetic-{user_id}"
    )
    for column in FEATURE_COLUMNS:
        rows[column] = pd.to_numeric(rows[column], errors="coerce")
    if rows[FEATURE_COLUMNS].isna().any().any():
        raise ValueError("Synthetic shadow history contains missing model inputs")
    if not rows["mood_avg"].between(1, 5).all():
        raise ValueError("mood_avg must be within the application's 1–5 range")
    if not rows["academic_pressure_avg"].between(1, 5).all():
        raise ValueError(
            "academic_pressure_avg must be within the application's 1–5 range"
        )

    rng = np.random.default_rng(seed)
    probabilities = rows.apply(_synthetic_dropout_probability, axis=1)
    rows["desertor"] = [
        int(rng.random() < probability) for probability in probabilities
    ]
    rows["synthetic_target_source"] = TARGET_SOURCE

    columns = [
        "synthetic_student_id",
        "created_at",
        *FEATURE_COLUMNS,
        "desertor",
        "synthetic_target_source",
    ]
    dataset = rows[columns].sort_values(
        ["synthetic_student_id", "created_at"], kind="stable"
    )
    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    dataset.to_csv(destination, index=False)
    manifest = {
        "synthetic_only": True,
        "target": "desertor",
        "target_source": TARGET_SOURCE,
        "rows": int(len(dataset)),
        "students": int(dataset["synthetic_student_id"].nunique()),
        "positive_rows": int(dataset["desertor"].sum()),
        "students_with_positive_rows": int(
            dataset.loc[dataset["desertor"].eq(1), "synthetic_student_id"].nunique()
        ),
        "rule": (
            "For each synthetic observation: if academic_pressure_avg > 4, "
            "phq9_score > 14, and mood_avg < 2, sample desertor=1 with probability "
            "0.85; otherwise sample from a bounded feature-weighted probability "
            "between 0.03 and 0.75. This is a simulation, not an institutional "
            "dropout label."
        ),
        "features": FEATURE_COLUMNS,
    }
    destination.with_suffix(".manifest.json").write_text(
        json.dumps(manifest, indent=2),
        encoding="utf-8",
    )
    return dataset


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        default=str(BACKEND_DIR / "data" / "synthetic_thesis_training.csv"),
    )
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    result = consolidate_synthetic_dataset(args.output, seed=args.seed)
    print(
        f"Saved {len(result)} synthetic observations for "
        f"{result['synthetic_student_id'].nunique()} students to {args.output}"
    )
    print(f"Synthetic positive rows: {int(result['desertor'].sum())}")
