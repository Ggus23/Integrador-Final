import os
import pickle
import re
import unicodedata

try:
    import torch
    TORCH_AVAILABLE = True
except (ImportError, OSError):
    torch = None
    TORCH_AVAILABLE = False

_SPECIAL_CHARS_RE = re.compile(r"[^a-zA-Z\s]")
_EXTRA_SPACE_RE = re.compile(r"\s+")


class TextPreprocessor:
    def __init__(self, max_len=100, vocab_path=None):
        self.max_len = max_len
        self.word_index = {}
        if vocab_path and os.path.exists(vocab_path):
            try:
                with open(vocab_path, "rb") as f:
                    self.word_index = pickle.load(f)  # nosec B301
            except Exception:
                self.word_index = {}

    def clean_text(self, text):
        if not isinstance(text, str):
            return ""
        # Convert to lowercase
        text = text.lower()
        # Remove accents
        text = "".join(
            c
            for c in unicodedata.normalize("NFD", text)
            if unicodedata.category(c) != "Mn"
        )
        # Remove special characters and numbers
        text = _SPECIAL_CHARS_RE.sub("", text)
        # Remove extra whitespace
        text = _EXTRA_SPACE_RE.sub(" ", text).strip()
        return text

    def tokenize(self, text, fit=False):
        cleaned = self.clean_text(text)
        words = cleaned.split()

        if fit:
            for word in words:
                if word not in self.word_index:
                    self.word_index[word] = len(self.word_index) + 1  # 0 is for padding

        sequence = [self.word_index.get(word, 0) for word in words]
        return sequence

    def pad_sequence(self, sequence):
        if len(sequence) >= self.max_len:
            return sequence[: self.max_len]
        else:
            return sequence + [0] * (self.max_len - len(sequence))

    def preprocess(self, text):
        seq = self.tokenize(text)
        padded = self.pad_sequence(seq)
        if TORCH_AVAILABLE:
            return torch.tensor(padded, dtype=torch.long)
        return padded

    def save_vocab(self, path):
        with open(path, "wb") as f:
            pickle.dump(self.word_index, f)
