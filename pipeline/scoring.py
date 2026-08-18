"""
Standardization, Weighting, and Dense Ranking Module.

Performs:
1. Z-Score normalization + min-max (0-100) rescaling per indicator.
2. Weighted sum calculation using official QS 2025 weights -> overall_score_new.
3. 10-level deterministic tie-breaker ranking -> overall_rank_new.
4. Individual indicator dense ranking -> *_rank_new.
5. Baseline rank comparison -> rank_change, score_difference.
"""
import pandas as pd
import numpy as np
from pipeline.config import INDICATORS, QS_WEIGHTS


def run_scoring_and_ranking(df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardize indicator scores, calculate overall score, and assign deterministic ranks.
    """
    df = df.copy()

    # 1. Z-score Normalization + 0-100 Min-Max Rescaling
    std_cols = []
    for ind in INDICATORS:
        raw_imp_col = f"{ind.lower()}_score_imputed"
        std_col = f"{ind.lower()}_score_standardized"
        
        # Z-score normalization
        mean_val = df[raw_imp_col].mean()
        std_val = df[raw_imp_col].std()
        z_score = (df[raw_imp_col] - mean_val) / std_val if std_val > 0 else np.zeros(len(df))

        # Min-max rescaling to 0-100 range
        z_min = z_score.min()
        z_max = z_score.max()
        z_range = z_max - z_min
        
        if z_range > 0:
            df[std_col] = ((z_score - z_min) / z_range) * 100
        else:
            df[std_col] = 50.0

        std_cols.append(std_col)

    # 2. Weighted Sum Calculation (overall_score_new)
    weighted_sum = np.zeros(len(df))
    for ind in INDICATORS:
        std_col = f"{ind.lower()}_score_standardized"
        weighted_sum += df[std_col] * QS_WEIGHTS[ind]

    df['overall_score_new'] = np.round(weighted_sum, 2)

    # 3. Dense Ranking per Individual Indicator
    for ind in INDICATORS:
        imp_col = f"{ind.lower()}_score_imputed"
        rank_col = f"{ind.lower()}_rank_new"
        df[rank_col] = df[imp_col].rank(method='dense', ascending=False).astype(int)

    # 4. Deterministic 10-Level Tie-Breaker Ranking (overall_rank_new)
    tiebreak_cols = ['overall_score_new'] + std_cols
    ascending_flags = [False] * len(tiebreak_cols) + [True]  # Scores desc, name asc

    # Sort deterministically
    sorted_df = df[['sl'] + tiebreak_cols + ['name']].sort_values(
        by=tiebreak_cols + ['name'],
        ascending=ascending_flags
    ).reset_index(drop=True)

    sorted_df['overall_rank_new'] = np.arange(1, len(sorted_df) + 1)
    
    # Merge overall_rank_new back to main DataFrame
    df = df.merge(sorted_df[['sl', 'overall_rank_new']], on='sl', how='left')

    # 5. Baseline Comparison Columns
    df['overall_rank_original'] = df['sl'].astype(int)
    df['rank_change'] = df['overall_rank_original'] - df['overall_rank_new']  # Positive means improved rank
    
    if 'overall_score_clean' in df.columns:
        df['score_difference'] = np.round(df['overall_score_new'] - df['overall_score_clean'], 2)
    else:
        df['score_difference'] = 0.0

    print("✅ Scoring and ranking complete.")
    print(f"   Top 1: {df[df['overall_rank_new'] == 1]['name'].values[0]} (Score: {df[df['overall_rank_new'] == 1]['overall_score_new'].values[0]})")
    print(f"   Top 2: {df[df['overall_rank_new'] == 2]['name'].values[0]} (Score: {df[df['overall_rank_new'] == 2]['overall_score_new'].values[0]})")
    print(f"   Top 3: {df[df['overall_rank_new'] == 3]['name'].values[0]} (Score: {df[df['overall_rank_new'] == 3]['overall_score_new'].values[0]})")

    return df
