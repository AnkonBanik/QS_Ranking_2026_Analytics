# QS World University Rankings — Data Pipeline Methodology

This document serves as the single source of truth for the methodology, statistical rules, and data cleaning standards applied in this project. Both the Python data pipeline (`pipeline/`) and the public methodology documentation on the frontend dashboard inherit directly from these decisions.

---

## 1. Missing-Value Taxonomy

The QS raw data export hides missing values behind multiple string representations. The pipeline explicitly identifies and handles four types of missingness:

1. **`NaN`**: Standard IEEE 754 floating-point missing value (`np.nan`).
2. **Dash (`'-'`)**: Explicit dash string used in unranked/missing cells.
3. **Empty String (`''` or whitespace)**: Blank cells.
4. **Rank/Band Patterns (`701+`, `43=`, `801+`)**: 
   - In **SCORE** columns: Banded rankings without explicit numeric scores are treated as missing (`np.nan`).
   - In **RANK** columns: Regex pattern `^\d+[+=]?$` extracts the base numeric rank (e.g., `701+` → `701`, `43=` → `43`).

---

## 2. Three-Layer Imputation Strategy

To preserve all 1,503 university records without dropping rows, values are imputed in a strict 3-tier cascade:

* **Layer 1 — Group Median (High Specificity)**:
  - Grouping criteria: `['country', 'size', 'research']`
  - Threshold: Applied only if the group has at least **$n = 3$** non-missing observations.
  - Value: Group median.

* **Layer 2 — K-Nearest Neighbors (KNN - Multivariable Signal)**:
  - Model: `sklearn.impute.KNNImputer(n_neighbors=5, weights='distance')`
  - Distance Metric: Distance-weighted Euclidean (`nan_euclidean`).
  - Features: All 9 indicator score columns + ordinal encoded `size`, `status`, and `research`.
  - **Exclusion**: `country` is explicitly **excluded** from KNN features because integer label encoding induces false geographical proximity.

* **Layer 3 — Global Median (Fallback Guarantee)**:
  - Value: Column-wide median across the entire dataset.

Every imputed cell is explicitly tagged in `*_imputed_method` with one of: `observed`, `group_median`, `knn`, or `global_median`.

---

## 3. Indicator Standardization & Weighting

Raw QS indicator scores have unequal variances and distributions. To prevent wide-spread indicators from dominating the final sum:

1. Each indicator score $X$ is Z-score normalized:
   $$Z = \frac{X - \mu}{\sigma}$$
2. Z-scores are min-max rescaled to a $0–100$ scale:
   $$X_{\text{std}} = \frac{Z - Z_{\min}}{Z_{\max} - Z_{\min}} \times 100$$
3. Standardized scores are weighted using official QS 2025 weights:

| Indicator Code | Full Name | Weight |
|---|---|---|
| **AR** | Academic Reputation | 30% (`0.30`) |
| **ER** | Employer Reputation | 15% (`0.15`) |
| **FSR** | Faculty Student Ratio | 10% (`0.10`) |
| **CPF** | Citations per Faculty | 20% (`0.20`) |
| **IFR** | International Faculty Ratio | 5% (`0.05`) |
| **ISR** | International Student Ratio | 5% (`0.05`) |
| **IRN** | International Research Network | 5% (`0.05`) |
| **EO** | Employment Outcomes | 5% (`0.05`) |
| **SUS** | Sustainability | 5% (`0.05`) |

---

## 4. Status Grouping Mapping

For binary statistical comparisons (e.g., Welch's t-test), ownership status is mapped as:
- `'Public'` → `'Public'`
- `'Private not for Profit'` → `'Private'`
- `'Private for Profit'` → `'Private'`

This resolves category mismatch bugs and allows clean two-sample testing ($n = 1,197$ Public vs. $n = 307$ Private).

---

## 5. Dense Ranking & 10-Level Tie-Breaker

To ensure deterministic, reproducible overall rankings with zero gaps (dense rank):

Sort Hierarchy:
1. `overall_score_new` (Descending)
2. `AR score_standardized` (Descending)
3. `ER score_standardized` (Descending)
4. `FSR score_standardized` (Descending)
5. `CPF score_standardized` (Descending)
6. `IFR score_standardized` (Descending)
7. `ISR score_standardized` (Descending)
8. `IRN score_standardized` (Descending)
9. `EO score_standardized` (Descending)
10. `SUS score_standardized` (Descending)
11. `name` (Ascending / Alphabetical)

---

## 6. Manual Status & Size Verification Lists

Raw exports contain 56 status anomalies and 5 size anomalies due to raw string parsing issues. These are corrected using verified serial (`sl`) lookups defined in `pipeline/config.py`.

---

## 7. Data Quality Scorecard & Outliers

- **Outlier Flagging**: Interquartile Range (IQR) pass per indicator:
  $$\text{IQR} = Q_3 - Q_1, \quad \text{Bounds: } [Q_1 - 1.5\times\text{IQR}, Q_3 + 1.5\times\text{IQR}]$$
  Values outside bounds are flagged in `*_outlier` columns without deletion or modification.
