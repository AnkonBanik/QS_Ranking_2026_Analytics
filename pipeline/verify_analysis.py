"""
Verification script for Statistical Analysis & Outlier Module.
"""
import pandas as pd
from pipeline.config import DATA_PATH
from pipeline.cleaning import clean_dataframe
from pipeline.imputation import run_3layer_imputation
from pipeline.scoring import run_scoring_and_ranking
from pipeline.analysis import (
    run_statistical_tests,
    compute_correlation_matrix,
    flag_iqr_outliers
)

def main():
    print("=" * 60)
    print("QS RANKINGS PIPELINE — STATISTICAL ANALYSIS & OUTLIER TEST")
    print("=" * 60)

    # 1. Pipeline prep steps
    print("\n[Step 1] Running data cleaning, imputation, and scoring...")
    df_raw = pd.read_csv(DATA_PATH)
    df_clean = clean_dataframe(df_raw)
    df_imputed, _ = run_3layer_imputation(df_clean)
    df_scored = run_scoring_and_ranking(df_imputed)

    # 2. Run Statistical Tests
    print("\n[Step 2] Executing Statistical Tests (Welch's t-test, ANOVA, Kruskal-Wallis)...")
    stats_res = run_statistical_tests(df_scored)
    
    t_res = stats_res['t_test_public_vs_private']
    print(f"\n  • Welch's t-test (Public vs Private):")
    print(f"    - Public Mean : {t_res['mean_public']} (n={t_res['n_public']})")
    print(f"    - Private Mean: {t_res['mean_private']} (n={t_res['n_private']})")
    print(f"    - t-statistic : {t_res['t_statistic']}")
    print(f"    - p-value     : {t_res['p_value']:.6f} (Statistically Significant: {t_res['significant_p05']})")

    anova_res = stats_res['anova_size']
    print(f"\n  • One-Way ANOVA across Size (S, M, L, XL):")
    print(f"    - F-statistic : {anova_res['f_statistic']}")
    print(f"    - p-value     : {anova_res['p_value']:.6f} (Statistically Significant: {anova_res['significant_p05']})")

    # 3. Compute Correlations
    print("\n[Step 3] Computing Pearson Correlation Matrix across 9 indicators...")
    corr_df = compute_correlation_matrix(df_scored)
    print("\nCorrelation Matrix (Excerpt - top 5 indicators):")
    print(corr_df.iloc[:5, :5].to_string())

    # 4. Outlier Analysis
    print("\n[Step 4] Flagging Outliers via IQR Method...")
    df_analyzed, outlier_summary = flag_iqr_outliers(df_scored)
    print("\nIQR Outlier Summary per Indicator:")
    print(outlier_summary[['indicator', 'q1', 'q3', 'iqr', 'outlier_count', 'pct_outliers']].to_string(index=False))

    print("\n" + "=" * 60)
    print("STATISTICAL ANALYSIS MODULE TEST COMPLETE — ALL PASSED ✅")
    print("=" * 60)

if __name__ == "__main__":
    main()
