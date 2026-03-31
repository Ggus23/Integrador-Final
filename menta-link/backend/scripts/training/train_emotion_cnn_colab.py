# -*- coding: utf-8 -*-
"""
Script adaptado para Google Colab - Entrenamiento de CNN de Emociones
"""

import os
import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Dataset
import pickle
import unicodedata
import re

# 1. Ejecuta esto primero en Colab para conectar tu Google Drive:
# from google.colab import drive
# drive.mount('/content/drive')

# 2. Configura aquí la ruta de tu Drive donde subiste el archivo text.csv
# Ejemplo: si lo subiste a la carpeta raíz de tu Drive:
DATA_PATH = "/content/drive/MyDrive/text.csv"
MODEL_SAVE_PATH = "/content/drive/MyDrive/model_emotion_cnn.pt"
VOCAB_SAVE_PATH = "/content/drive/MyDrive/vocab.pkl"

EMOTIONS = ["feliz", "neutral", "triste", "ansioso", "frustrado", "motivado"]
LABEL_TO_IDX = {e: i for i, e in enumerate(EMOTIONS)}

DATASET_LABEL_MAP = {
    0: "triste",     1: "feliz",      2: "motivado", 
    3: "frustrado",  4: "ansioso",    5: "neutral",
}

SPANISH_DATA = [
    ("Me siento muy feliz hoy, todo salió genial!", "feliz"),
    ("Qué alegría ver a mis amigos de nuevo", "feliz"),
    ("Hoy es un día maravilloso, estoy muy contento", "feliz"),
    ("Siento mucha felicidad por mis logros", "feliz"),
    ("Me siento muy triste últimamente, nada me anima", "triste"),
    ("He perdido las ganas de hacer cosas", "triste"),
    ("No puedo dejar de llorar, me siento muy mal", "triste"),
    ("Me siento solo y no sé qué hacer", "triste"),
    ("Tengo mucha ansiedad por los exámenes", "ansioso"),
    ("No puedo dormir pensando en el futuro", "ansioso"),
    ("Me preocupa mucho no poder cumplir con todo", "ansioso"),
    ("Siento que el corazón me late muy rápido, tengo miedo", "ansioso"),
    ("No entiendo nada de esta materia, es desesperante", "frustrado"),
    ("Nadie me ayuda y no puedo avanzar, qué rabia", "frustrado"),
    ("He fallado otra vez, no sé qué más hacer", "frustrado"),
    ("Las cosas no salen como quiero, es muy frustrante", "frustrado"),
    ("Vamos por ese examen! Yo puedo con todo", "motivado"),
    ("Hoy me levanté con ganas de estudiar y aprender", "motivado"),
    ("Estoy muy inspirado para mi nuevo proyecto", "motivado"),
    ("Siento que puedo lograr cualquier cosa hoy", "motivado"),
    ("Hoy fue un día normal, nada especial", "neutral"),
    ("Fui a clases como siempre, todo tranquilo", "neutral"),
    ("No pasó nada relevante hoy", "neutral"),
    ("Todo estuvo bien, un día común", "neutral"),
]
SPANISH_REPEAT = 50

# --- CLASES COPIADAS DEL BACKEND ---
class EmotionCNN(nn.Module):
    def __init__(self, vocab_size, embedding_dim=128, num_filters=128, kernel_size=5, num_classes=6):
        super(EmotionCNN, self).__init__()
        self.embedding = nn.Embedding(vocab_size + 1, embedding_dim, padding_idx=0)
        self.conv1d = nn.Conv1d(in_channels=embedding_dim, out_channels=num_filters, kernel_size=kernel_size)
        import torch.nn.functional as F
        self.dropout = nn.Dropout(0.5)
        self.fc = nn.Linear(num_filters, num_classes)

    def forward(self, x):
        import torch.nn.functional as F
        x = self.embedding(x)
        x = x.permute(0, 2, 1)
        x = F.relu(self.conv1d(x))
        x = F.max_pool1d(x, x.shape[2])
        x = x.squeeze(2)
        x = self.dropout(x)
        x = self.fc(x)
        return x

class TextPreprocessor:
    def __init__(self, max_len=100, vocab_path=None):
        self.max_len = max_len
        self.word_index = {}

    def clean_text(self, text):
        if not isinstance(text, str): return ""
        text = text.lower()
        text = "".join(c for c in unicodedata.normalize("NFD", text) if unicodedata.category(c) != "Mn")
        text = re.sub(r"[^a-zA-Z\s]", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def tokenize(self, text, fit=False):
        cleaned = self.clean_text(text)
        words = cleaned.split()
        if fit:
            for word in words:
                if word not in self.word_index:
                    self.word_index[word] = len(self.word_index) + 1
        return [self.word_index.get(word, 0) for word in words]

    def param_pad(self, sequence):
        if len(sequence) >= self.max_len: return sequence[: self.max_len]
        return sequence + [0] * (self.max_len - len(sequence))

    def preprocess(self, text):
        return torch.tensor(self.param_pad(self.tokenize(text)), dtype=torch.long)
        
    def save_vocab(self, path):
        with open(path, "wb") as f:
            pickle.dump(self.word_index, f)

class EmotionDataset(Dataset):
    def __init__(self, texts, labels):
        self.texts = texts
        self.labels = labels

    def __len__(self): return len(self.texts)
    def __getitem__(self, idx): return self.texts[idx], torch.tensor(self.labels[idx], dtype=torch.long)

# --- RUN TRAINING ---
def run_colab_training():
    if not os.path.exists(DATA_PATH):
        print(f"Error: Sube el archivo text.csv a tu Drive en la ruta: {DATA_PATH}")
        return

    df = pd.read_csv(DATA_PATH).dropna(subset=["text"])
    df["emotion"] = df["label"].map(DATASET_LABEL_MAP)
    df = df.dropna(subset=["emotion"])
    
    texts = df["text"].tolist()
    labels = [LABEL_TO_IDX[e] for e in df["emotion"].tolist()]

    for text, emotion in SPANISH_DATA * SPANISH_REPEAT:
        texts.append(text)
        labels.append(LABEL_TO_IDX[emotion])

    preprocessor = TextPreprocessor(max_len=100)
    for text in texts: preprocessor.tokenize(text, fit=True)
    preprocessor.save_vocab(VOCAB_SAVE_PATH)

    processed_texts = [preprocessor.preprocess(text) for text in texts]
    X_train, X_test, y_train, y_test = train_test_split(processed_texts, labels, test_size=0.15, random_state=42, stratify=labels)

    train_loader = DataLoader(EmotionDataset(X_train, y_train), batch_size=256, shuffle=True)
    test_loader = DataLoader(EmotionDataset(X_test, y_test), batch_size=256)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Entrenando usando: {device} 🚀")

    model = EmotionCNN(len(preprocessor.word_index), num_classes=len(EMOTIONS)).to(device)
    
    label_counts = np.bincount(y_train, minlength=len(EMOTIONS))
    class_weights = torch.tensor([len(y_train) / (len(EMOTIONS) * count) for count in label_counts], dtype=torch.float32).to(device)
    
    criterion = nn.CrossEntropyLoss(weight=class_weights)
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    EPOCHS = 8
    best_acc = 0.0

    for epoch in range(EPOCHS):
        model.train()
        for batch_texts, batch_labels in train_loader:
            optimizer.zero_grad()
            outputs = model(batch_texts.to(device))
            loss = criterion(outputs, batch_labels.to(device))
            loss.backward()
            optimizer.step()

        model.eval()
        correct = 0
        with torch.no_grad():
            for batch_texts, batch_labels in test_loader:
                outputs = model(batch_texts.to(device))
                _, predicted = torch.max(outputs, 1)
                correct += (predicted == batch_labels.to(device)).sum().item()
        
        val_acc = correct / len(y_test) * 100
        print(f"Época {epoch+1}/{EPOCHS} -> Val Acc: {val_acc:.2f}%")
        
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), MODEL_SAVE_PATH)

    print(f"Completado! Mejor modelo guardado en {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    run_colab_training()
