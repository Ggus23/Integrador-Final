import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

# Rutas clave (Paths)
# Definimos dónde buscar los datos y dónde guardar el modelo una vez entrenado.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "..", "data", "processed_training_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "risk_model.pkl")


def train_model():
    # Primero, verificamos que el archivo de datos exista. Sin datos no hay IA.
    if not os.path.exists(DATA_PATH):
        print(f"Error: No encontré los datos en {DATA_PATH}")
        return

    print("Cargando datos de entrenamiento...")
    df = pd.read_csv(DATA_PATH)

    # Separamos las características (lo que sabe el modelo) de la variable objetivo (lo que debe predecir).
    # X: Factores de riesgo (estrés, ánimo, días malos, presión académica).
    # y: Nivel de riesgo real (Bajo, Medio, Alto).
    X = df[["pss_score", "mood_avg", "bad_days_freq", "study_pressure"]]
    y = df["risk_level"]

    # División Entrenamiento vs Prueba
    # Usamos el 80% de los datos para enseñar al modelo y guardamos el 20% para examinarlo después.
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"Entrenando el modelo con {len(X_train)} ejemplos...")

    # Configuración del Modelo: Random Forest
    # Hemos ajustado 'n_estimators' (cantidad de árboles) y 'max_depth' (profundidad)
    # para que el modelo sea lo suficientemente complejo para entender los datos, pero no tanto como para memorizarlos.
    clf = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)

    # ¡A aprender! Aquí es donde ocurre la magia del entrenamiento.
    clf.fit(X_train, y_train)

    # Evaluación
    # Ahora le pedimos al modelo que prediga los resultados para los datos de prueba que nunca ha visto.
    predictions = clf.predict(X_test)
    acc = accuracy_score(y_test, predictions)

    print("\n--- Rendimiento del Modelo ---")
    print(f"Precisión (Accuracy): {acc:.4f}")
    print("\nReporte de Clasificación detallado:")
    print(classification_report(y_test, predictions))

    # Guardado
    # Si el modelo es bueno, lo guardamos en un archivo .pkl para usarlo en la aplicación real.
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, MODEL_PATH)
    print(f"\nModelo guardado exitosamente en: {MODEL_PATH}")


if __name__ == "__main__":
    train_model()
