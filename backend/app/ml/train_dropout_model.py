import os

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "dropout_training_data_combined.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "dropout_model.pkl")

# Must match dropout_predictor.FEATURE_COLUMNS exactly.
FEATURES = [
    "Course",
    "Scholarship holder",
    "Tuition fees up to date",
    "Curricular units 1st sem (approved)",
    "Curricular units 1st sem (grade)",
    "Age at enrollment",
    "Gender",
    "pss_score",
    "mood_avg",
    "risk_level_encoded",  # 0=Low, 1=Medium, 2=High, 3=Critical
]


def _derive_risk_level_encoded(df: pd.DataFrame) -> pd.Series:
    """
    Derives risk_level_encoded from pss_score using the same thresholds
    as AssessmentService._get_pss_risk().

    If the dataset already contains a 'risk_level_encoded' column this
    function is not called (real labels are preferred).
    """

    def encode(pss: float) -> int:
        if pss <= 13:
            return 0  # Low
        if pss <= 26:
            return 1  # Medium
        return 2  # High

    return df["pss_score"].apply(encode)


def train_dropout_model():
    if not os.path.exists(DATA_PATH):
        print(f"Error: training data not found at {DATA_PATH}")
        return

    print("Loading dropout training data …")
    df = pd.read_csv(DATA_PATH)

    # Derive risk_level_encoded if the column is missing from the CSV
    if "risk_level_encoded" not in df.columns:
        print("Column 'risk_level_encoded' not in dataset — deriving from pss_score …")
        df["risk_level_encoded"] = _derive_risk_level_encoded(df)

    missing = [c for c in FEATURES if c not in df.columns]
    if missing:
        print(f"Error: missing columns in dataset: {missing}")
        return

    X = df[FEATURES]
    y = df["dropout_label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Training RandomForest on {len(X_train)} samples …")
    clf = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        class_weight="balanced",  # handles class imbalance
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    predictions = clf.predict(X_test)
    acc = accuracy_score(y_test, predictions)

    print("\n--- Dropout Model Performance ---")
    print(f"Accuracy : {acc:.4f}")
    print("\nDetailed report:")
    print(classification_report(y_test, predictions))

    print("\nFeature importances:")
    for feat, imp in sorted(
        zip(FEATURES, clf.feature_importances_), key=lambda x: -x[1]
    ):
        print(f"  {feat:45s} {imp:.4f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, MODEL_PATH)
    print(f"\nModel saved to: {MODEL_PATH}")


if __name__ == "__main__":
    train_dropout_model()
