
import pandas as pd
import numpy as np
import os

# Rutas
DATASET_PATH = "/home/agustin/Proyectos/menta-link/dataset/dataset.csv"
OUTPUT_PATH = "/home/agustin/Proyectos/menta-link/backend/data/dropout_training_data_combined.csv"

def generate_combined_data():
    if not os.path.exists(DATASET_PATH):
        print(f"Error: No se encuentra el dataset en {DATASET_PATH}")
        return

    # Usar el separador correcto para este dataset (parece ser coma)
    # Algunos CSVs de este tipo usan punto y coma, verificamos.
    try:
        df = pd.read_csv(DATASET_PATH)
    except:
        df = pd.read_csv(DATASET_PATH, sep=';')

    print(f"Columnas detectadas: {df.columns.tolist()}")

    # Selección de características clave para el modelo
    # 'Target' es nuestra etiqueta (Dropout, Graduate, Enrolled)
    # Solo usaremos 'Dropout' y 'Graduate' para una clasificación binaria clara,
    # o mantendremos los 3 si queremos más detalle. Para abandono, nos interesa Dropout vs Resto.
    
    # Mapeo de Target a numérico: Dropout (1), Enrolled (0), Graduate (0)
    # O mejor: Dropout (2), Enrolled (1), Graduate (0)
    target_mapping = {'Dropout': 1, 'Graduate': 0, 'Enrolled': 0}
    df['dropout_label'] = df['Target'].map(target_mapping)

    # Variables académicas clave
    base_features = [
        'Course', 'Scholarship holder', 'Tuition fees up to date',
        'Curricular units 1st sem (approved)', 'Curricular units 1st sem (grade)',
        'Age at enrollment', 'Gender'
    ]
    
    # Asegurémonos de que las columnas existen (a veces hay espacios o variaciones)
    df.columns = df.columns.str.strip()
    
    # Generar datos sintéticos de Salud Mental para MentaLink
    # Queremos que haya correlación: Peor salud mental -> Más riesgo de Dropout
    n_rows = len(df)
    
    # PSS Score (0-40): Más alto es más estrés
    # Mood Avg (1-5): Más alto es mejor ánimo
    
    df['pss_score'] = 0.0
    df['mood_avg'] = 0.0

    for idx, row in df.iterrows():
        if row['dropout_label'] == 1: # Dropout
            df.at[idx, 'pss_score'] = np.random.uniform(20, 40)
            df.at[idx, 'mood_avg'] = np.random.uniform(1, 3)
        else: # Graduate or Enrolled
            df.at[idx, 'pss_score'] = np.random.uniform(0, 25)
            df.at[idx, 'mood_avg'] = np.random.uniform(3, 5)

    # Columnas finales para el nuevo entrenamiento
    final_cols = base_features + ['pss_score', 'mood_avg', 'dropout_label']
    
    training_df = df[final_cols]
    
    # Guardar
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    training_df.to_csv(OUTPUT_PATH, index=False)
    print(f"Dataset combinado guardado en: {OUTPUT_PATH}")
    print(f"Total de registros: {len(training_df)}")

if __name__ == "__main__":
    generate_combined_data()
