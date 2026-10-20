import pandas as pd
import pytest

from app.ml.unsupervised_risk_explorer import (
    FEATURE_COLUMNS,
    UnsupervisedRiskExplorer,
    build_student_features,
)
from scripts.training.fit_unsupervised_risk_models import fit_models


def _source_tables():
    assessments = []
    checkins = []
    academics = []
    for student in range(1, 13):
        assessments.extend(
            [
                {
                    "user_id": student,
                    "assessment_type": "PHQ-9",
                    "total_score": min(student * 2, 27),
                    "created_at": "2026-01-01",
                },
                {
                    "user_id": student,
                    "assessment_type": "GAD-7",
                    "total_score": min(student, 21),
                    "created_at": "2026-01-01",
                },
            ]
        )
        for day in range(3):
            checkins.append(
                {
                    "user_id": student,
                    "mood_score": min(5, max(1, 6 - (student // 3) - day % 2)),
                    "created_at": f"2026-01-0{day + 1}",
                }
            )
        academics.append(
            {
                "user_id": student,
                "current_gpa": 100 - student * 5,
                "hito2_procesual": 12,
                "hito2_nota": 8,
                "hito3_procesual": 10,
                "hito3_nota": 7,
                "hito4_procesual": 9,
                "hito4_nota": 6,
                "hito5_procesual": 8,
                "hito5_nota": 5,
            }
        )
    return (
        pd.DataFrame(assessments),
        pd.DataFrame(checkins),
        pd.DataFrame(academics),
    )


def prueba_build_integrates_sources_and_pseudonymizes_student_ids():
    assessments, checkins, academics = _source_tables()

    features = build_student_features(
        assessments,
        checkins,
        academics,
        id_salt="test-only-salt",
    )

    assert len(features) == 12
    assert list(features.columns) == ["student_id", *FEATURE_COLUMNS]
    assert features["student_id"].str.len().eq(64).all()
    assert "1" not in set(features["student_id"])
    assert features["phq9_score"].between(0, 27).all()
    assert features["gad7_score"].between(0, 21).all()
    assert features["mood_avg"].between(1, 5).all()
    assert features["academic_avg"].between(0, 100).all()
    assert features["academic_delta"].lt(0).all()


def prueba_build_allows_absent_pss10_and_missing_context():
    assessments, _, _ = _source_tables()
    assessments = assessments[assessments["assessment_type"] != "PSS-10"]

    features = build_student_features(
        assessments,
        checkins=None,
        academics=None,
        id_salt="test-only-salt",
    )

    assert features["pss_score"].isna().all()
    assert features["mood_avg"].isna().all()
    assert features["academic_avg"].isna().all()


def prueba_build_limits_checkins_to_assessment_date():
    assessments = pd.DataFrame(
        [
            {
                "user_id": 1,
                "assessment_type": "PHQ-9",
                "total_score": 12,
                "created_at": "2026-01-02",
            },
            {
                "user_id": 1,
                "assessment_type": "GAD-7",
                "total_score": 8,
                "created_at": "2026-01-02",
            },
        ]
    )
    checkins = pd.DataFrame(
        [
            {"user_id": 1, "mood_score": 3, "created_at": "2026-01-01"},
            {"user_id": 1, "mood_score": 5, "created_at": "2026-01-02"},
            {"user_id": 1, "mood_score": 1, "created_at": "2026-01-03"},
        ]
    )

    features = build_student_features(
        assessments,
        checkins,
        academics=None,
        id_salt="test-only-salt",
    )

    assert features.loc[0, "mood_avg"] == 4
    assert features.loc[0, "mood_std"] == 1


def prueba_explorer_profiles_relative_clusters_and_outputs_anomaly_signs():
    assessments, checkins, academics = _source_tables()
    features = build_student_features(
        assessments,
        checkins,
        academics,
        id_salt="test-only-salt",
    )
    explorer = UnsupervisedRiskExplorer(n_clusters=3)

    results = explorer.fit_predict(features)

    assert set(results["is_anomaly"].unique()).issubset({-1, 1})
    assert (
        results["risk_label"]
        .str.contains("perfil relativo|perfil intermedio", regex=True)
        .all()
    )
    assert not results["risk_label"].str.contains("crítico", case=False).any()
    assert set(results["cluster_id"]).issubset({0, 1, 2})
    assert {"cluster_id", "risk_label", "anomaly_score", "is_anomaly"}.issubset(
        results.columns
    )


def prueba_evaluation_and_pca_expose_silhouette_elbow_and_projection():
    assessments, checkins, academics = _source_tables()
    features = build_student_features(
        assessments,
        checkins,
        academics,
        id_salt="test-only-salt",
    )
    explorer = UnsupervisedRiskExplorer(n_clusters=3).fit(features)

    metrics = explorer.evaluation_metrics()
    projection = explorer.pca_projection(features)

    assert {"k", "inertia", "silhouette_score"}.issubset(metrics.columns)
    assert set(metrics["k"]) == {2, 3, 4}
    assert {"pca_1", "pca_2"}.issubset(projection.columns)
    assert len(projection) == len(features)
    assert len(explorer.profile_table()) == 3


def prueba_explorer_requires_both_phq9_and_gad7_somewhere():
    assessments, checkins, academics = _source_tables()
    assessments = assessments[assessments["assessment_type"] != "GAD-7"]
    features = build_student_features(
        assessments,
        checkins,
        academics,
        id_salt="test-only-salt",
    )

    with pytest.raises(ValueError, match="At least one GAD-7 score is required"):
        UnsupervisedRiskExplorer().fit(features)


def prueba_explorer_rejects_out_of_range_scores():
    assessments, checkins, academics = _source_tables()
    features = build_student_features(
        assessments,
        checkins,
        academics,
        id_salt="test-only-salt",
    )
    features.loc[0, "phq9_score"] = 28

    with pytest.raises(ValueError, match="phq9_score values must be within"):
        UnsupervisedRiskExplorer().fit(features)


def prueba_explorer_requires_fit_before_prediction():
    assessments, checkins, academics = _source_tables()
    features = build_student_features(
        assessments,
        checkins,
        academics,
        id_salt="test-only-salt",
    )

    with pytest.raises(RuntimeError, match="Fit the explorer"):
        UnsupervisedRiskExplorer().predict(features)


def prueba_build_rejects_missing_pseudonymization_salt():
    assessments, checkins, academics = _source_tables()

    with pytest.raises(ValueError, match="id_salt is required"):
        build_student_features(assessments, checkins, academics, id_salt="")


def prueba_fit_script_exports_results_profiles_metrics_plots_and_candidate(tmp_path):
    assessments, checkins, academics = _source_tables()
    assessments_path = tmp_path / "assessments.csv"
    checkins_path = tmp_path / "checkins.csv"
    academics_path = tmp_path / "academics.csv"
    output_dir = tmp_path / "restricted-output"
    assessments.to_csv(assessments_path, index=False)
    checkins.to_csv(checkins_path, index=False)
    academics.to_csv(academics_path, index=False)

    results = fit_models(
        assessments_path=str(assessments_path),
        checkins_path=str(checkins_path),
        academics_path=str(academics_path),
        output_dir=str(output_dir),
        id_salt="test-only-salt",
    )

    assert len(results) == 12
    assert results["student_id"].str.len().eq(64).all()
    assert "1" not in set(results["student_id"])
    for filename in (
        "student_risk_exploration.csv",
        "cluster_profiles.csv",
        "cluster_evaluation.csv",
        "cluster_evaluation.png",
        "cluster_pca.png",
        "cluster_profiles.png",
        "unsupervised_risk_candidate.joblib",
    ):
        assert (output_dir / filename).is_file()
