import os
import random

import numpy as np
import pandas as pd

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "processed_training_data.csv")


def generate_student_data(n=1000):
    data = []

    for _ in range(n):
        # Base profile randomness
        profile_type = random.choices(
            ["low", "medium", "high"], weights=[0.4, 0.3, 0.3]
        )[0]

        if profile_type == "low":
            # Riesgo Bajo: PSS bajo, buen ánimo, poca presión
            pss = int(np.random.normal(10, 5))
            pss = max(0, min(40, pss))

            mood = np.random.normal(4.2, 0.5)
            mood = max(1, min(5, mood))

            pressure = np.random.normal(2, 1)
            pressure = max(1, min(5, pressure))

            bad_days = random.choices([0, 1, 2], weights=[0.7, 0.2, 0.1])[0]

            risk = 0  # Low

        elif profile_type == "medium":
            # Riesgo Medio: Zona gris
            subtype = random.choice(
                ["stressed_but_happy", "chill_but_pressured", "unstable"]
            )

            if subtype == "stressed_but_happy":
                # Estrés alto pero buen ánimo (resiliente)
                pss = int(np.random.normal(25, 4))
                mood = np.random.normal(3.8, 0.4)
                pressure = np.random.normal(3.5, 1)
                bad_days = random.randint(1, 3)
            elif subtype == "chill_but_pressured":
                # Estrés bajo pero mucha presión académica
                pss = int(np.random.normal(15, 5))
                mood = np.random.normal(3.0, 0.5)
                pressure = 5.0  # Max pressure
                bad_days = random.randint(2, 4)
            else:
                # Inestable
                pss = int(np.random.normal(20, 5))
                mood = np.random.normal(2.8, 0.6)
                pressure = np.random.normal(3, 1)
                bad_days = random.randint(2, 4)

            # Clamp values
            pss = max(0, min(40, pss))
            mood = max(1, min(5, mood))
            pressure = max(1, min(5, pressure))

            risk = 1  # Medium

        else:  # High
            # Riesgo Alto: Todo mal
            pss = int(np.random.normal(30, 5))
            pss = max(0, min(40, pss))

            mood = np.random.normal(1.8, 0.6)
            mood = max(1, min(5, mood))

            pressure = np.random.normal(4, 1)
            pressure = max(1, min(5, pressure))

            bad_days = random.randint(4, 7)

            risk = 2  # High

        data.append(
            {
                "pss_score": pss,
                "mood_avg": round(mood, 2),
                "bad_days_freq": bad_days,
                "study_pressure": round(pressure, 1),
                "risk_level": risk,
            }
        )

    return pd.DataFrame(data)


def main():
    print(f"Generating enhanced dataset with 1000 samples...")
    df = generate_student_data(1000)

    # Ensure directory exists
    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)

    df.to_csv(DATA_PATH, index=False)
    print(f" Dataset saved to: {DATA_PATH}")
    print("\nClass Distribution:")
    print(df["risk_level"].value_counts(normalize=True))


if __name__ == "__main__":
    main()
