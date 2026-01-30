from app.ml.risk_classifier import risk_classifier


def test_risk_low():
    # PSS=0, Mood=5 (Great), BadDays=0, Pressure=1 (Low)
    risk, conf = risk_classifier.predict_risk(
        pss_score=0.0, checkin_avg=5.0, bad_days_count=0, academic_pressure_avg=1.0
    )
    assert risk == "Low"
    assert conf > 0.8


def test_risk_high():
    # PSS=1.0 (Max), Mood=1 (Bad), BadDays=7, Pressure=5 (High)
    risk, conf = risk_classifier.predict_risk(
        pss_score=1.0, checkin_avg=1.0, bad_days_count=7, academic_pressure_avg=5.0
    )
    assert risk == "High"
    assert conf > 0.8


def test_risk_medium():
    # Mixed signals
    risk, conf = risk_classifier.predict_risk(
        pss_score=0.5, checkin_avg=3.0, bad_days_count=3, academic_pressure_avg=3.0
    )
    # Calculation: 0.5*0.3 + 0.5*0.3 + 0.42*0.2 + 0.5*0.2
    # = 0.15 + 0.15 + 0.084 + 0.1 = 0.484
    # Should be Medium (0.3 < x < 0.6)
    assert risk == "Medium"
