"""
3-Layer Imputation Module with Per-Cell Method Tracking.

Imputation Cascade:
- Layer 1: Group Median (country + size + research, min n >= 3)
- Layer 2: KNN Imputer (k=5, distance-weighted, country excluded)
- Layer 3: Global Median Fallback

Per-Cell Tracking:
Adds companion column `*_imputed_method` with values:
['observed', 'group_median', 'knn', 'global_median']
"""
import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
from sklearn.preprocessing import LabelEncoder
from pipeline.config import (
    INDICATORS,
    GROUP_COLS,
    MIN_GROUP_SIZE,
    KNN_NEIGHBORS,
    KNN_WEIGHTS,
    SIZE_ORDER,
    RESEARCH_ORDER
)


def run_3layer_imputation(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Execute 3-layer imputation on cleaned indicator score columns.
    Returns:
        df: Updated DataFrame with *_score_imputed and *_imputed_method columns.
        summary_df: Imputation methodology breakdown per indicator.
    """
    df = df.copy()
    
    clean_score_cols = [f"{ind.lower()}_score_clean" for ind in INDICATORS]
    imputed_score_cols = [f"{ind.lower()}_score_imputed" for ind in INDICATORS]
    method_cols = [f"{ind.lower()}_imputed_method" for ind in INDICATORS]

    # Initialize imputed columns and tracking flags cleanly
    for clean_col, imp_col, method_col in zip(clean_score_cols, imputed_score_cols, method_cols):
        df[imp_col] = df[clean_col].copy()
        df[method_col] = np.where(df[clean_col].notna(), 'observed', None)

    # ----------------------------------------------------
    # LAYER 1: Group Median (country + size + research, min n >= 3)
    # ----------------------------------------------------
    layer1_filled_total = 0

    for clean_col, imp_col, method_col in zip(clean_score_cols, imputed_score_cols, method_cols):
        # Calculate group median only where non-null count >= MIN_GROUP_SIZE
        group_median = df.groupby(GROUP_COLS)[clean_col].transform(
            lambda s: s.median() if s.notna().sum() >= MIN_GROUP_SIZE else np.nan
        )
        
        mask_layer1 = df[imp_col].isna() & group_median.notna()
        df.loc[mask_layer1, imp_col] = group_median[mask_layer1]
        df.loc[mask_layer1, method_col] = 'group_median'
        layer1_filled_total += mask_layer1.sum()

    print(f"✅ Layer 1 (Group Median) filled {layer1_filled_total} missing cells.")

    # ----------------------------------------------------
    # LAYER 2: KNN Imputer (k=5, distance-weighted, country excluded)
    # ----------------------------------------------------
    # Ordinal and Label Encodings for KNN features
    df['size_encoded'] = df['size'].map(SIZE_ORDER)
    df['research_encoded'] = df['research'].map(RESEARCH_ORDER)
    le_status = LabelEncoder()
    df['status_encoded'] = le_status.fit_transform(df['status'].astype(str))

    knn_feature_cols = ['size_encoded', 'status_encoded', 'research_encoded'] + imputed_score_cols
    
    # Store missing masks prior to KNN for exact cell tracking
    pre_knn_masks = {col: df[col].isna() for col in imputed_score_cols}

    knn_imputer = KNNImputer(n_neighbors=KNN_NEIGHBORS, weights=KNN_WEIGHTS)
    knn_matrix = knn_imputer.fit_transform(df[knn_feature_cols])

    # Re-extract imputed scores back to DataFrame
    knn_imputed_df = pd.DataFrame(knn_matrix, columns=knn_feature_cols, index=df.index)

    layer2_filled_total = 0
    for imp_col, method_col in zip(imputed_score_cols, method_cols):
        mask_layer2 = pre_knn_masks[imp_col] & knn_imputed_df[imp_col].notna()
        df.loc[mask_layer2, imp_col] = knn_imputed_df.loc[mask_layer2, imp_col]
        df.loc[mask_layer2, method_col] = 'knn'
        layer2_filled_total += mask_layer2.sum()

    # Drop temporary encoding columns
    df.drop(columns=['size_encoded', 'research_encoded', 'status_encoded'], inplace=True)
    print(f"✅ Layer 2 (KNN Imputer k={KNN_NEIGHBORS}) filled {layer2_filled_total} missing cells.")

    # ----------------------------------------------------
    # LAYER 3: Global Median Fallback
    # ----------------------------------------------------
    layer3_filled_total = 0
    for imp_col, method_col in zip(imputed_score_cols, method_cols):
        global_med = df[imp_col].median()
        mask_layer3 = df[imp_col].isna()
        if mask_layer3.sum() > 0:
            df.loc[mask_layer3, imp_col] = global_med
            df.loc[mask_layer3, method_col] = 'global_median'
            layer3_filled_total += mask_layer3.sum()

    print(f"✅ Layer 3 (Global Median) filled {layer3_filled_total} missing cells.")

    # ----------------------------------------------------
    # VALIDATION & SUMMARY REPORT
    # ----------------------------------------------------
    total_missing_after = sum(df[col].isna().sum() for col in imputed_score_cols)
    assert total_missing_after == 0, f"Validation Error: {total_missing_after} missing values remain after imputation!"
    print("✅ Imputation Validation Passed: 0 missing values remain across all indicators.")

    # Generate Method Breakdown Summary
    summary_rows = []
    for ind in INDICATORS:
        m_col = f"{ind.lower()}_imputed_method"
        counts = df[m_col].value_counts().to_dict()
        total_cells = len(df)
        summary_rows.append({
            'indicator': ind,
            'observed': counts.get('observed', 0),
            'group_median': counts.get('group_median', 0),
            'knn': counts.get('knn', 0),
            'global_median': counts.get('global_median', 0),
            'total_cells': total_cells,
            'pct_imputed': round(((total_cells - counts.get('observed', 0)) / total_cells) * 100, 2)
        })

    summary_df = pd.DataFrame(summary_rows)
    return df, summary_df
