import os
import sys

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Dataset

# Add backend to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml.emotion.model import EmotionCNN
from app.ml.emotion.preprocessor import TextPreprocessor

# ── Constants ──────────────────────────────────────────────────────────────────
DATA_PATH = "/home/agustin/Proyectos/menta-link/dataset/text.csv"
MODEL_SAVE_PATH = (
    "/home/agustin/Proyectos/menta-link/backend/app/ml/emotion/model_emotion_cnn.pt"
)
VOCAB_SAVE_PATH = "/home/agustin/Proyectos/menta-link/backend/app/ml/emotion/vocab.pkl"

# Target emotions used in the application
EMOTIONS = ["feliz", "neutral", "triste", "ansioso", "frustrado", "motivado"]
LABEL_TO_IDX = {e: i for i, e in enumerate(EMOTIONS)}

# ── Mapping from text.csv numeric labels to our target emotions ────────────────
# text.csv labels: 0=sadness, 1=joy, 2=love, 3=anger, 4=fear, 5=surprise
# Our labels:      feliz, neutral, triste, ansioso, frustrado, motivado
DATASET_LABEL_MAP = {
    0: "triste",     # sadness    → triste
    1: "feliz",      # joy        → feliz
    2: "motivado",   # love       → motivado (positive engagement)
    3: "frustrado",  # anger      → frustrado
    4: "ansioso",    # fear       → ansioso
    5: "neutral",    # surprise   → neutral (closest match)
}

# ── Spanish synthetic data to make the model bilingual ─────────────────────────
SPANISH_DATA = [
    # feliz
    ("Me siento muy feliz hoy, todo salió genial!", "feliz"),
    ("Qué alegría ver a mis amigos de nuevo", "feliz"),
    ("Hoy es un día maravilloso, estoy muy contento", "feliz"),
    ("Me encanta estar aquí, me siento pleno", "feliz"),
    ("Siento mucha felicidad por mis logros", "feliz"),
    ("Me siento radiante y lleno de alegría", "feliz"),
    ("Qué felicidad me da compartir con ustedes", "feliz"),
    ("Estoy encantado con los resultados", "feliz"),
    ("Hoy fue un día increíble, me siento muy bien", "feliz"),
    ("Me hace muy feliz poder ayudar a los demás", "feliz"),
    ("Estoy contento porque me fue bien en el examen", "feliz"),
    ("Me siento agradecido por todo lo que tengo", "feliz"),
    ("Que bonito día, me siento muy positivo", "feliz"),
    ("Logré aprobar todas mis materias, estoy eufórico", "feliz"),
    ("Me llena de alegría saber que mis esfuerzos valieron la pena", "feliz"),
    ("Hoy me siento genial, todo marcha de maravilla", "feliz"),
    ("Me pone muy contento compartir con mi familia", "feliz"),
    ("Desperté con mucha energía y buena vibra", "feliz"),
    ("Me alegra mucho haber conocido a personas tan especiales", "feliz"),
    ("Estoy satisfecho con mi trabajo, salió todo perfecto", "feliz"),
    # triste
    ("Me siento muy triste últimamente, nada me anima", "triste"),
    ("He perdido las ganas de hacer cosas", "triste"),
    ("No puedo dejar de llorar, me siento muy mal", "triste"),
    ("Me siento solo y no sé qué hacer", "triste"),
    ("Todo me sale mal y me da mucha tristeza", "triste"),
    ("Echo de menos a mi familia, estoy muy triste", "triste"),
    ("No tengo ganas de nada, solo quiero dormir", "triste"),
    ("Me siento vacío por dentro", "triste"),
    ("Nada me hace sentir mejor, estoy muy deprimido", "triste"),
    ("Hoy fue un día terrible, me siento devastado", "triste"),
    ("Me siento abatido y sin esperanza", "triste"),
    ("No encuentro motivación para seguir adelante", "triste"),
    ("Siento un vacío enorme en mi corazón", "triste"),
    ("Me duele mucho esta situación, es insoportable", "triste"),
    ("Todo se derrumbó y no sé cómo levantarme", "triste"),
    ("Me siento desanimado con todo lo que está pasando", "triste"),
    ("No puedo evitar sentirme melancólico hoy", "triste"),
    ("La soledad me está afectando mucho", "triste"),
    ("Perdí algo muy importante para mí y me duele", "triste"),
    ("Me siento completamente derrotado", "triste"),
    # ansioso
    ("Tengo mucha ansiedad por los exámenes", "ansioso"),
    ("No puedo dormir pensando en el futuro", "ansioso"),
    ("Me preocupa mucho no poder cumplir con todo", "ansioso"),
    ("Siento que el corazón me late muy rápido, tengo miedo", "ansioso"),
    ("No dejo de pensar en lo que puede salir mal", "ansioso"),
    ("Estoy muy nervioso por la presentación de mañana", "ansioso"),
    ("La incertidumbre me genera mucha angustia", "ansioso"),
    ("Me siento abrumado por tantas responsabilidades", "ansioso"),
    ("No puedo concentrarme porque estoy muy preocupado", "ansioso"),
    ("Me da pánico equivocarme frente a todos", "ansioso"),
    ("Siento ansiedad cada vez que pienso en las tareas pendientes", "ansioso"),
    ("No sé si voy a poder con todo esto, me estresa mucho", "ansioso"),
    ("Me preocupa el futuro y no sé qué va a pasar", "ansioso"),
    ("Tengo un nudo en el estómago por los nervios", "ansioso"),
    ("Cada día me siento más estresado con la universidad", "ansioso"),
    ("Me agobia no tener control sobre las cosas", "ansioso"),
    ("Siento que todo se me viene encima", "ansioso"),
    ("La presión académica me está consumiendo", "ansioso"),
    ("No puedo relajarme, siempre estoy tenso", "ansioso"),
    ("Me aterra fallar y decepcionar a mis padres", "ansioso"),
    # frustrado
    ("No entiendo nada de esta materia, es desesperante", "frustrado"),
    ("Nadie me ayuda y no puedo avanzar, qué rabia", "frustrado"),
    ("He fallado otra vez, no sé qué más hacer", "frustrado"),
    ("Las cosas no salen como quiero, es muy frustrante", "frustrado"),
    ("Estoy harto de que todo salga mal", "frustrado"),
    ("Quiero terminar esto pero no puedo, me frustra", "frustrado"),
    ("Me siento impotente ante esta situación", "frustrado"),
    ("Me enoja que no me tomen en cuenta", "frustrado"),
    ("Es injusto lo que está pasando, estoy furioso", "frustrado"),
    ("No soporto más esta situación, es exasperante", "frustrado"),
    ("Estoy cansado de intentar y no lograr nada", "frustrado"),
    ("Me frustra no poder expresar lo que siento", "frustrado"),
    ("Todo esfuerzo parece ser en vano", "frustrado"),
    ("Me irritan las cosas que no puedo cambiar", "frustrado"),
    ("Siento impotencia al ver que nada mejora", "frustrado"),
    ("Me molesta mucho la falta de organización", "frustrado"),
    ("Estoy indignado por cómo me trataron", "frustrado"),
    ("No aguanto más esta presión innecesaria", "frustrado"),
    ("Me desespera la falta de resultados", "frustrado"),
    ("Es irritante tener que repetir todo de nuevo", "frustrado"),
    # motivado
    ("Vamos por ese examen! Yo puedo con todo", "motivado"),
    ("Hoy me levanté con ganas de estudiar y aprender", "motivado"),
    ("Estoy muy inspirado para mi nuevo proyecto", "motivado"),
    ("Siento que puedo lograr cualquier cosa hoy", "motivado"),
    ("A trabajar duro para cumplir mis metas!", "motivado"),
    ("Tengo mucha energía para superar mis desafíos", "motivado"),
    ("Me siento capaz y listo para triunfar", "motivado"),
    ("Voy a dar lo mejor de mí en todo lo que haga", "motivado"),
    ("Cada día es una nueva oportunidad para crecer", "motivado"),
    ("Estoy determinado a alcanzar mis objetivos", "motivado"),
    ("Me entusiasma aprender cosas nuevas cada día", "motivado"),
    ("Sé que con esfuerzo voy a lograr lo que me propongo", "motivado"),
    ("Hoy estoy lleno de ideas y creatividad", "motivado"),
    ("Me inspira ver el progreso que he logrado", "motivado"),
    ("Quiero superarme y ser mejor cada día", "motivado"),
    ("La dedicación siempre da sus frutos", "motivado"),
    ("Me emociona pensar en todo lo que puedo lograr", "motivado"),
    ("Estoy comprometido con mi crecimiento personal", "motivado"),
    ("Nada me va a detener en mi camino al éxito", "motivado"),
    ("Confío en mis capacidades para salir adelante", "motivado"),
    # neutral
    ("Hoy fue un día normal, nada especial", "neutral"),
    ("Fui a clases como siempre, todo tranquilo", "neutral"),
    ("No pasó nada relevante hoy", "neutral"),
    ("Todo estuvo bien, un día común", "neutral"),
    ("Desayuné, estudié y fui a dormir", "neutral"),
    ("El día transcurrió sin novedades", "neutral"),
    ("Hice mis tareas habituales sin contratiempos", "neutral"),
    ("Un día más de rutina, nada fuera de lo normal", "neutral"),
    ("Cumplí con mis actividades del día", "neutral"),
    ("Todo estuvo tranquilo en la universidad", "neutral"),
    ("Asistí a todas mis clases sin ningún problema", "neutral"),
    ("No tengo mucho que decir sobre hoy", "neutral"),
    ("Pasé el día haciendo lo de siempre", "neutral"),
    ("Fue un día como cualquier otro", "neutral"),
    ("Las cosas estuvieron normales en general", "neutral"),
    ("Sin mayores novedades, un día estándar", "neutral"),
    ("Me levanté temprano y fui a estudiar como siempre", "neutral"),
    ("El almuerzo estuvo bien, luego volví a estudiar", "neutral"),
    ("Hoy no me pasó nada especial que contar", "neutral"),
    ("Un día regular sin muchas emociones", "neutral"),
]

# Repeat Spanish data to give it more weight in training
SPANISH_REPEAT = 50  # Each Spanish sample appears 50 times


class EmotionDataset(Dataset):
    def __init__(self, texts, labels):
        self.texts = texts
        self.labels = labels

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        return self.texts[idx], torch.tensor(self.labels[idx], dtype=torch.long)


def train():
    print("=" * 60)
    print("  ENTRENAMIENTO CNN DE EMOCIONES — MENTALINK")
    print("=" * 60)

    # ── 1. Load and prepare data ───────────────────────────────────────────
    print("\n📂 Cargando dataset text.csv...")
    df = pd.read_csv(DATA_PATH)
    df = df.dropna(subset=["text"])

    # Map numeric labels to our emotion labels
    df["emotion"] = df["label"].map(DATASET_LABEL_MAP)
    df = df.dropna(subset=["emotion"])

    print(f"   Muestras del dataset: {len(df):,}")
    print(f"   Distribución original:")
    for label_num, emotion in DATASET_LABEL_MAP.items():
        count = len(df[df["emotion"] == emotion])
        print(f"     {label_num} ({emotion:>10}): {count:>7,}")

    texts = df["text"].tolist()
    labels = [LABEL_TO_IDX[e] for e in df["emotion"].tolist()]

    # ── 2. Add Spanish synthetic data ──────────────────────────────────────
    print(f"\n🇪🇸 Agregando datos sintéticos en español ({len(SPANISH_DATA)} x {SPANISH_REPEAT})...")
    for text, emotion in SPANISH_DATA * SPANISH_REPEAT:
        texts.append(text)
        labels.append(LABEL_TO_IDX[emotion])

    total_spanish = len(SPANISH_DATA) * SPANISH_REPEAT
    print(f"   Total muestras de entrenamiento: {len(texts):,} ({total_spanish:,} en español)")

    # ── 3. Build vocabulary ────────────────────────────────────────────────
    print("\n📚 Construyendo vocabulario...")
    preprocessor = TextPreprocessor(max_len=100)
    for text in texts:
        preprocessor.tokenize(text, fit=True)

    preprocessor.save_vocab(VOCAB_SAVE_PATH)
    print(f"   Vocabulario: {len(preprocessor.word_index):,} palabras")

    # ── 4. Prepare tensors ─────────────────────────────────────────────────
    print("\n🔧 Preprocesando textos...")
    processed_texts = [preprocessor.preprocess(text) for text in texts]

    X_train, X_test, y_train, y_test = train_test_split(
        processed_texts, labels, test_size=0.15, random_state=42, stratify=labels
    )

    train_dataset = EmotionDataset(X_train, y_train)
    test_dataset = EmotionDataset(X_test, y_test)

    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True, num_workers=2)
    test_loader = DataLoader(test_dataset, batch_size=64)

    print(f"   Train: {len(X_train):,} | Test: {len(X_test):,}")

    # ── 5. Compute class weights for imbalanced data ───────────────────────
    label_counts = np.bincount(y_train, minlength=len(EMOTIONS))
    total = len(y_train)
    class_weights = torch.tensor(
        [total / (len(EMOTIONS) * count) if count > 0 else 1.0 for count in label_counts],
        dtype=torch.float32,
    )
    print(f"\n⚖️  Pesos de clase (por desbalance):")
    for i, e in enumerate(EMOTIONS):
        print(f"     {e:>10}: {class_weights[i]:.3f} ({label_counts[i]:>7,} muestras)")

    # ── 6. Initialize model ────────────────────────────────────────────────
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\n🖥️  Dispositivo: {device}")

    vocab_size = len(preprocessor.word_index)
    model = EmotionCNN(vocab_size, num_classes=len(EMOTIONS))
    model = model.to(device)

    criterion = nn.CrossEntropyLoss(weight=class_weights.to(device))
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.5)

    # ── 7. Training loop ──────────────────────────────────────────────────
    EPOCHS = 8
    best_acc = 0.0
    print(f"\n🚀 Iniciando entrenamiento ({EPOCHS} épocas)...\n")

    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0
        correct = 0
        total_samples = 0

        for batch_texts, batch_labels in train_loader:
            batch_texts = batch_texts.to(device)
            batch_labels = batch_labels.to(device)

            optimizer.zero_grad()
            outputs = model(batch_texts)
            loss = criterion(outputs, batch_labels)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            correct += (predicted == batch_labels).sum().item()
            total_samples += batch_labels.size(0)

        scheduler.step()
        train_acc = correct / total_samples * 100
        avg_loss = total_loss / len(train_loader)

        # Quick validation
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for batch_texts, batch_labels in test_loader:
                batch_texts = batch_texts.to(device)
                batch_labels = batch_labels.to(device)
                outputs = model(batch_texts)
                _, predicted = torch.max(outputs, 1)
                val_correct += (predicted == batch_labels).sum().item()
                val_total += batch_labels.size(0)

        val_acc = val_correct / val_total * 100

        marker = " ★" if val_acc > best_acc else ""
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), MODEL_SAVE_PATH)

        print(
            f"   Época {epoch+1}/{EPOCHS} | "
            f"Loss: {avg_loss:.4f} | "
            f"Train Acc: {train_acc:.1f}% | "
            f"Val Acc: {val_acc:.1f}%{marker}"
        )

    print(f"\n💾 Mejor modelo guardado ({best_acc:.1f}% val accuracy)")
    print(f"   → {MODEL_SAVE_PATH}")
    print(f"   → {VOCAB_SAVE_PATH}")

    # ── 8. Final evaluation ────────────────────────────────────────────────
    # Reload best model
    model.load_state_dict(torch.load(MODEL_SAVE_PATH, map_location=device))
    model.eval()

    all_preds = []
    all_labels = []
    with torch.no_grad():
        for batch_texts, batch_labels in test_loader:
            batch_texts = batch_texts.to(device)
            outputs = model(batch_texts)
            _, predicted = torch.max(outputs, 1)
            all_preds.extend(predicted.cpu().tolist())
            all_labels.extend(batch_labels.tolist())

    print("\n📊 Reporte de Clasificación Final:")
    print("-" * 60)
    print(
        classification_report(
            all_labels, all_preds, target_names=EMOTIONS, labels=range(len(EMOTIONS))
        )
    )

    # ── 9. Test with Spanish examples ──────────────────────────────────────
    print("\n🧪 Pruebas con texto en español:")
    print("-" * 60)

    # Reload predictor with new model
    from app.ml.emotion.predictor import EmotionPredictor

    predictor = EmotionPredictor(MODEL_SAVE_PATH, VOCAB_SAVE_PATH, device=str(device))

    test_texts = [
        "Hoy me siento muy feliz y contento con mi vida",
        "Estoy triste y no tengo ganas de nada",
        "Tengo mucha ansiedad por el examen de mañana",
        "Estoy frustrado porque no entiendo la materia",
        "Me siento motivado para estudiar hoy",
        "Fue un día normal, nada especial",
        "Me preocupa mucho el futuro",
        "Estoy agradecido por el apoyo de mis compañeros",
    ]

    for text in test_texts:
        result = predictor.predict(text)
        conf = result["confidence"]
        print(f"  {result['emotion']:>10} ({conf:.0%}) ← \"{text}\"")

    print("\n✅ Entrenamiento completado exitosamente!")


if __name__ == "__main__":
    train()
