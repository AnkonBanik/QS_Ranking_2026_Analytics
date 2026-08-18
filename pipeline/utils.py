"""
Utility functions for missing value reporting and validation.
"""
import re
import pandas as pd
import numpy as np


def analyze_missing_values(df: pd.DataFrame, columns: list = None) -> pd.DataFrame:
    """
    Comprehensive missing value analysis handling NaN, dashes ('-'), empty strings (''),
    and special rank patterns like '701+', '43='.
    """
    if columns is None:
        columns = df.columns

    report = []
    total_rows = len(df)

    for col in columns:
        col_series = df[col]
        nan_count = col_series.isna().sum()
        
        if col_series.dtype == object:
            str_series = col_series.astype(str).str.strip()
            dash_count = (str_series == '-').sum()
            empty_count = (str_series == '').sum()
            pattern_count = str_series.apply(lambda x: 1 if re.search(r'\d+[+=]', x) else 0).sum()
        else:
            dash_count = 0
            empty_count = 0
            pattern_count = 0

        # Total missing for score columns includes nan, dash, empty, and pattern
        total_missing = nan_count + dash_count + empty_count + pattern_count

        report.append({
            'column': col,
            'nan_count': int(nan_count),
            'dash_count': int(dash_count),
            'empty_count': int(empty_count),
            'pattern_count': int(pattern_count),
            'total_missing': int(total_missing),
            'pct_missing': round((total_missing / total_rows) * 100, 2)
        })

    return pd.DataFrame(report)
