import argparse
import math
import os
import sys

import joblib
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

BACKEND_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
sys.path.insert(0, BACKEND_DIR)

from app.core.config import settings
from app.ml.risk_features import FEATURE_COLUMNS, TARGET_COLUMN, validate_training_data

DATA_PATH = os.path.join(BACKEND_DIR, "data", "processed_training_data.csv")
MODEL_PATH = (
    settings.ML_MODEL_PATH
    if os.path.isabs(settings.ML_MODEL_PATH)
    else os.path.join(BACKEND_DIR, settings.ML_MODEL_PATH)
)
MODEL_CANDIDATE_PATH = os.path.join(
    os.path.dirname(MODEL_PATH),
    f"{os.path.splitext(os.path.basename(MODEL_PATH))[0]}_candidate.pkl",
)


def train_model(data_path: str = DATA_PATH, model_path: str = MODEL_PATH) -> None:
    if not os.path.exists(data_path):
        raise FileNotFoundError(
            f"Verified risk training data not found: {data_path}. "
            "Provide an anonymized dataset with verified risk_level labels."
        )

    data = validate_training_data(pd.read_csv(data_path))
    class_counts = data[TARGET_COLUMN].value_counts()
    if len(class_counts) < 2 or (class_counts < 2).any():
        raise ValueError(
            "Training data must contain at least two risk classes with two or more "
            "records per class for a stratified train/test split."
        )

    test_size = max(len(class_counts), math.ceil(len(data) * 0.2))
    if len(data) - test_size < len(class_counts):
        raise ValueError(
            "Not enough records for a stratified train/test split with every "
            "risk class represented in both partitions."
        )

    features = data[FEATURE_COLUMNS]
    labels = data[TARGET_COLUMN]
    x_train, x_test, y_train, y_test = train_test_split(
        features,
        labels,
        test_size=test_size,
        random_state=42,
        stratify=labels,
    )

    base_estimator = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            (
                "classifier",
                RandomForestClassifier(
                    n_estimators=200,
                    max_depth=10,
                    class_weight="balanced",
                    random_state=42,
                    n_jobs=-1,
                ),
            ),
        ]
    )
    calibration_folds = min(5, int(y_train.value_counts().min()))
    model = CalibratedClassifierCV(
        estimator=base_estimator,
        method="sigmoid",
        cv=calibration_folds,
    )
    model.fit(x_train, y_train)

    predictions = model.predict(x_test)
    print(f"Accuracy: {accuracy_score(y_test, predictions):.4f}")
    print(
        classification_report(
            y_test,
            predictions,
            labels=model.classes_,
            zero_division=0,
        )
    )

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(model, model_path)
    print(f"Model saved to: {model_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=(
            "Train RiskClassifier from anonymized, verified Low/Medium/High labels."
        )
    )
    parser.add_argument("--data", default=DATA_PATH, help="Training CSV path")
    parser.add_argument(
        "--output",
        default=MODEL_CANDIDATE_PATH,
        help="Candidate model path; promote manually only after reviewing metrics",
    )
    arguments = parser.parse_args()
    train_model(arguments.data, arguments.output)
