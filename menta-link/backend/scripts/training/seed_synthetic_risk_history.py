"""Seed local ai_predictions with explicitly synthetic RiskClassifier observations."""

import argparse
import math
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import numpy as np
from sqlalchemy.engine import make_url

BACKEND_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND_DIR))

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import SessionLocal, engine
from app.models.ai_prediction import AIPrediction
from app.models.user import User, UserRole

SYNTHETIC_EMAIL_PREFIX = "risk-demo-student-"
SYNTHETIC_MODEL_NAME = "RiskClassifierSyntheticDemo"
MIN_ROWS = 1000
MAX_ROWS = 2000


def _require_local_database() -> bool:
    url = make_url(str(settings.SQLALCHEMY_DATABASE_URI))
    if url.drivername.startswith("sqlite"):
        if not url.database or url.database == ":memory:":
            raise RuntimeError(
                "Synthetic seeding requires a persistent local SQLite database."
            )
        database_path = Path(url.database).resolve()
        if not database_path.is_relative_to((BACKEND_DIR / "data").resolve()):
            raise RuntimeError(
                "Synthetic SQLite databases must be stored under backend/data."
            )
        return True
    if url.host not in {"localhost", "127.0.0.1", "::1"}:
        raise RuntimeError(
            "Synthetic seeding is restricted to a local database; "
            f"configured host is {url.host!r}."
        )
    return False


def _correlated_observation(
    rng: np.random.Generator,
    distress: float,
    academic_strain: float,
) -> dict[str, float | int]:
    pss = int(
        np.clip(
            round(19 + 8.5 * distress + 3.2 * academic_strain + rng.normal(0, 5)),
            0,
            40,
        )
    )
    gad7 = int(
        np.clip(
            round(6 + 4.8 * distress + 1.8 * academic_strain + rng.normal(0, 3.2)),
            0,
            21,
        )
    )
    phq9 = int(
        np.clip(
            round(6 + 5.5 * distress + 1.5 * academic_strain + rng.normal(0, 3.8)),
            0,
            27,
        )
    )
    mood = float(
        np.clip(
            round(3.7 - 0.62 * distress - 0.32 * academic_strain + rng.normal(0, 0.65)),
            1,
            5,
        )
    )
    bad_days = int(
        np.clip(
            round((5 - mood) * 1.5 + 0.55 * distress + rng.normal(0, 0.8)),
            0,
            7,
        )
    )
    pressure = float(
        np.clip(
            round(2.7 + 0.56 * academic_strain + 0.22 * distress + rng.normal(0, 0.55)),
            1,
            5,
        )
    )
    return {
        "pss_score": pss,
        "gad_score": gad7,
        "phq_score": phq9,
        "mood_avg": mood,
        "bad_days_count": bad_days,
        "academic_pressure_avg": pressure,
    }


def seed_synthetic_history(
    row_count: int = 1500,
    seed: int = 42,
    create_sqlite_schema: bool = False,
) -> int:
    if not MIN_ROWS <= row_count <= MAX_ROWS:
        raise ValueError(f"row_count must be between {MIN_ROWS} and {MAX_ROWS}")
    is_sqlite = _require_local_database()
    if is_sqlite:
        sqlite_path = Path(make_url(str(settings.SQLALCHEMY_DATABASE_URI)).database)
        if not sqlite_path.is_absolute():
            sqlite_path = BACKEND_DIR / sqlite_path
        sqlite_path.parent.mkdir(parents=True, exist_ok=True)
    if create_sqlite_schema:
        if not is_sqlite:
            raise ValueError("--create-sqlite-schema requires a SQLite database URL")
        from app.db.base import Base

        Base.metadata.create_all(bind=engine)

    rng = np.random.default_rng(seed)
    user_count = math.ceil(row_count / 6)
    observations_per_user = np.full(user_count, row_count // user_count, dtype=int)
    observations_per_user[: row_count % user_count] += 1
    password_hash = get_password_hash(rng.bytes(32).hex())

    with SessionLocal() as db:
        users = (
            db.query(User)
            .filter(User.email.like(f"{SYNTHETIC_EMAIL_PREFIX}%@invalid.example"))
            .order_by(User.email)
            .all()
        )
        while len(users) < user_count:
            ordinal = len(users) + 1
            user = User(
                email=f"{SYNTHETIC_EMAIL_PREFIX}{ordinal:04d}@invalid.example",
                full_name=f"DEMO SYNTHETIC STUDENT {ordinal:04d}",
                hashed_password=password_hash,
                role=UserRole.STUDENT,
                is_active=False,
                is_email_verified=True,
            )
            db.add(user)
            users.append(user)
        db.flush()
        synthetic_user_ids = [user.id for user in users[:user_count]]

        (
            db.query(AIPrediction)
            .filter(
                AIPrediction.model_name == SYNTHETIC_MODEL_NAME,
                AIPrediction.user_id.in_(synthetic_user_ids),
            )
            .delete(synchronize_session=False)
        )

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        records = []
        for user_id, count in zip(synthetic_user_ids, observations_per_user):
            student_distress = float(rng.normal(0, 1))
            academic_strain = float(rng.normal(0, 1))
            for _ in range(int(count)):
                features = _correlated_observation(
                    rng,
                    student_distress + rng.normal(0, 0.28),
                    academic_strain + rng.normal(0, 0.32),
                )
                observed_at = now - timedelta(
                    days=int(rng.integers(0, 300)),
                    hours=int(rng.integers(0, 24)),
                )
                records.append(
                    AIPrediction(
                        user_id=user_id,
                        model_name=SYNTHETIC_MODEL_NAME,
                        model_version="synthetic-thesis-v1",
                        pss_score=features["pss_score"],
                        gad_score=features["gad_score"],
                        phq_score=features["phq_score"],
                        mood_avg=features["mood_avg"],
                        bad_days_count=features["bad_days_count"],
                        academic_pressure_avg=features["academic_pressure_avg"],
                        risk_level="SYNTHETIC",
                        created_at=observed_at,
                    )
                )
        db.add_all(records)
        db.commit()

    return row_count


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rows", type=int, default=1500)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--create-sqlite-schema",
        action="store_true",
        help="Create the ORM schema for a new local SQLite thesis-demo database",
    )
    args = parser.parse_args()
    total = seed_synthetic_history(
        args.rows,
        args.seed,
        create_sqlite_schema=args.create_sqlite_schema,
    )
    print(
        f"Inserted {total} synthetic observations for "
        f"{math.ceil(total / 6)} demo students."
    )
