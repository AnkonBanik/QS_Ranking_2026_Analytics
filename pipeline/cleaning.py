"""
Data cleaning module for QS World University Rankings dataset.
Handles score cleaning, rank parsing, manual status/size corrections, and status grouping.
"""
import re
import pandas as pd
import numpy as np
from pipeline.config import STATUS_UPDATES, SIZE_UPDATES, SCORE_COLUMNS, RANK_COLUMNS


def clean_score(val) -> float:
    """
    Convert score values to float, treating NaN, '-', '', and regex patterns like '701+' as NaN.
    """
    if pd.isna(val):
        return np.nan
    val_str = str(val).strip()
    if val_str in ('-', ''):
        return np.nan
    # Handle rank patterns in score columns (e.g., '701+', '801+', '43=')
    if re.search(r'\d+[+=]', val_str):
        return np.nan
    try:
        return float(val_str)
    except ValueError:
        return np.nan


def clean_rank(val) -> float:
    """
    Parse rank values: '701+' -> 701, '43=' -> 43, '-' -> NaN.
    """
    if pd.isna(val):
        return np.nan
    val_str = str(val).strip()
    if val_str in ('-', ''):
        return np.nan
    match = re.match(r'(\d+)[+=]?', val_str)
    if match:
        return float(match.group(1))
    try:
        return float(val_str)
    except ValueError:
        return np.nan


def apply_manual_corrections(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply verified manual corrections for status (56 records) and size (5 records)
    identified by serial number ('sl').
    """
    df = df.copy()
    status_applied = 0
    size_applied = 0

    for sl_val, status_val in STATUS_UPDATES.items():
        mask = df['sl'] == sl_val
        if mask.sum() > 0:
            df.loc[mask, 'status'] = status_val
            status_applied += 1

    for sl_val, size_val in SIZE_UPDATES.items():
        mask = df['sl'] == sl_val
        if mask.sum() > 0:
            df.loc[mask, 'size'] = size_val
            size_applied += 1

    print(f"✅ Applied {status_applied} status corrections.")
    print(f"✅ Applied {size_applied} size corrections.")
    return df


def create_status_group(df: pd.DataFrame) -> pd.DataFrame:
    """
    Map status to binary status_group: 'Public' -> 'Public', anything else -> 'Private'.
    Combines 'Private for Profit' and 'Private not for Profit'.
    """
    df = df.copy()
    df['status_group'] = np.where(df['status'] == 'Public', 'Public', 'Private')
    return df


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Execute full cleaning pipeline:
    1. Apply manual status/size corrections
    2. Clean all score columns -> *_score_clean
    3. Clean all rank columns -> *_rank_clean
    4. Clean overall score -> overall_score_clean
    5. Create status_group column
    """
    df = df.copy()
    
    # 1. Manual corrections
    df = apply_manual_corrections(df)

    # 2. Clean score columns
    for col in SCORE_COLUMNS:
        clean_col_name = f"{col.split()[0].lower()}_score_clean"
        df[clean_col_name] = df[col].apply(clean_score)

    # 3. Clean rank columns
    for col in RANK_COLUMNS:
        clean_col_name = f"{col.split()[0].lower()}_rank_clean"
        df[clean_col_name] = df[col].apply(clean_rank)

    # 4. Clean Overall SCORE
    if 'Overall SCORE' in df.columns:
        df['overall_score_clean'] = df['Overall SCORE'].apply(clean_score)

    # 5. Add status_group
    df = create_status_group(df)

    # 6. Validate metadata completeness
    missing_status = df['status'].isna().sum()
    missing_size = df['size'].isna().sum()
    assert missing_status == 0, f"Validation Failed: {missing_status} missing status values remain!"
    assert missing_size == 0, f"Validation Failed: {missing_size} missing size values remain!"
    print("✅ Metadata validation passed: 0 missing status or size values.")

    return df
