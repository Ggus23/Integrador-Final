import argparse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def train(data_path: str, epochs: int):
    logger.info(f"Starting training with data from {data_path} for {epochs} epochs...")
    # Training logic
    logger.info("Training complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ML model.")
    parser.add_argument("--data", type=str, required=True, help="Path to training data")
    parser.add_argument("--epochs", type=int, default=10, help="Number of epochs")
    args = parser.parse_args()

    train(args.data, args.epochs)
