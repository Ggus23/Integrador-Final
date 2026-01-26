import pandas as pd
import numpy as np
import os
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "..", "dataset", "med dataset.csv")
OUTPUT_PATH = os.path.join(BASE_DIR, "data", "processed_training_data.csv")

def process_data():
    if not os.path.exists(DATASET_PATH):
        print(f"Error: Dataset not found at {DATASET_PATH}")
        return

    print("Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    
    # 1. Cleaning
    # Drop rows where critical psychological metrics are missing
    df = df.dropna(subset=['cesd', 'stai_t', 'mbi_ex'])
    
    print(f"Original shape: {df.shape}")

    # 2. Define Ground Truth Risk (Target)
    # Using Clinical Thresholds:
    # CES-D (Depression): >= 16 suggests depression. >= 24 is severe.
    # STAI (Anxiety): > 40 is moderate/high.
    # MBI (Burnout/Exhaustion): High exhaustion is a risk.

    def calculate_risk(row):
        cesd = row.get('cesd', 0)
        stai = row.get('stai_t', 0)
        
        score = 0
        if cesd >= 24 or stai >= 55:
            return 2 # High Risk
        elif cesd >= 16 or stai >= 40:
            return 1 # Medium Risk
        else:
            return 0 # Low Risk

    df['risk_level'] = df.apply(calculate_risk, axis=1)

    # 3. Create Synthetic Features (Bridging the gap)
    # The app frontend produces PSS (Stress), Mood, and Sleep Quality.
    # We simulate these based on the REAL psychological stats of the student.
    
    np.random.seed(42) # For reproducibility

    # GENERATING PSS (0-40)
    # Logic: Stress is highly correlated with Anxiety (STAI).
    # STAI range: ~20-80. PSS range: 0-40.
    # Normalize STAI to 0-40 and add noise.
    df['pss_score'] = ((df['stai_t'] - 20) / 60 * 40) + np.random.normal(0, 3, len(df))
    df['pss_score'] = df['pss_score'].clip(0, 40).astype(int)

    # GENERATING MOOD (1-5, where 5 is best)
    # Logic: High Depression (CES-D) = Low Mood.
    # CES-D range: 0-60.
    # Invert and scale.
    df['mood_avg'] = 5 - (df['cesd'] / 60 * 4) + np.random.normal(0, 0.5, len(df))
    df['mood_avg'] = df['mood_avg'].clip(1, 5).round(1)

    # GENERATING DATA FOR "Bad Days Frequency" (used in current heuristic, implies frequency)
    # We can use study hours or just create a 'bad_days' metric based on MBI (Burnout)
    # Let's assume MBI Exhaustion (mbi_ex) correlates with feeling like having "bad days".
    df['bad_days_freq'] = (df['mbi_ex'] / 30 * 7) # Approx days per week feeling bad
    df['bad_days_freq'] = df['bad_days_freq'].clip(0, 7).round(1)

    # GENERATING STUDY PRESSURE (1-10)
    # From Real Data: 'stud_h' (Study Hours). Range 0 to ~70?
    # Normalize 'stud_h' to 1-10 scale.
    # Check max of stud_h first: say 60.
    df['study_pressure'] = (df['stud_h'] / 60 * 10) + np.random.normal(0, 1, len(df))
    df['study_pressure'] = df['study_pressure'].clip(1, 10).round(1)

    # Select final columns for training
    # Features must match what we will ask the model to predict on in the real app.
    final_cols = ['pss_score', 'mood_avg', 'bad_days_freq', 'study_pressure', 'risk_level']
    
    processed_df = df[final_cols]
    
    # Analyze balance
    print("\nClass Distribution (Risk Levels):")
    print(processed_df['risk_level'].value_counts(normalize=True))
    
    # Save
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    processed_df.to_csv(OUTPUT_PATH, index=False)
    print(f"\nProcessed data saved to: {OUTPUT_PATH}")
    print("\nSample rows:")
    print(processed_df.head())

if __name__ == "__main__":
    process_data()
