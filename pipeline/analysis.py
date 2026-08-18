"""
Statistical Analysis & Outlier Flagging Module.

Includes:
1. Parametric & Non-Parametric Hypothesis Tests (Welch's t-test, One-way ANOVA, Kruskal-Wallis).
2. Pairwise Pearson Correlation Matrix across indicator scores.
3. IQR (Interquartile Range) outlier detection and flagging.
"""
import pandas as pd
import numpy as np
from scipy import stats
from pipeline.config import INDICATORS


def run_statistical_tests(df: pd.DataFrame) -> dict:
    """
    Run Welch's t-test, One-way ANOVA, and Kruskal-Wallis tests on overall_score_new.
    Returns dictionary of test statistics and p-values.
    """
    results = {}

    # 1. Welch's t-test (Public vs Private status_group)
    public_scores = df[df['status_group'] == 'Public']['overall_score_new'].dropna()
    private_scores = df[df['status_group'] == 'Private']['overall_score_new'].dropna()

    t_stat, t_pval = stats.ttest_ind(public_scores, private_scores, equal_var=False)
    results['t_test_public_vs_private'] = {
        'n_public': int(len(public_scores)),
        'mean_public': round(float(public_scores.mean()), 2),
        'n_private': int(len(private_scores)),
        'mean_private': round(float(private_scores.mean()), 2),
        't_statistic': round(float(t_stat), 4),
        'p_value': float(t_pval),
        'significant_p05': bool(t_pval < 0.05)
    }

    # 2. One-Way ANOVA across Size categories (S, M, L, XL)
    size_groups = [group['overall_score_new'].dropna().values for name, group in df.groupby('size')]
    f_stat, anova_pval = stats.f_oneway(*size_groups)
    results['anova_size'] = {
        'f_statistic': round(float(f_stat), 4),
        'p_value': float(anova_pval),
        'significant_p05': bool(anova_pval < 0.05)
    }

    # 3. Kruskal-Wallis Test across Size categories
    h_stat, kw_pval = stats.kruskal(*size_groups)
    results['kruskal_size'] = {
        'h_statistic': round(float(h_stat), 4),
        'p_value': float(kw_pval),
        'significant_p05': bool(kw_pval < 0.05)
    }

    return results


def compute_correlation_matrix(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute Pearson correlation matrix across the 9 imputed indicator score columns.
    """
    imp_cols = [f"{ind.lower()}_score_imputed" for ind in INDICATORS]
    corr_df = df[imp_cols].corr(method='pearson').round(4)
    # Rename columns/index to human-readable indicator names
    indicator_map = {f"{ind.lower()}_score_imputed": ind for ind in INDICATORS}
    corr_df.rename(columns=indicator_map, index=indicator_map, inplace=True)
    return corr_df


def flag_iqr_outliers(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Flag outliers per indicator using the IQR method (Q1 - 1.5*IQR to Q3 + 1.5*IQR).
    Does NOT drop or alter values — stamps boolean *_outlier column.
    """
    df = df.copy()
    outlier_summary = []

    for ind in INDICATORS:
        col = f"{ind.lower()}_score_imputed"
        outlier_col = f"{ind.lower()}_outlier"

        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1

        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        outlier_mask = (df[col] < lower_bound) | (df[col] > upper_bound)
        df[outlier_col] = outlier_mask
        outlier_count = int(outlier_mask.sum())

        outlier_summary.append({
            'indicator': ind,
            'q1': round(float(q1), 2),
            'q3': round(float(q3), 2),
            'iqr': round(float(iqr), 2),
            'lower_bound': round(float(lower_bound), 2),
            'upper_bound': round(float(upper_bound), 2),
            'outlier_count': outlier_count,
            'pct_outliers': round((outlier_count / len(df)) * 100, 2)
        })

    summary_df = pd.DataFrame(outlier_summary)
    return df, summary_df
