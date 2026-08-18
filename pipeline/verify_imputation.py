"""
Verification script for 3-Layer Imputation & Tracking Module.
"""
import pandas as pd
from pipeline.config import DATA_PATH
from pipeline.cleaning import clean_dataframe
from pipeline.imputation import run_3layer_imputation

def main():
    print("=" * 60)
    print("QS RANKINGS PIPELINE — IMPUTATION MODULE TEST")
    print("=" * 60)

    # 1. Clean raw data
    print("\n[Step 1] Loading and cleaning raw dataset...")
    df_raw = pd.read_csv(DATA_PATH)
    df_clean = clean_dataframe(df_raw)

    # 2. Run Imputation
    print("\n[Step 2] Running 3-Layer Imputation Cascade...")
    df_imputed, summary_df = run_3layer_imputation(df_clean)

    # 3. Print Imputation Breakdown Summary
    print("\n[Step 3] Imputation Methodology Breakdown per Indicator:")
    print(summary_df.to_string(index=False))

    # 4. Method Flag Totals
    total_cells = len(df_imputed) * 9
    observed_sum = summary_df['observed'].sum()
    group_sum = summary_df['group_median'].sum()
    knn_sum = summary_df['knn'].sum()
    global_sum = summary_df['global_median'].sum()

    print("\n[Step 4] Dataset-Wide Imputation Totals:")
    print(f"  Total Cells (1504 × 9): {total_cells}")
    print(f"  Observed Values       : {observed_sum} ({observed_sum/total_cells*100:.2f}%)")
    print(f"  Group Median (Layer 1): {group_sum} ({group_sum/total_cells*100:.2f}%)")
    print(f"  KNN (Layer 2)         : {knn_sum} ({knn_sum/total_cells*100:.2f}%)")
    print(f"  Global Median (L3)    : {global_sum} ({global_sum/total_cells*100:.2f}%)")

    assert (observed_sum + group_sum + knn_sum + global_sum) == total_cells, "Error: Sum of method counts does not equal total cells!"

    print("\n" + "=" * 60)
    print("IMPUTATION MODULE TEST COMPLETE — ALL PASSED ✅")
    print("=" * 60)

if __name__ == "__main__":
    main()
