from __future__ import annotations

import hashlib
import hmac
from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer
from sklearn.metrics import silhouette_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import RobustScaler

FEATURE_COLUMNS = [
    "phq9_score",
    "gad7_score",
    "pss_score",
    "mood_avg",
    "mood_std",
    "academic_avg",
    "academic_delta",
]
REQUIRED_FEATURE_COLUMNS = [
    "phq9_score",
    "gad7_score",
    "mood_avg",
    "mood_std",
    "academic_avg",
    "academic_delta",
]
ASSESSMENT_RANGES = {
    "PHQ-9": (0, 27),
    "GAD-7": (0, 21),
    "PSS-10": (0, 40),
}
PROFILE_LABELS = {
    2: [
        ("Verde - perfil relativo menor", "#2ca25f"),
        ("Naranja - perfil relativo mayor", "#f16913"),
    ],
    3: [
        ("Verde - perfil relativo menor", "#2ca25f"),
        ("Amarillo - perfil intermedio", "#fec44f"),
        ("Naranja - perfil relativo mayor", "#f16913"),
    ],
    4: [
        ("Verde - perfil relativo menor", "#2ca25f"),
        ("Amarillo - perfil intermedio-bajo", "#fec44f"),
        ("Naranja - perfil intermedio-alto", "#f16913"),
        ("Rojo - perfil relativo mayor; revisar", "#de2d26"),
    ],
}
HITO_COLUMNS = [
    ("hito2_procesual", "hito2_nota"),
    ("hito3_procesual", "hito3_nota"),
    ("hito4_procesual", "hito4_nota"),
    ("hito5_procesual", "hito5_nota"),
]


def _student_id_column(data: pd.DataFrame) -> str:
    for column in ("student_id", "user_id"):
        if column in data:
            return column
    raise ValueError("Input data must include student_id or user_id")


def _clean_student_ids(data: pd.DataFrame) -> pd.DataFrame:
    cleaned = data.copy()
    source_column = _student_id_column(cleaned)
    cleaned["student_id"] = cleaned[source_column].astype("string").str.strip()
    missing_ids = cleaned["student_id"].isna() | cleaned["student_id"].eq("")
    if missing_ids.any():
        raise ValueError("Input data contains missing student identifiers")
    return cleaned


def _numeric_column(
    data: pd.DataFrame, column: str, required: bool = False
) -> pd.Series:
    if column not in data:
        if required:
            raise ValueError(f"Input data is missing required column: {column}")
        return pd.Series(np.nan, index=data.index, dtype="float64")

    original = data[column]
    numeric = pd.to_numeric(original, errors="coerce")
    if (original.notna() & numeric.isna()).any():
        raise ValueError(f"{column} contains non-numeric values")
    return numeric


def build_student_features(
    assessments: pd.DataFrame,
    checkins: pd.DataFrame | None,
    academics: pd.DataFrame | None,
    id_salt: str,
    checkin_window: int = 7,
) -> pd.DataFrame:
    """Aggregate project data sources by student and pseudonymize IDs."""
    if not id_salt:
        raise ValueError("A non-empty id_salt is required to pseudonymize IDs")
    if checkin_window < 1:
        raise ValueError("checkin_window must be at least 1")
    if assessments.empty:
        raise ValueError("Assessment data must contain at least one record")

    assessment_data = _clean_student_ids(assessments)
    for column in ("assessment_type", "total_score"):
        if column not in assessment_data:
            raise ValueError(f"Assessment data is missing required column: {column}")
    assessment_data["assessment_type"] = (
        assessment_data["assessment_type"].astype("string").str.strip().str.upper()
    )
    assessment_data = assessment_data[
        assessment_data["assessment_type"].isin(ASSESSMENT_RANGES)
    ].copy()
    if assessment_data.empty:
        raise ValueError("No PSS-10, GAD-7, or PHQ-9 assessment records found")

    assessment_data["total_score"] = _numeric_column(
        assessment_data, "total_score", required=True
    )
    for assessment_type, (minimum, maximum) in ASSESSMENT_RANGES.items():
        mask = assessment_data["assessment_type"].eq(assessment_type)
        scores = assessment_data.loc[mask, "total_score"]
        if not scores.between(minimum, maximum).all():
            raise ValueError(
                f"{assessment_type} scores must be within {minimum} and {maximum}"
            )
        if not scores.mod(1).eq(0).all():
            raise ValueError(f"{assessment_type} scores must be whole numbers")

    if "created_at" in assessment_data:
        assessment_data["_timestamp"] = pd.to_datetime(
            assessment_data["created_at"], errors="coerce", utc=True
        )
        assessment_data = assessment_data.sort_values(
            ["student_id", "assessment_type", "_timestamp"],
            kind="stable",
            na_position="first",
        )

    latest_assessments = assessment_data.drop_duplicates(
        ["student_id", "assessment_type"], keep="last"
    )
    assessment_as_of = None
    if "_timestamp" in latest_assessments:
        assessment_as_of = latest_assessments.groupby("student_id")["_timestamp"].max()
    score_features = latest_assessments.pivot(
        index="student_id",
        columns="assessment_type",
        values="total_score",
    ).rename(
        columns={
            "PHQ-9": "phq9_score",
            "GAD-7": "gad7_score",
            "PSS-10": "pss_score",
        }
    )
    features = pd.DataFrame(index=score_features.index)
    for column in ("phq9_score", "gad7_score", "pss_score"):
        features[column] = (
            score_features[column] if column in score_features else np.nan
        )

    if checkins is not None and not checkins.empty:
        checkin_data = _clean_student_ids(checkins)
        if "mood_score" not in checkin_data:
            raise ValueError("Check-in data is missing required column: mood_score")
        checkin_data["mood_score"] = _numeric_column(
            checkin_data, "mood_score", required=True
        )
        observed_mood = checkin_data["mood_score"].dropna()
        if not observed_mood.between(1, 5).all():
            raise ValueError("mood_score values must be within 1 and 5")
        if not observed_mood.mod(1).eq(0).all():
            raise ValueError("mood_score values must be whole numbers")
        if "created_at" in checkin_data:
            checkin_data["_timestamp"] = pd.to_datetime(
                checkin_data["created_at"], errors="coerce", utc=True
            )
            if assessment_as_of is not None:
                checkin_data["_as_of"] = checkin_data["student_id"].map(
                    assessment_as_of
                )
                checkin_data = checkin_data[
                    checkin_data["_as_of"].isna()
                    | checkin_data["_timestamp"].le(checkin_data["_as_of"])
                ].copy()
            checkin_data = checkin_data.sort_values(
                ["student_id", "_timestamp"], kind="stable", na_position="first"
            )
        checkin_data = checkin_data.groupby("student_id", sort=False).tail(
            checkin_window
        )
        checkin_features = checkin_data.groupby("student_id")["mood_score"].agg(
            mood_avg="mean",
            mood_std=lambda values: values.std(ddof=0),
        )
        features = features.join(checkin_features, how="outer")
    else:
        features["mood_avg"] = np.nan
        features["mood_std"] = np.nan

    if academics is not None and not academics.empty:
        academic_data = _clean_student_ids(academics)
        gpa_column = next(
            (column for column in ("current_gpa", "gpa") if column in academic_data),
            None,
        )
        if gpa_column:
            academic_data["_gpa"] = _numeric_column(academic_data, gpa_column)
            observed_gpa = academic_data["_gpa"].dropna()
            if not observed_gpa.between(0, 100).all():
                raise ValueError(f"{gpa_column} values must be within 0 and 100")
        else:
            academic_data["_gpa"] = np.nan

        hito_means = pd.DataFrame(index=academic_data.index)
        for index, (processual, grade) in enumerate(HITO_COLUMNS, start=2):
            if processual in academic_data and grade in academic_data:
                processual_scores = _numeric_column(academic_data, processual)
                milestone_scores = _numeric_column(academic_data, grade)
                hito_total = processual_scores + milestone_scores
                if not hito_total.dropna().between(0, 25).all():
                    raise ValueError(f"Hito {index} totals must be within 0 and 25")
                hito_means[f"hito{index}"] = hito_total.where(hito_total > 0)

        if not hito_means.empty:
            academic_data = academic_data.join(hito_means)
            hito_columns = list(hito_means.columns)
            observed_hitos = academic_data[hito_columns]
            hito_counts = observed_hitos.notna().sum(axis=1)
            academic_data["_hito_avg"] = observed_hitos.mean(axis=1, skipna=True) * 4.0
            first_hito = observed_hitos.bfill(axis=1).iloc[:, 0]
            last_hito = observed_hitos.ffill(axis=1).iloc[:, -1]
            academic_data["_hito_delta"] = (last_hito - first_hito) * 4.0
            academic_data.loc[hito_counts.eq(0), ["_hito_avg", "_hito_delta"]] = np.nan
        else:
            academic_data["_hito_avg"] = np.nan
            academic_data["_hito_delta"] = np.nan

        grouped_academic = academic_data.groupby("student_id").agg(
            _gpa=("_gpa", "mean"),
            _hito_avg=("_hito_avg", "mean"),
            _hito_delta=("_hito_delta", "mean"),
        )
        grouped_academic["academic_avg"] = grouped_academic["_hito_avg"].where(
            grouped_academic["_hito_avg"].notna(), grouped_academic["_gpa"]
        )
        grouped_academic["academic_delta"] = grouped_academic["_hito_delta"]
        features = features.join(
            grouped_academic[["academic_avg", "academic_delta"]],
            how="outer",
        )
    else:
        features["academic_avg"] = np.nan
        features["academic_delta"] = np.nan

    features = features.reindex(columns=FEATURE_COLUMNS)
    features = features.dropna(how="all", subset=REQUIRED_FEATURE_COLUMNS)
    if features.empty:
        raise ValueError("No students have any usable assessment or context features")
    if features[["phq9_score", "gad7_score"]].notna().sum().sum() == 0:
        raise ValueError("No PHQ-9 or GAD-7 scores are available in the data")

    raw_ids = features.index.astype(str)
    features.insert(
        0,
        "student_id",
        [
            hmac.new(
                id_salt.encode("utf-8"),
                student_id.encode("utf-8"),
                hashlib.sha256,
            ).hexdigest()
            for student_id in raw_ids
        ],
    )
    return features.reset_index(drop=True)


def severity_score(features: pd.DataFrame) -> pd.Series:
    """Calculate relative exploratory severity from score direction, not a diagnosis."""
    oriented = pd.DataFrame(index=features.index)
    for column, maximum in (("phq9_score", 27), ("gad7_score", 21), ("pss_score", 40)):
        oriented[column] = pd.to_numeric(features[column], errors="coerce") / maximum
    oriented["mood_avg"] = (
        1 - (pd.to_numeric(features["mood_avg"], errors="coerce") - 1) / 4
    )
    oriented["mood_std"] = pd.to_numeric(features["mood_std"], errors="coerce") / 2
    oriented["academic_avg"] = (
        1 - pd.to_numeric(features["academic_avg"], errors="coerce") / 100
    )
    oriented["academic_delta"] = (
        -pd.to_numeric(features["academic_delta"], errors="coerce")
    ).clip(lower=0, upper=100) / 100
    return oriented.mean(axis=1, skipna=True)


@dataclass
class UnsupervisedRiskExplorer:
    """Exploratory cohort profiles; outputs are not validated clinical risk labels."""

    n_clusters: int = 3
    contamination: float | str = "auto"
    random_state: int = 42

    def __post_init__(self) -> None:
        if self.n_clusters not in (2, 3, 4):
            raise ValueError("n_clusters must be 2, 3, or 4")
        if self.contamination != "auto" and not 0 < float(self.contamination) <= 0.5:
            raise ValueError("contamination must be 'auto' or in the range (0, 0.5]")
        self.feature_columns: list[str] = []
        self.preprocessor: Pipeline | None = None
        self.kmeans: KMeans | None = None
        self.isolation_forest: IsolationForest | None = None
        self.cluster_profiles: pd.DataFrame | None = None
        self.selected_rows: pd.DataFrame | None = None

    @staticmethod
    def _preprocessor() -> Pipeline:
        return Pipeline(
            steps=[
                ("imputer", SimpleImputer(strategy="median")),
                ("scaler", RobustScaler()),
            ]
        )

    def _validate_features(
        self, data: pd.DataFrame, select_available: bool = True
    ) -> pd.DataFrame:
        missing_columns = [
            column for column in FEATURE_COLUMNS if column not in data.columns
        ]
        if missing_columns:
            raise ValueError(f"Data is missing features: {missing_columns}")

        validated = data[FEATURE_COLUMNS].apply(pd.to_numeric, errors="coerce")
        invalid = data[FEATURE_COLUMNS].notna() & validated.isna()
        if invalid.any().any():
            raise ValueError("Feature data contains non-numeric values")

        ranges = {
            "phq9_score": (0, 27),
            "gad7_score": (0, 21),
            "pss_score": (0, 40),
            "mood_avg": (1, 5),
            "mood_std": (0, 2),
            "academic_avg": (0, 100),
            "academic_delta": (-100, 100),
        }
        for column, (minimum, maximum) in ranges.items():
            observed = validated[column].dropna()
            if not observed.between(minimum, maximum).all():
                raise ValueError(
                    f"{column} values must be within {minimum} and {maximum}"
                )
        for column in ("phq9_score", "gad7_score", "pss_score"):
            observed = validated[column].dropna()
            if not observed.mod(1).eq(0).all():
                raise ValueError(f"{column} values must be whole numbers")
        if validated.isna().all(axis=None):
            raise ValueError("No usable feature values were supplied")

        selected = [
            column for column in FEATURE_COLUMNS if validated[column].notna().any()
        ]
        if not validated["phq9_score"].notna().any():
            raise ValueError("At least one PHQ-9 score is required")
        if not validated["gad7_score"].notna().any():
            raise ValueError("At least one GAD-7 score is required")
        if select_available:
            self.feature_columns = selected
        elif not set(self.feature_columns).issubset(validated.columns):
            raise ValueError("Prediction data is missing features used during fitting")
        return validated[selected if select_available else self.feature_columns]

    @staticmethod
    def evaluate_cluster_counts(
        scaled_features: np.ndarray,
        min_clusters: int = 2,
        max_clusters: int = 4,
        random_state: int = 42,
    ) -> pd.DataFrame:
        max_feasible = min(max_clusters, len(scaled_features) - 1)
        rows = []
        for k in range(min_clusters, max_feasible + 1):
            model = KMeans(n_clusters=k, n_init=20, random_state=random_state)
            labels = model.fit_predict(scaled_features)
            distinct_labels = np.unique(labels)
            silhouette = (
                float(silhouette_score(scaled_features, labels))
                if 1 < len(distinct_labels) < len(scaled_features)
                else np.nan
            )
            rows.append(
                {
                    "k": k,
                    "inertia": float(model.inertia_),
                    "silhouette_score": silhouette,
                    "non_empty_clusters": len(distinct_labels),
                }
            )
        if not rows:
            raise ValueError("At least three students are required to evaluate k")
        return pd.DataFrame(rows)

    def fit(self, data: pd.DataFrame) -> "UnsupervisedRiskExplorer":
        if len(data) < max(3, self.n_clusters):
            raise ValueError(
                f"At least {max(3, self.n_clusters)} students are required"
            )

        raw_features = self._validate_features(data)
        if raw_features.shape[1] < 1:
            raise ValueError("At least one non-empty feature column is required")
        self.selected_rows = data.copy()
        self.preprocessor = self._preprocessor()
        scaled = self.preprocessor.fit_transform(raw_features)
        self.kmeans = KMeans(
            n_clusters=self.n_clusters,
            n_init=20,
            random_state=self.random_state,
        )
        self.isolation_forest = IsolationForest(
            contamination=self.contamination,
            random_state=self.random_state,
        )
        self.kmeans.fit(scaled)
        self.isolation_forest.fit(scaled)

        augmented = data.copy().reset_index(drop=True)
        augmented["cluster_id"] = self.kmeans.labels_
        augmented["severity_score_relative"] = severity_score(augmented)
        self.cluster_profiles = self._profile_clusters(augmented)
        return self

    def _profile_clusters(self, data: pd.DataFrame) -> pd.DataFrame:
        profiles = (
            data.groupby("cluster_id")[FEATURE_COLUMNS + ["severity_score_relative"]]
            .mean(numeric_only=True)
            .sort_values("severity_score_relative")
        )
        labels = PROFILE_LABELS[self.n_clusters]
        profile_labels = {}
        for rank, cluster_id in enumerate(profiles.index):
            label_index = round(rank * (len(labels) - 1) / max(len(profiles) - 1, 1))
            label, color = labels[label_index]
            profile_labels[cluster_id] = (rank + 1, label, color)
        profiles["relative_severity_rank"] = [
            profile_labels[cluster_id][0] for cluster_id in profiles.index
        ]
        profiles["risk_label"] = [
            profile_labels[cluster_id][1] for cluster_id in profiles.index
        ]
        profiles["plot_color"] = [
            profile_labels[cluster_id][2] for cluster_id in profiles.index
        ]
        return profiles

    def predict(self, data: pd.DataFrame) -> pd.DataFrame:
        if (
            self.preprocessor is None
            or self.kmeans is None
            or self.isolation_forest is None
            or self.cluster_profiles is None
        ):
            raise RuntimeError("Fit the explorer before requesting predictions")

        raw_features = self._validate_features(data, select_available=False)
        scaled = self.preprocessor.transform(raw_features)
        cluster_ids = self.kmeans.predict(scaled)
        anomaly_flags = self.isolation_forest.predict(scaled)
        anomaly_scores = -self.isolation_forest.decision_function(scaled)
        result = data.copy().reset_index(drop=True)
        result["cluster_id"] = cluster_ids
        result["risk_label"] = result["cluster_id"].map(
            self.cluster_profiles["risk_label"]
        )
        result["plot_color"] = result["cluster_id"].map(
            self.cluster_profiles["plot_color"]
        )
        result["relative_severity_rank"] = result["cluster_id"].map(
            self.cluster_profiles["relative_severity_rank"]
        )
        result["severity_score_relative"] = severity_score(result)
        result["anomaly_score"] = anomaly_scores
        result["is_anomaly"] = anomaly_flags
        return result

    def fit_predict(self, data: pd.DataFrame) -> pd.DataFrame:
        return self.fit(data).predict(data)

    def evaluation_metrics(self) -> pd.DataFrame:
        if self.preprocessor is None or self.selected_rows is None:
            raise RuntimeError("Fit the explorer before evaluating cluster counts")
        raw_features = self._validate_features(
            self.selected_rows, select_available=False
        )
        scaled = self.preprocessor.transform(raw_features)
        return self.evaluate_cluster_counts(
            scaled,
            random_state=self.random_state,
        )

    def pca_projection(self, data: pd.DataFrame) -> pd.DataFrame:
        if self.preprocessor is None:
            raise RuntimeError("Fit the explorer before projecting with PCA")
        raw_features = self._validate_features(data, select_available=False)
        scaled = self.preprocessor.transform(raw_features)
        if scaled.shape[1] == 1:
            coordinates = np.column_stack(
                [scaled[:, 0], np.zeros(shape=(len(scaled),))]
            )
            variance_ratio = (1.0, 0.0)
        else:
            pca = PCA(n_components=2, random_state=self.random_state)
            coordinates = pca.fit_transform(scaled)
            variance_ratio = tuple(
                float(value) for value in pca.explained_variance_ratio_
            )
        projection = data.copy().reset_index(drop=True)
        projection["pca_1"] = coordinates[:, 0]
        projection["pca_2"] = coordinates[:, 1]
        projection.attrs["explained_variance_ratio"] = variance_ratio
        return projection

    def profile_table(self) -> pd.DataFrame:
        if self.cluster_profiles is None:
            raise RuntimeError("Fit the explorer before requesting cluster profiles")
        return self.cluster_profiles.copy()
