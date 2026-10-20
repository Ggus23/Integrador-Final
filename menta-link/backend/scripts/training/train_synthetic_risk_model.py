"""Train a calibrated Random Forest for the thesis-only synthetic cohort."""

import argparse
import json
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    brier_score_loss,
    classification_report,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import GroupShuffleSplit, StratifiedGroupKFold
from sklearn.pipeline import Pipeline

BACKEND_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND_DIR))

from app.ml.risk_features import FEATURE_COLUMNS, FEATURE_RANGES
from scripts.training.consolidate_synthetic_dropout_labels import TARGET_SOURCE

DEFAULT_DATA = BACKEND_DIR / "data" / "synthetic_thesis_training.csv"
DEFAULT_MODEL = BACKEND_DIR / "app" / "models" / "risk_model_synthetic_demo.joblib"
TARGET_COLUMN = "desertor"
GROUP_COLUMN = "synthetic_student_id"


def _load_training_data(path: str | Path) -> pd.DataFrame:
    data = pd.read_csv(path)
    required = {
        *FEATURE_COLUMNS,
        TARGET_COLUMN,
        GROUP_COLUMN,
        "synthetic_target_source",
    }
    missing = sorted(required.difference(data.columns))
    if missing:
        raise ValueError(f"Synthetic training data is missing columns: {missing}")
    if set(data["synthetic_target_source"].dropna()) != {TARGET_SOURCE}:
        raise ValueError("Dataset target source is not the expected synthetic rule")
    if data[["synthetic_target_source", GROUP_COLUMN]].isna().any().any():
        raise ValueError("Synthetic provenance and student groups cannot be blank")

    for column, (minimum, maximum) in FEATURE_RANGES.items():
        data[column] = pd.to_numeric(data[column], errors="coerce")
        if (
            data[column].isna().any()
            or not data[column].between(minimum, maximum).all()
        ):
            raise ValueError(f"{column} must be numeric and within {minimum}–{maximum}")
    for column in ("pss_score", "gad7_score", "phq9_score", "bad_days_count"):
        if not data[column].mod(1).eq(0).all():
            raise ValueError(f"{column} values must be whole numbers")

    labels = pd.to_numeric(data[TARGET_COLUMN], errors="coerce")
    if labels.isna().any() or not labels.isin((0, 1)).all():
        raise ValueError("desertor must contain only binary values 0 or 1")
    data[TARGET_COLUMN] = labels.astype(int)
    if data[TARGET_COLUMN].nunique() != 2:
        raise ValueError("Synthetic training data must contain both target classes")
    return data


def _grouped_train_test_split(
    features: pd.DataFrame,
    labels: pd.Series,
    groups: pd.Series,
) -> tuple[pd.Series, pd.Series]:
    for split_seed in range(100):
        splitter = GroupShuffleSplit(
            n_splits=1,
            test_size=0.2,
            random_state=split_seed,
        )
        train_index, test_index = next(splitter.split(features, labels, groups))
        train_classes = labels.iloc[train_index]
        test_classes = labels.iloc[test_index]
        train_groups_by_class = (
            pd.DataFrame({"group": groups.iloc[train_index], "target": train_classes})
            .drop_duplicates()
            .groupby("target")["group"]
            .nunique()
        )
        if (
            train_classes.nunique() == 2
            and test_classes.nunique() == 2
            and train_groups_by_class.min() >= 2
        ):
            return (
                pd.Series(train_index),
                pd.Series(test_index),
            )
    raise ValueError(
        "Could not create student-separated train/test sets with both classes. "
        "Seed more synthetic students with both labels."
    )


def train_synthetic_model(
    data_path: str | Path = DEFAULT_DATA,
    model_path: str | Path = DEFAULT_MODEL,
) -> dict[str, float]:
    data = _load_training_data(data_path)
    features = data[FEATURE_COLUMNS]
    labels = data[TARGET_COLUMN]
    groups = data[GROUP_COLUMN]
    train_index, test_index = _grouped_train_test_split(features, labels, groups)
    x_train, x_test = features.iloc[train_index], features.iloc[test_index]
    y_train, y_test = labels.iloc[train_index], labels.iloc[test_index]
    train_groups = groups.iloc[train_index]

    distinct_groups_per_class = (
        pd.DataFrame({"group": train_groups, "target": y_train})
        .drop_duplicates()
        .groupby("target")["group"]
        .nunique()
    )
    folds = min(5, int(distinct_groups_per_class.min()))
    cross_validator = StratifiedGroupKFold(
        n_splits=folds,
        shuffle=True,
        random_state=42,
    )
    calibration_splits = list(
        cross_validator.split(x_train, y_train, groups=train_groups)
    )
    base_estimator = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=250,
                    min_samples_leaf=3,
                    class_weight="balanced_subsample",
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )
    model = CalibratedClassifierCV(
        estimator=base_estimator,
        method="sigmoid",
        cv=calibration_splits,
    )
    model.fit(x_train, y_train)

    positive_index = list(model.classes_).index(1)
    probabilities = model.predict_proba(x_test)[:, positive_index]
    predictions = (probabilities >= 0.5).astype(int)
    metrics = {
        "roc_auc": float(roc_auc_score(y_test, probabilities)),
        "brier_score": float(brier_score_loss(y_test, probabilities)),
        "f1_at_0_5": float(f1_score(y_test, predictions, zero_division=0)),
        "train_rows": int(len(x_train)),
        "test_rows": int(len(x_test)),
        "train_students": int(train_groups.nunique()),
        "test_students": int(groups.iloc[test_index].nunique()),
    }
    print("Synthetic holdout metrics (not evidence of real-world performance):")
    print(json.dumps(metrics, indent=2))
    print(
        classification_report(
            y_test,
            predictions,
            labels=[0, 1],
            target_names=["No synthetic dropout", "Synthetic dropout"],
            zero_division=0,
        )
    )

    metadata = {
        "synthetic": True,
        "target": "desertor_synthetic",
        "target_source": TARGET_SOURCE,
        "feature_columns": FEATURE_COLUMNS,
        "calibration": "sigmoid",
        "test_split": "GroupShuffleSplit by synthetic student",
        "metrics": metrics,
        "warning": (
            "Demonstration artifact trained on generated features and generated "
            "labels. Never use for real student assessment or clinical decisions."
        ),
    }
    artifact = {
        "model": model,
        "feature_columns": FEATURE_COLUMNS,
        "metadata": metadata,
    }
    destination = Path(model_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, destination)
    metrics_path = destination.with_suffix(".metrics.json")
    metrics_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"Synthetic demo artifact saved to {destination}")
    print(f"Metrics and provenance saved to {metrics_path}")
    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", default=str(DEFAULT_DATA))
    parser.add_argument("--output", default=str(DEFAULT_MODEL))
    args = parser.parse_args()
    train_synthetic_model(args.data, args.output)
