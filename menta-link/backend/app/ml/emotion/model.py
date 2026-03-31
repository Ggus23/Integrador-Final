import torch.nn as nn
import torch.nn.functional as F


class EmotionCNN(nn.Module):
    def __init__(
        self,
        vocab_size,
        embedding_dim=128,
        num_filters=128,
        kernel_size=5,
        num_classes=6,
    ):
        super(EmotionCNN, self).__init__()
        self.embedding = nn.Embedding(vocab_size + 1, embedding_dim, padding_idx=0)
        self.conv1d = nn.Conv1d(
            in_channels=embedding_dim, out_channels=num_filters, kernel_size=kernel_size
        )
        self.dropout = nn.Dropout(0.5)
        self.fc = nn.Linear(num_filters, num_classes)

    def forward(self, x):
        # x shape: (batch_size, seq_len)
        x = self.embedding(x)  # (batch_size, seq_len, embedding_dim)
        x = x.permute(0, 2, 1)  # (batch_size, embedding_dim, seq_len) for Conv1d

        x = F.relu(self.conv1d(x))  # (batch_size, num_filters, seq_len - kernel + 1)
        x = F.max_pool1d(x, x.shape[2])  # (batch_size, num_filters, 1)

        x = x.squeeze(2)  # (batch_size, num_filters)
        x = self.dropout(x)
        x = self.fc(x)  # (batch_size, num_classes)

        return x
