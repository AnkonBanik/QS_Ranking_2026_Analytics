"""
Master Data Pipeline Orchestrator for QS World University Rankings.

Workflow:
1. Load Raw Dataset (main_db.csv)
2. Analyze Raw Missing Values
3. Clean Data & Apply Manual Status/Size Corrections
4. Execute 3-Layer Imputation (Group Median -> KNN -> Global Median) with Method Tracking
5. Standardize Scores, Apply QS 2025 Weights, & Calculate Deterministic 10-Level Ranks
6. Run Statistical Hypothesis Tests & Flag Outliers via IQR
7. Compute Aggregations (Country, Region, Size, Status)
8. Export All JSON Data Contracts to /output/
"""
import pandas as pd
from pipeline.config import DATA_PATH, SCORE_COLUMNS
from pipeline.utils import analyze_missing_values
from pipeline.cleaning import clean_dataframe
from pipeline.imputation import run_3layer_imputation
from pipeline.scoring import run_scoring_and_ranking
from pipeline.analysis import (
    run_statistical_tests,
    compute_correlation_matrix,
    flag_iqr_outliers
)
from pipeline.aggregation import (
    aggregate_by_country,
    aggregate_by_region,
    aggregate_by_size,
    aggregate_by_status,
    cross_tabulate_size_status
)
from pipeline.export import export_all_pipeline_outputs


def main():
    print("=" * 70)
    print("      QS WORLD UNIVERSITY RANKINGS — MASTER DATA PIPELINE      ")
    print("=" * 70)

    # 1. Load Raw CSV
    print(f"\n[1/8] Loading Raw Source Dataset: {DATA_PATH}")
    df_raw = pd.read_csv(DATA_PATH)
    print(f"      Loaded {len(df_raw)} records × {len(df_raw.columns)} columns.")

    # 2. Missing Value Analysis
    print("\n[2/8] Analyzing Raw Missing Value Distribution...")
    missing_report_df = analyze_missing_values(df_raw, SCORE_COLUMNS)

    # 3. Clean DataFrame & Manual Corrections
    print("\n[3/8] Executing Cleaning & Manual Status/Size Corrections...")
    df_clean = clean_dataframe(df_raw)

    # 4. 3-Layer Imputation with Method Tracking
    print("\n[4/8] Executing 3-Layer Imputation (Group Median → KNN → Global Median)...")
    df_imputed, imputation_log_df = run_3layer_imputation(df_clean)

    # 5. Scoring & Dense Ranking
    print("\n[5/8] Standardizing Scores, Applying QS 2025 Weights & Deterministic Ranks...")
    df_scored = run_scoring_and_ranking(df_imputed)

    # 6. Statistical Analysis & Outlier Flagging
    print("\n[6/8] Running Statistical Hypothesis Tests & Outlier Flagging...")
    stats_tests_dict = run_statistical_tests(df_scored)
    corr_df = compute_correlation_matrix(df_scored)
    df_final, outlier_summary_df = flag_iqr_outliers(df_scored)

    # 7. Aggregations
    print("\n[7/8] Aggregating Summaries (Country, Region, Size, Status)...")
    country_df = aggregate_by_country(df_final)
    region_df = aggregate_by_region(df_final)
    size_df = aggregate_by_size(df_final)
    status_df = aggregate_by_status(df_final)
    cross_tab_dict = cross_tabulate_size_status(df_final)

    # 8. Export JSON Contracts
    print("\n[8/8] Generating Locked JSON Contracts for Next.js Dashboard...")
    export_all_pipeline_outputs(
        df_complete=df_final,
        country_df=country_df,
        region_df=region_df,
        size_df=size_df,
        status_df=status_df,
        cross_tab_dict=cross_tab_dict,
        corr_df=corr_df,
        missing_report_df=missing_report_df,
        imputation_log_df=imputation_log_df,
        outlier_summary_df=outlier_summary_df,
        stats_tests_dict=stats_tests_dict
    )

    print("\n" + "=" * 70)
    print("      🎉 PIPELINE EXECUTION COMPLETE — ALL OUTPUTS READY! 🎉     ")
    print("=" * 70)


if __name__ == "__main__":
    main()
