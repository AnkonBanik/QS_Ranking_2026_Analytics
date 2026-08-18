"""
Data Aggregation Module for Country, Region, Size, and Status Summaries.
"""
import pandas as pd
import numpy as np
from pipeline.config import INDICATORS


def aggregate_by_country(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate university performance statistics by country.
    """
    imp_cols = [f"{ind.lower()}_score_imputed" for ind in INDICATORS]

    # Find top university per country
    idx_top = df.groupby('country')['overall_score_new'].idxmax()
    top_unis = df.loc[idx_top, ['country', 'name', 'overall_score_new']].rename(
        columns={'name': 'top_university', 'overall_score_new': 'top_university_score'}
    )

    # Country level stats
    country_stats = df.groupby('country').agg(
        university_count=('name', 'count'),
        mean_overall_score=('overall_score_new', 'mean'),
        median_overall_score=('overall_score_new', 'median'),
        std_overall_score=('overall_score_new', 'std'),
        best_rank=('overall_rank_new', 'min'),
        **{f"mean_{ind.lower()}": (f"{ind.lower()}_score_imputed", 'mean') for ind in INDICATORS}
    ).reset_index()

    # Round numeric columns
    num_cols = country_stats.select_dtypes(include=[np.number]).columns
    country_stats[num_cols] = country_stats[num_cols].round(2)

    # Merge top university info
    country_stats = country_stats.merge(top_unis, on='country', how='left')
    country_stats.sort_values(by='university_count', ascending=False, inplace=True)
    return country_stats


def aggregate_by_region(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate statistics by geographical region.
    """
    region_stats = df.groupby('region').agg(
        university_count=('name', 'count'),
        mean_overall_score=('overall_score_new', 'mean'),
        median_overall_score=('overall_score_new', 'median'),
        best_rank=('overall_rank_new', 'min'),
        **{f"mean_{ind.lower()}": (f"{ind.lower()}_score_imputed", 'mean') for ind in INDICATORS}
    ).reset_index()

    num_cols = region_stats.select_dtypes(include=[np.number]).columns
    region_stats[num_cols] = region_stats[num_cols].round(2)
    region_stats.sort_values(by='mean_overall_score', ascending=False, inplace=True)
    return region_stats


def aggregate_by_size(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate statistics by institution size (S, M, L, XL).
    """
    size_stats = df.groupby('size').agg(
        university_count=('name', 'count'),
        mean_overall_score=('overall_score_new', 'mean'),
        median_overall_score=('overall_score_new', 'median'),
        best_rank=('overall_rank_new', 'min'),
        **{f"mean_{ind.lower()}": (f"{ind.lower()}_score_imputed", 'mean') for ind in INDICATORS}
    ).reset_index()

    num_cols = size_stats.select_dtypes(include=[np.number]).columns
    size_stats[num_cols] = size_stats[num_cols].round(2)
    return size_stats


def aggregate_by_status(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate statistics by status_group (Public vs Private).
    """
    status_stats = df.groupby('status_group').agg(
        university_count=('name', 'count'),
        mean_overall_score=('overall_score_new', 'mean'),
        median_overall_score=('overall_score_new', 'median'),
        best_rank=('overall_rank_new', 'min'),
        **{f"mean_{ind.lower()}": (f"{ind.lower()}_score_imputed", 'mean') for ind in INDICATORS}
    ).reset_index()

    num_cols = status_stats.select_dtypes(include=[np.number]).columns
    status_stats[num_cols] = status_stats[num_cols].round(2)
    return status_stats


def cross_tabulate_size_status(df: pd.DataFrame) -> dict:
    """
    Cross-tabulation matrix of counts and mean overall scores for Size x Status.
    """
    counts = pd.crosstab(df['size'], df['status_group']).to_dict()
    means = df.pivot_table(
        values='overall_score_new', index='size', columns='status_group', aggfunc='mean'
    ).round(2).to_dict()

    return {
        'counts': counts,
        'mean_scores': means
    }
