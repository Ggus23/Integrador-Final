import pytest

from app.core.constants import AssessmentType, RiskLevel
from app.services.risk_service import risk_service
from app.services.scoring_service import scoring_service


def test_pss_scoring():
    responses = [{"value": 1}, {"value": 2}, {"value": 1}]  # Total 4
    score = scoring_service.calculate_score(AssessmentType.PSS, responses)
    assert score == 4


def test_dass_21_scoring():
    responses = [{"value": 1}, {"value": 2}]  # Total 3 -> *2 = 6
    score = scoring_service.calculate_score(AssessmentType.DASS_21, responses)
    assert score == 6


def test_risk_mapping_pss():
    assert risk_service.assess_risk(AssessmentType.PSS, 10) == RiskLevel.LOW
    assert risk_service.assess_risk(AssessmentType.PSS, 20) == RiskLevel.MEDIUM
    assert risk_service.assess_risk(AssessmentType.PSS, 30) == RiskLevel.HIGH
