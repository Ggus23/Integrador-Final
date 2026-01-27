import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "processed_training_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "risk_model.pkl")


def train_model():
    if not os.path.exists(DATA_PATH):
        print(f"Error: Data not found at {DATA_PATH}")
        return

    print("Loading training data...")
    df = pd.read_csv(DATA_PATH)

    # Split X, y
    X = df[["pss_score", "mood_avg", "bad_days_freq", "study_pressure"]]
    y = df["risk_level"]

    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"Training on {len(X_train)} samples...")

    # Initialize Model - Random Forest
    # Improvement: More trees (200), Deeper depth (10) for better fitting
    clf = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)

    # Train
    clf.fit(X_train, y_train)

    # Evaluate
    predictions = clf.predict(X_test)
    acc = accuracy_score(y_test, predictions)

    print("\n--- Model Performance ---")
    print(f"Accuracy: {acc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions))

    # Save
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, MODEL_PATH)
    print(f"\nModel saved to: {MODEL_PATH}")


if __name__ == "__main__":
    train_model()
