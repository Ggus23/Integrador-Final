try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    TORCH_AVAILABLE = True
except (ImportError, OSError):
    torch = None
    nn = object
    F = None
    TORCH_AVAILABLE = False

if TORCH_AVAILABLE:
    class EmotionCNN(nn.Module):
        def __init__(self, vocab_size, embedding_dim=128, num_classes=6):
            super(EmotionCNN, self).__init__()
            self.embedding = nn.Embedding(vocab_size, embedding_dim)
            self.conv1 = nn.Conv1d(embedding_dim, 64, kernel_size=3, padding=1)
            self.conv2 = nn.Conv1d(64, 128, kernel_size=3, padding=1)
            self.pool = nn.MaxPool1d(2)
            self.dropout = nn.Dropout(0.5)
            self.fc1 = nn.Linear(128 * 25, 64)
            self.fc2 = nn.Linear(64, num_classes)

        def forward(self, x):
            x = self.embedding(x).permute(0, 2, 1)
            x = self.pool(F.relu(self.conv1(x)))
            x = self.pool(F.relu(self.conv2(x)))
            x = x.view(x.size(0), -1)
            x = self.dropout(F.relu(self.fc1(x)))
            x = self.fc2(x)
            return x
else:
    class EmotionCNN:
        def __init__(self, *args, **kwargs):
            pass
        def __call__(self, *args, **kwargs):
            raise RuntimeError("Torch not available")
