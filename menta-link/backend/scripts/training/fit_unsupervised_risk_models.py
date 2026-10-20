import argparse
import os
import sys
from pathlib import Path

import joblib
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import pandas as pd
import seaborn as sns

BACKEND_DIR = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BACKEND_DIR))

from app.ml.unsupervised_risk_explorer import (  # noqa: E402
    FEATURE_COLUMNS,
    UnsupervisedRiskExplorer,
    build_student_features,
)


def _read_optional_csv(path: str | None) -> pd.DataFrame | None:
    return pd.read_csv(path) if path else None


def _select_cluster_count(metrics: pd.DataFrame, requested: str) -> int:
    valid = metrics.dropna(subset=["silhouette_score"])
    if requested != "auto":
        selected = int(requested)
        if selected not in set(metrics["k"]):
            raise ValueError(
                f"k={selected} cannot be evaluated with this cohort; "
                f"available values are {metrics['k'].tolist()}"
            )
        return selected

    target_k = valid[valid["k"].isin([3, 4])]
    if target_k.empty:
        target_k = valid
    if target_k.empty:
        raise ValueError("Could not calculate a valid silhouette score for any k")
    return int(target_k.sort_values("silhouette_score").iloc[-1]["k"])


def _plot_evaluation(metrics: pd.DataFrame, output_path: Path) -> None:
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5))
    sns.lineplot(data=metrics, x="k", y="inertia", marker="o", ax=axes[0])
    axes[0].set_title("Método del codo (inercia)")
    axes[0].set_xlabel("Número de clústeres (k)")
    axes[0].set_ylabel("Inercia")

    sns.lineplot(
        data=metrics,
        x="k",
        y="silhouette_score",
        marker="o",
        ax=axes[1],
    )
    axes[1].set_title("Coeficiente de silueta")
    axes[1].set_xlabel("Número de clústeres (k)")
    axes[1].set_ylabel("Silueta")
    fig.suptitle("Evaluación exploratoria de K-Means", fontweight="bold")
    fig.tight_layout()
    fig.savefig(output_path, dpi=160, bbox_inches="tight")
    plt.close(fig)


def _plot_pca(data: pd.DataFrame, output_path: Path) -> None:
    labels = sorted(data["risk_label"].unique())
    palette = {
        label: data.loc[data["risk_label"].eq(label), "plot_color"].iloc[0]
        for label in labels
    }
    fig, ax = plt.subplots(figsize=(9, 7))
    sns.scatterplot(
        data=data,
        x="pca_1",
        y="pca_2",
        hue="risk_label",
        hue_order=labels,
        palette=palette,
        alpha=0.75,
        s=55,
        ax=ax,
    )
    anomalies = data["is_anomaly"].eq(-1)
    if anomalies.any():
        sns.scatterplot(
            data=data.loc[anomalies],
            x="pca_1",
            y="pca_2",
            marker="X",
            color="#111111",
            s=110,
            label="Anomalía estadística (revisar)",
            ax=ax,
        )
    variance = data.attrs.get("explained_variance_ratio")
    if variance:
        ax.set_xlabel(f"PC1 ({variance[0]:.1%} varianza)")
        ax.set_ylabel(f"PC2 ({variance[1]:.1%} varianza)")
    ax.set_title("Perfiles relativos de la cohorte (PCA 2D)")
    ax.legend(title="Perfil exploratorio", bbox_to_anchor=(1.02, 1), loc="upper left")
    fig.tight_layout()
    fig.savefig(output_path, dpi=160, bbox_inches="tight")
    plt.close(fig)


def _plot_profiles(profiles: pd.DataFrame, output_path: Path) -> None:
    plot_data = profiles[FEATURE_COLUMNS].copy()
    plot_data = plot_data.dropna(axis=1, how="all")
    if plot_data.empty:
        return
    minimums = {
        "phq9_score": 0,
        "gad7_score": 0,
        "pss_score": 0,
        "mood_avg": 1,
        "mood_std": 0,
        "academic_avg": 0,
        "academic_delta": -100,
    }
    maximums = {
        "phq9_score": 27,
        "gad7_score": 21,
        "pss_score": 40,
        "mood_avg": 5,
        "mood_std": 2,
        "academic_avg": 100,
        "academic_delta": 100,
    }
    normalized = plot_data.copy()
    for column in normalized:
        normalized[column] = (normalized[column] - minimums[column]) / (
            maximums[column] - minimums[column]
        )
    normalized.index = profiles["risk_label"]
    fig, ax = plt.subplots(figsize=(max(9, len(normalized.columns) * 1.5), 4.5))
    sns.heatmap(
        normalized,
        cmap="YlOrRd",
        vmin=0,
        vmax=1,
        annot=True,
        fmt=".2f",
        ax=ax,
    )
    ax.set_title("Promedios por clúster en rangos normalizados")
    ax.set_ylabel("Perfil exploratorio relativo")
    fig.tight_layout()
    fig.savefig(output_path, dpi=160, bbox_inches="tight")
    plt.close(fig)


def fit_models(
    assessments_path: str,
    output_dir: str,
    id_salt: str,
    checkins_path: str | None = None,
    academics_path: str | None = None,
    clusters: str = "auto",
    checkin_window: int = 7,
    contamination: float | str = "auto",
) -> pd.DataFrame:
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)

    assessments = pd.read_csv(assessments_path)
    checkins = _read_optional_csv(checkins_path)
    academics = _read_optional_csv(academics_path)
    cohort = build_student_features(
        assessments=assessments,
        checkins=checkins,
        academics=academics,
        id_salt=id_salt,
        checkin_window=checkin_window,
    )
    if len(cohort) < 5:
        raise ValueError("At least five students are needed to compare k=3 and k=4.")

    model = UnsupervisedRiskExplorer(
        n_clusters=3,
        contamination=contamination,
    )
    model.fit(cohort)
    metrics = model.evaluation_metrics()
    selected_k = _select_cluster_count(metrics, clusters)

    model = UnsupervisedRiskExplorer(
        n_clusters=selected_k,
        contamination=contamination,
    ).fit(cohort)
    metrics["selected"] = metrics["k"].eq(selected_k)
    results = model.predict(cohort)
    projection = model.pca_projection(results)

    profile_data = model.profile_table()
    profile_data.index.name = "cluster_id"
    profile_data = profile_data.reset_index()
    profile_data.to_csv(output / "cluster_profiles.csv", index=False)
    metrics.to_csv(output / "cluster_evaluation.csv", index=False)
    results.to_csv(output / "student_risk_exploration.csv", index=False)
    _plot_evaluation(metrics, output / "cluster_evaluation.png")
    _plot_pca(projection, output / "cluster_pca.png")
    _plot_profiles(
        profile_data.set_index("cluster_id"), output / "cluster_profiles.png"
    )
    joblib.dump(model, output / "unsupervised_risk_candidate.joblib")

    best_silhouette = metrics.loc[metrics["k"].eq(selected_k), "silhouette_score"]
    silhouette = (
        float(best_silhouette.iloc[0]) if not best_silhouette.empty else float("nan")
    )
    print(f"Students analyzed: {len(results)}")
    print(f"Features used: {', '.join(model.feature_columns)}")
    print(f"Selected k: {selected_k}; silhouette: {silhouette:.4f}")
    print(f"Statistical anomalies (review only): {(results['is_anomaly'] == -1).sum()}")
    print(
        profile_data[
            [
                "cluster_id",
                "risk_label",
                *[column for column in FEATURE_COLUMNS if column in profile_data],
                "severity_score_relative",
            ]
        ].to_string(index=False)
    )
    print(f"Outputs: {output.resolve()}")
    print(
        "risk_label describes relative cluster profiles only; it is not a "
        "clinical risk assessment. Anomaly flags do not automatically request "
        "urgent intervention."
    )
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=(
            "Exploratory clustering and anomaly detection. Results are not "
            "clinical risk labels."
        )
    )
    parser.add_argument("--assessments", required=True, help="Assessment export CSV")
    parser.add_argument("--checkins", help="Emotional check-in export CSV")
    parser.add_argument("--academics", help="Academic record/grades export CSV")
    parser.add_argument(
        "--id-salt-env",
        default="STUDENT_ID_SALT",
        help="Environment variable containing the pseudonymization secret",
    )
    parser.add_argument("--output-dir", default="risk_exploration")
    parser.add_argument(
        "--clusters",
        choices=("auto", "3", "4"),
        default="auto",
        help="Choose the best silhouette among k=3/4, or specify a target",
    )
    parser.add_argument("--checkin-window", type=int, default=7)
    parser.add_argument("--contamination", type=float, default=None)
    args = parser.parse_args()

    id_salt = os.environ.get(args.id_salt_env)
    if not id_salt:
        parser.error(f"Set the {args.id_salt_env} environment variable first")
    fit_models(
        assessments_path=args.assessments,
        checkins_path=args.checkins,
        academics_path=args.academics,
        output_dir=args.output_dir,
        id_salt=id_salt,
        clusters=args.clusters,
        checkin_window=args.checkin_window,
        contamination=args.contamination if args.contamination is not None else "auto",
    )
