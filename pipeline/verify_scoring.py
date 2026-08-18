"""
Verification script for Scoring & Ranking Module.
"""
import pandas as pd
from pipeline.config import DATA_PATH
from pipeline.cleaning import clean_dataframe
from pipeline.imputation import run_3layer_imputation
from pipeline.scoring import run_scoring_and_ranking

def main():
    print("=" * 60)
    print("QS RANKINGS PIPELINE — SCORING & RANKING TEST")
    print("=" * 60)

    # 1. Load and clean raw data
    print("\n[Step 1] Cleaning dataset...")
    df_raw = pd.read_csv(DATA_PATH)
    df_clean = clean_dataframe(df_raw)

    # 2. Run Imputation
    print("\n[Step 2] Running 3-layer imputation...")
    df_imputed, _ = run_3layer_imputation(df_clean)

    # 3. Run Scoring and Ranking
    print("\n[Step 3] Running standardization, weighting, and ranking...")
    df_scored = run_scoring_and_ranking(df_imputed)

    # 4. Verification checks
    print("\n[Step 4] Verification & Inspection:")
    top_10 = df_scored[df_scored['overall_rank_new'] <= 10][
        ['overall_rank_new', 'overall_rank_original', 'name', 'country', 'overall_score_new', 'rank_change']
    ].sort_values('overall_rank_new')
    
    print("\nTop 10 Re-Ranked Universities:")
    print(top_10.to_string(index=False))

    # Assertions
    assert df_scored['overall_rank_new'].nunique() == len(df_scored), "Error: Rank duplicates found!"
    assert df_scored['overall_rank_new'].min() == 1, "Error: Min rank is not 1!"
    assert df_scored['overall_rank_new'].max() == len(df_scored), f"Error: Max rank is not {len(df_scored)}!"
    
    print("\n" + "=" * 60)
    print("SCORING & RANKING TEST COMPLETE — ALL PASSED ✅")
    print("=" * 60)

if __name__ == "__main__":
    main()
