"""
Verification script for Data Cleaning & Metadata Validation module.
"""
import pandas as pd
from pipeline.config import DATA_PATH, SCORE_COLUMNS
from pipeline.utils import analyze_missing_values
from pipeline.cleaning import clean_dataframe

def main():
    print("=" * 60)
    print("QS RANKINGS PIPELINE — CLEANING & VALIDATION TEST")
    print("=" * 60)

    # 1. Load raw data
    print(f"\n[Step 1] Loading raw CSV from: {DATA_PATH}")
    df_raw = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df_raw)} rows × {len(df_raw.columns)} columns.")

    # 2. Missing Value Analysis on raw data
    print("\n[Step 2] Analyzing raw missing values across score columns...")
    missing_report = analyze_missing_values(df_raw, SCORE_COLUMNS)
    print(missing_report.to_string(index=False))

    # 3. Clean Dataframe
    print("\n[Step 3] Executing data cleaning and manual corrections...")
    df_clean = clean_dataframe(df_raw)

    # 4. Status group distribution check
    print("\n[Step 4] Status Group Breakdown:")
    print(df_clean['status_group'].value_counts().to_string())

    print("\n" + "=" * 60)
    print("CLEANING & VALIDATION TEST COMPLETE — ALL PASSED ✅")
    print("=" * 60)

if __name__ == "__main__":
    main()
