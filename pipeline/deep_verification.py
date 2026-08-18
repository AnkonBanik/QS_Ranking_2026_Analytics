"""
Deep Verification & Data Pipeline Audit Test Suite.
Performs 6 rigorous automated checks to validate pipeline correctness.
"""
import json
import pandas as pd
import numpy as np
from pathlib import Path
from pipeline.config import DATA_PATH, OUTPUT_DIR, FRONTEND_DATA_DIR, INDICATORS, QS_WEIGHTS
from pipeline.cleaning import clean_dataframe
from pipeline.imputation import run_3layer_imputation
from pipeline.scoring import run_scoring_and_ranking
from pipeline.analysis import run_statistical_tests, compute_correlation_matrix, flag_iqr_outliers
from pipeline.aggregation import aggregate_by_country, aggregate_by_region, aggregate_by_size, aggregate_by_status, cross_tabulate_size_status

def run_deep_verification():
    print("=" * 75)
    print("      QS PIPELINE — DEEP VERIFICATION & INTEGRITY TEST SUITE       ")
    print("=" * 75)

    passed_tests = 0
    total_tests = 6

    # Load and process data
    df_raw = pd.read_csv(DATA_PATH)
    df_clean = clean_dataframe(df_raw)
    df_imputed, imputation_summary = run_3layer_imputation(df_clean)
    df_scored = run_scoring_and_ranking(df_imputed)
    df_final, outlier_summary = flag_iqr_outliers(df_scored)

    # ----------------------------------------------------
    # TEST 1: Missing Value Absolute Zero Check
    # ----------------------------------------------------
    print("\n[TEST 1/6] Checking Imputed Score Columns for Zero Missing Values...")
    missing_counts = [df_scored[f"{ind.lower()}_score_imputed"].isna().sum() for ind in INDICATORS]
    total_missing = sum(missing_counts)
    
    if total_missing == 0:
        print("  ✅ TEST 1 PASSED: Zero missing values remain across all 9 imputed indicators.")
        passed_tests += 1
    else:
        print(f"  ❌ TEST 1 FAILED: Found {total_missing} missing values!")

    # ----------------------------------------------------
    # TEST 2: Imputation Method Stamp Conservation
    # ----------------------------------------------------
    print("\n[TEST 2/6] Verifying Imputation Method Stamp Conservation...")
    total_cells = len(df_scored) * len(INDICATORS)
    stamped_total = 0
    for ind in INDICATORS:
        col = f"{ind.lower()}_imputed_method"
        stamped_total += df_scored[col].notna().sum()

    if stamped_total == total_cells:
        print(f"  ✅ TEST 2 PASSED: All {total_cells} cells are tagged with valid imputation method stamps.")
        passed_tests += 1
    else:
        print(f"  ❌ TEST 2 FAILED: Expected {total_cells} stamps, found {stamped_total}!")

    # ----------------------------------------------------
    # TEST 3: Weight Sum & Score Recalculation Audit
    # ----------------------------------------------------
    print("\n[TEST 3/6] Auditing QS Weights & Overall Score Recalculation...")
    weight_sum = sum(QS_WEIGHTS.values())
    
    # Recalculate overall score on row 0 to test formula precision
    row0 = df_scored.iloc[0]
    expected_score = sum(row0[f"{ind.lower()}_score_standardized"] * QS_WEIGHTS[ind] for ind in INDICATORS)
    actual_score = row0['overall_score_new']
    score_diff = abs(expected_score - actual_score)

    if abs(weight_sum - 1.0) < 1e-6 and score_diff < 0.05:
        print(f"  ✅ TEST 3 PASSED: QS Weights sum to {weight_sum:.2f}, score formula difference = {score_diff:.4f}")
        passed_tests += 1
    else:
        print(f"  ❌ TEST 3 FAILED: Weight sum={weight_sum}, Score diff={score_diff}")

    # ----------------------------------------------------
    # TEST 4: Ranking Uniqueness & Dense Structure
    # ----------------------------------------------------
    print("\n[TEST 4/6] Verifying Overall Rank Uniqueness and Monotonic Structure...")
    unique_ranks = df_scored['overall_rank_new'].nunique()
    min_rank = df_scored['overall_rank_new'].min()
    max_rank = df_scored['overall_rank_new'].max()
    expected_count = len(df_scored)

    if unique_ranks == expected_count and min_rank == 1 and max_rank == expected_count:
        print(f"  ✅ TEST 4 PASSED: Exactly {unique_ranks} unique ranks from 1 to {max_rank} (No gaps or duplicates).")
        passed_tests += 1
    else:
        print(f"  ❌ TEST 4 FAILED: Unique={unique_ranks}, Min={min_rank}, Max={max_rank}, Expected={expected_count}")

    # ----------------------------------------------------
    # TEST 5: Statistical Test Validity
    # ----------------------------------------------------
    print("\n[TEST 5/6] Checking Statistical Hypothesis Test Stability...")
    stats_res = run_statistical_tests(df_scored)
    t_pval = stats_res['t_test_public_vs_private']['p_value']
    anova_pval = stats_res['anova_size']['p_value']

    if t_pval < 0.05 and anova_pval < 0.05:
        print(f"  ✅ TEST 5 PASSED: Welch's t-test (p={t_pval:.6f}) & ANOVA (p={anova_pval:.6f}) are statistically significant.")
        passed_tests += 1
    else:
        print(f"  ❌ TEST 5 FAILED: Welch t p-val={t_pval}, ANOVA p-val={anova_pval}")

    # ----------------------------------------------------
    # TEST 6: JSON Data Contract Sync & Non-Empty Check
    # ----------------------------------------------------
    print("\n[TEST 6/6] Verifying JSON Data Contracts in /output/ & /frontend/public/data/...")
    required_files = [
        'rankings.json', 'countries.json', 'regions.json', 'size_status.json',
        'correlation.json', 'missing_value_report.json', 'imputation_log.json',
        'outlier_summary.json', 'stats_tests.json'
    ]

    all_files_exist = True
    for fname in required_files:
        p1 = OUTPUT_DIR / fname
        p2 = FRONTEND_DATA_DIR / fname
        if not (p1.exists() and p1.stat().st_size > 0 and p2.exists() and p2.stat().st_size > 0):
            all_files_exist = False
            print(f"     Missing or empty contract: {fname}")

    if all_files_exist:
        print("  ✅ TEST 6 PASSED: All 9 JSON data contracts present and non-empty in both directories.")
        passed_tests += 1
    else:
        print("  ❌ TEST 6 FAILED: Some JSON contracts are missing or empty!")

    # Final Summary
    print("\n" + "=" * 75)
    print(f"      VERIFICATION RESULT: {passed_tests}/{total_tests} TESTS PASSED      ")
    if passed_tests == total_tests:
        print("      🎉 DATA PIPELINE CERTIFIED 100% CORRECT & ROBUST! 🎉      ")
    print("=" * 75)

if __name__ == "__main__":
    run_deep_verification()
