# QS World University Rankings — Analytics & Re-Ranking Platform

[![Python Pipeline](https://img.shields.io/badge/Pipeline-Python%203.11%20%7C%20Pandas%20%7C%20Scikit--Learn-blue)](pipeline/)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014%20%7C%20TypeScript%20%7C%20Tailwind-indigo)](frontend/)
[![Data Quality Audit](https://img.shields.io/badge/Data%20Quality-100%25%20Imputed%20%26%20Tracked-emerald)](METHODOLOGY.md)

An independent, transparent re-ranking platform and data quality audit for the **QS 2025 World University Rankings** dataset. This project addresses missingness in public ranking data, implements a 3-layer imputation cascade with per-cell method tracking, standardizes indicator score distributions, and provides a deterministic 10-level tie-breaker ranking system.

---

## 🌟 Key Features

1. **Missing-Value Taxonomy Resolution**: Parses `NaN`, dashes (`'-'`), empty strings, and banded rank patterns (`701+`, `43=`) across 1,504 universities.
2. **3-Layer Imputation Cascade with Method Tracking**:
   - **Layer 1 (Group Median)**: Country + Size + Research intensity ($n \ge 3$).
   - **Layer 2 (K-Nearest Neighbors)**: $k=5$, distance-weighted Euclidean (country excluded to prevent false geographical proximity).
   - **Layer 3 (Global Median)**: Fallback guarantee.
   - Every cell is stamped with `*_imputed_method` (`observed`, `group_median`, `knn`, `global_median`).
3. **Indicator Standardization & QS Weighting**:
   - Z-score normalization $\rightarrow$ $0–100$ min-max rescaling per indicator.
   - Official QS 2025 Weights applied: Academic Reputation (30%), Employer Reputation (15%), Faculty Student Ratio (10%), Citations per Faculty (20%), International Faculty (5%), International Students (5%), International Research Network (5%), Employment Outcomes (5%), Sustainability (5%).
4. **Deterministic 10-Level Tie-Breaker Ranking**: Sorts by overall score $\rightarrow$ 9 indicator scores (descending) $\rightarrow$ university name (ascending).
5. **Full-Stack Next.js Dashboard**: 5 interactive pages featuring live search, multi-filters, rank-shift gainers/losers, correlation heatmaps, ANOVA/t-test cards, data quality audit tables, and full Light/Dark mode support.

---

## 📊 Statistical Highlights

- **Retained Records**: 1,504 out of 1,504 universities (0 rows deleted).
- **Imputation Rate**: 1.22% of total score cells imputed (98.78% observed).
- **Public vs. Private Welch's t-Test**: $t = 2.8122, p = 0.005124$ (Public mean score 31.84 vs Private 28.31 — statistically significant).
- **One-Way ANOVA (Institution Size)**: $F = 24.5757, p < 0.000001$ (statistically significant).
- **Academic & Employer Reputation Correlation**: $r = 0.8630$.

---

## 📁 Repository Structure

```
├── METHODOLOGY.md                    # The 7 Golden Methodology Rules
├── main_db.csv                       # Raw source dataset (1,504 rows x 27 cols)
├── README.md                         # Project documentation
├── pipeline/                         # Python Data Pipeline
│   ├── config.py                     # Official weights & manual updates
│   ├── cleaning.py                   # Score/rank parsers & metadata validations
│   ├── imputation.py                 # 3-layer cascade + per-cell method tracking
│   ├── scoring.py                    # Z-score min-max rescaling & QS weights
│   ├── analysis.py                   # Welch's t-test, ANOVA & Pearson correlation
│   ├── aggregation.py                # Country, Region, Size, Status summaries
│   ├── export.py                     # Exports JSON data contracts & Excel workbooks
│   ├── run_pipeline.py               # Master entrypoint orchestrator
│   └── deep_verification.py         # 6-stage automated test suite
└── frontend/                         # Next.js Web Application
    ├── src/app/
    │   ├── rankings/page.tsx         # Global Rankings Table (search, multi-filters, pagination)
    │   ├── compare/page.tsx          # Rank-Shift Visualizer & Regional Bar Charts
    │   ├── insights/page.tsx         # Correlation Matrix Heatmap & Statistical Cards
    │   ├── data-quality/page.tsx     # Pre-Imputation Missingness & 3-Layer Audit Tables
    │   └── methodology/page.tsx      # Case Study Narrative & 7 Golden Rules
    └── public/data/                  # Synced JSON data contracts
```

---

## 🚀 Quick Start Guide

### 1. Data Pipeline Execution

```bash
# Execute master pipeline
python -m pipeline.run_pipeline

# Run 6-stage deep verification test suite
python -m pipeline.deep_verification
```

### 2. Frontend Development Server

```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Technology Stack

- **Pipeline**: Python 3.11, Pandas, Scikit-learn, Scipy, NumPy
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS v4, Recharts, Lucide Icons

---

## 📜 Disclaimer & Source Metadata

- **Data Source**: [topuniversities.com/world-university-rankings](https://www.topuniversities.com/world-university-rankings)
- **Publication Date**: 18 June 2026
- **Disclaimer**: This project is an independent, non-commercial data engineering and statistical research project conducted by Ankon Banik. It is not affiliated with or endorsed by Quacquarelli Symonds (QS).

---

## 👨‍💻 Author & Contact

**Ankon Banik**  
*Full-Stack Data Engineer & Web Architect*  
- Email: [ankonbnk@gmail.com](mailto:ankonbnk@gmail.com)  
- GitHub: [github.com/AnkonBanik](https://github.com/AnkonBanik)  
- LinkedIn: [linkedin.com/in/ankonbanik](https://www.linkedin.com/in/ankonbanik)
