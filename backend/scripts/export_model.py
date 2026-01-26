import argparse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def export_model(model_version: str, output_path: str):
    logger.info(f"Exporting model version {model_version} to {output_path}...")
    # Logic to export model
    logger.info("Export complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export ML model.")
    parser.add_argument(
        "--version", type=str, required=True, help="Model version to export"
    )
    parser.add_argument("--output", type=str, required=True, help="Output file path")
    args = parser.parse_args()

    export_model(args.version, args.output)
