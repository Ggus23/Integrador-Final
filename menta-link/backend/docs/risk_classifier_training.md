# RiskClassifier training and activation

RiskClassifier uses six input/context columns when loading a compatible model:

| Column | Valid range |
| --- | ---: |
| `pss_score` | 0–40 |
| `gad7_score` | 0–21 |
| `phq9_score` | 0–27 |
| `mood_avg` | 1–5 |
| `bad_days_count` | 0–7 |
| `academic_pressure_avg` | 1–5 |

PSS-10's positive items must already be reverse-scored before its total is
recorded. GAD-7 and PHQ-9 totals are direct sums. A positive PHQ-9 item 9
remains an immediate `Critical` escalation in the application and is not
delegated to a model. The six input columns must match exactly between training
and inference.

`mood_avg`, `bad_days_count`, and `academic_pressure_avg` are derived from the
latest seven application check-ins. If a test score is missing, the training
pipeline imputes it with the training-set median.

For a real student-care deployment, training data must be authorized and use
independently verified outcome labels. Do not train a clinical production model
with the simulated labels described below. The supplied `Raw data.xlsx`
workbook contains complete scale responses but does not contain a verified
outcome target or established provenance/consent, and cannot validate this
model.

For future training with verified `Low`/`Medium`/`High` labels, prepare an
approved CSV at `backend/data/processed_training_data.csv` (or pass another
path with `--data`) containing all six features and `risk_level`, then run from
`backend`:

```powershell
python scripts\training\train_med_model.py
```

The script checks columns, score ranges, labels, and class counts for a
stratified holdout; it reports metrics and saves a calibrated candidate
separately. It does not overwrite the configured artifact. Inspect provenance
and evaluation before deployment. Existing artifacts with a different feature
schema are refused and the app uses its current heuristic instead.

## Synthetic thesis demonstration

The following pipeline is only for a reproducible thesis defense. It creates
disabled demo accounts on a **local** database, synthetic correlated check-ins
and test scores, and artificial dropout targets. No institutional or clinical
labels are present. All output metrics describe the generated rule, not
real-world accuracy, and this artifact must not be used for real student care.

From `backend`, migrate the local database and seed 1,000–2,000 records (default
1,500):

```powershell
alembic upgrade head
python scripts\training\seed_synthetic_risk_history.py --rows 1500
python scripts\training\consolidate_synthetic_dropout_labels.py
python scripts\training\train_synthetic_risk_model.py
```

If the local PostgreSQL service is unavailable, an isolated SQLite thesis-demo
database can be used instead (it is not the configured PostgreSQL instance and
uses ORM schema creation instead of Alembic):

```powershell
$env:SQLALCHEMY_DATABASE_URI = "sqlite:///data/synthetic_thesis_demo.sqlite3"
python scripts\training\seed_synthetic_risk_history.py `
  --rows 1500 --create-sqlite-schema
python scripts\training\consolidate_synthetic_dropout_labels.py
python scripts\training\train_synthetic_risk_model.py
```

The seeder refuses non-local database hosts, creates separate disabled demo
students, and writes only rows tagged `RiskClassifierSyntheticDemo`. The
consolidator reads those rows from `ai_predictions`, assigns each synthetic
observation a simulated `desertor` label using a probabilistic rule, and writes
a CSV plus a manifest identifying the artificial target. Because the app's pressure input is
1–5, the example high-pressure rule uses `academic_pressure_avg > 4`, not `> 8`.
The trainer separates students between train and test and uses grouped
cross-validation for sigmoid calibration. Its Random Forest does not need a
feature scaler; the median imputer and calibrated model are serialized together.
ROC AUC, F1, and Brier score are demonstrations against generated labels only.

The demo model is saved separately as
`app/models/risk_model_synthetic_demo.joblib`; it does not overwrite
`app/models/risk_model.pkl`. To opt in for a thesis demonstration only, start the backend from `backend`
with the model path and explicit safety switch below. If using the SQLite
demonstration database, set that same URL before starting the API as well:

```powershell
$env:SQLALCHEMY_DATABASE_URI = "sqlite:///data/synthetic_thesis_demo.sqlite3"
$env:ML_MODEL_PATH = "app/models/risk_model_synthetic_demo.joblib"
$env:ALLOW_SYNTHETIC_RISK_MODEL = "true"
```

Without the explicit opt-in, `RiskClassifier` refuses the synthetic bundle and
retains its existing heuristic fallback. In demo mode the binary synthetic
dropout probability maps to `Low`/`High`; this is not a mental-health or
clinical-risk probability. The independent PHQ-9 item 9 critical escalation
remains unchanged.

## Shadow input history

Each RiskClassifier inference is also appended to `ai_predictions` with its
timestamp (`created_at`) and six input/context values: `pss_score`, `gad_score`,
`phq_score`, `mood_avg`, `bad_days_count`, and `academic_pressure_avg`. The
extra context columns are nullable so existing prediction writers remain
compatible. This logging does not feed back into the app's risk decision.
Apply the database migration before deploying code that writes these columns.

The user ID and these assessment/context values are sensitive data. Restrict
database/export access, define an approved retention period, and use an
authorized pseudonymization process for analysis. At the end of the observation
period, join the timestamps and student identifiers to independently verified
institutional outcomes. Do not use the operational `risk_level`, heuristic
score, or unsupervised cluster as the ground-truth outcome label; crisis labels
require confirmation by authorized clinical professionals. This log alone
does not establish consent, label validity, or model readiness.

## Exploratory unsupervised analysis

`app/ml/unsupervised_risk_explorer.py` and
`scripts/training/fit_unsupervised_risk_models.py` provide a separate,
exploratory pipeline using the current backend tables. It integrates three CSV
exports by `user_id` (or `student_id`):

- Assessments: `assessment_type`, `total_score`, optional `created_at`; latest
  PSS-10/GAD-7/PHQ-9 score per student is used.
- Check-ins: `mood_score`, optional `created_at`; mean and population standard
  deviation are computed over the latest seven observations by default.
- Academic profile/records or subject-grade export: `current_gpa` or `gpa` and,
  when present, paired `hitoN_procesual` and `hitoN_nota` values. Available
  Hitos are converted from 0–25 to percent; the average and last-minus-first
  change yield `academic_avg` and `academic_delta`. Zero Hito totals are treated
  as unsubmitted because the backend initializes unentered grades to zero.

PSS-10 is optional and is omitted from the fitted feature set when absent
throughout the cohort. PHQ-9 and GAD-7 must each have at least one observed
score. Partial per-student scores/context are median-imputed. The source Excel
files in `DATASET` are independent research cohorts and cannot be safely joined
to platform users by their IDs; this script therefore consumes application
exports rather than pretending those identifiers match.

The script uses robust scaling, evaluates K-Means k=2–4 using inertia and
silhouette, selects k=3 or k=4 by silhouette by default, fits Isolation Forest,
profiles clusters by relative severity direction, and generates PCA,
elbow/silhouette and cluster-profile plots. `academic_delta` is positive for
improvement and negative for decline. A stable HMAC pseudonym is written in
place of the source student ID; provide the same strong secret only through
the `STUDENT_ID_SALT` environment variable to reproduce pseudonyms across runs.
Keep source exports and the salt restricted; the output is still sensitive
pseudonymous data.

Install visualization requirements into the backend environment, then run from
`backend`:

```powershell
pip install -r requirements.txt
$env:STUDENT_ID_SALT = "<strong secret kept outside source control>"
python scripts\training\fit_unsupervised_risk_models.py `
  --assessments path\to\assessments.csv `
  --checkins path\to\checkins.csv `
  --academics path\to\academic_records.csv `
  --output-dir path\to\restricted\exploration
```

It exports enriched student rows, cluster means, k-evaluation metrics, plots,
and a separate `unsupervised_risk_candidate.joblib`; this never replaces or
feeds the supervised RiskClassifier. `risk_label` denotes only an ordinal
profile relative to the analyzed cohort (not a calibrated Low/Moderate/High/
Critical clinical category); IDs of clusters are arbitrary. `is_anomaly` uses
Isolation Forest's convention (-1 anomalous, 1 inlier), and `anomaly_score`
only indicates statistical atypicality relative to the fitted cohort. These
outputs must not be interpreted as diagnosis, crisis detection, or a validated
recommendation for intervention. PHQ-9 item 9 must remain on the separate
existing safety-alert path.
