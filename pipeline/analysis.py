"""
Statistical Analysis, Outlier Flagging, Distribution, and Map Module.
"""
import pandas as pd
import numpy as np
from scipy import stats
from pipeline.config import INDICATORS

# ISO-3 Code mapping for top university countries
ISO3_MAP = {
    "United States of America": "USA", "United Kingdom": "GBR", "China (Mainland)": "CHN",
    "Japan": "JPN", "Australia": "AUS", "Germany": "DEU", "Canada": "CAN", "France": "FRA",
    "South Korea": "KOR", "Italy": "ITA", "India": "IND", "Spain": "ESP", "Netherlands": "NLD",
    "Switzerland": "CHE", "Sweden": "SWE", "Taiwan": "TWN", "Brazil": "BRA", "Malaysia": "MYS",
    "Saudi Arabia": "SAU", "Turkey": "TUR", "Mexico": "MEX", "Russia": "RUS", "Chile": "CHL",
    "Argentina": "ARG", "Poland": "POL", "Belgium": "BEL", "Austria": "AUT", "Indonesia": "IDN",
    "New Zealand": "NZL", "Denmark": "DNK", "Finland": "FIN", "Portugal": "PRT", "Czechia": "CZE",
    "Norway": "NOR", "Israel": "ISR", "South Africa": "ZAF", "Greece": "GRC", "Thailand": "THA",
    "United Arab Emirates": "ARE", "Ireland": "IRL", "Colombia": "COL", "Singapore": "SGP",
    "Egypt": "EGY", "Pakistan": "PAK", "Hong Kong SAR": "HKG", "Iran": "IRN", "Hungary": "HUN",
    "Kazakhstan": "KAZ", "Romania": "ROU", "Ukraine": "UKR", "Philippines": "PHL", "Peru": "PER",
    "Lebanon": "LBN", "Vietnam": "VNM", "Jordan": "JOR", "Iraq": "IRQ", "Oman": "OMN",
    "Kuwait": "KWT", "Qatar": "QAT", "Bangladesh": "BGD", "Bahrain": "BHR", "Slovakia": "SVK",
    "Lithuania": "LTU", "Estonia": "EST", "Slovenia": "SVN", "Croatia": "HRV", "Serbia": "SRB"
}


def run_statistical_tests(df: pd.DataFrame) -> dict:
    """
    Run Welch's t-test, One-way ANOVA, and Kruskal-Wallis tests on overall_score_new.
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
    indicator_map = {f"{ind.lower()}_score_imputed": ind for ind in INDICATORS}
    corr_df.rename(columns=indicator_map, index=indicator_map, inplace=True)
    return corr_df


def flag_iqr_outliers(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Flag outliers per indicator using the IQR method.
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


def compute_indicator_distributions(df: pd.DataFrame) -> dict:
    """
    Compute box-plot metrics (min, q1, median, q3, max, mean, std) and score histograms.
    """
    def calc_box(series):
        s = series.dropna()
        if len(s) == 0:
            return {'min': 0, 'q1': 0, 'median': 0, 'q3': 0, 'max': 0, 'mean': 0, 'std': 0}
        q1 = float(s.quantile(0.25))
        q3 = float(s.quantile(0.75))
        return {
            'min': round(float(s.min()), 2),
            'q1': round(q1, 2),
            'median': round(float(s.median()), 2),
            'q3': round(q3, 2),
            'max': round(float(s.max()), 2),
            'mean': round(float(s.mean()), 2),
            'std': round(float(s.std()), 2)
        }

    # 1. Global per-indicator box plot stats
    indicator_boxes = {}
    for ind in INDICATORS:
        col = f"{ind.lower()}_score_imputed"
        indicator_boxes[ind] = calc_box(df[col])

    # 2. Public vs Private box plot stats per indicator
    by_status = {}
    for ind in INDICATORS:
        col = f"{ind.lower()}_score_imputed"
        by_status[ind] = {
            'Public': calc_box(df[df['status_group'] == 'Public'][col]),
            'Private': calc_box(df[df['status_group'] == 'Private'][col])
        }

    # 3. By Size category
    by_size = {}
    for ind in INDICATORS:
        col = f"{ind.lower()}_score_imputed"
        by_size[ind] = {
            size_cat: calc_box(group[col]) for size_cat, group in df.groupby('size')
        }

    # 4. Overall score histogram (10-point bins: 0-10, 10-20, ..., 90-100)
    bins = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    hist_counts, _ = np.histogram(df['overall_score_new'], bins=bins)
    histogram = [
        {'bin': f"{bins[i]}-{bins[i+1]}", 'count': int(hist_counts[i])}
        for i in range(len(hist_counts))
    ]

    return {
        'indicator_boxes': indicator_boxes,
        'by_status': by_status,
        'by_size': by_size,
        'overall_score_histogram': histogram
    }


def compute_original_vs_new(df: pd.DataFrame) -> dict:
    """
    Compute scatter plot dataset and rank change distribution.
    """
    # Sample 300 data points for fast scatter rendering
    sample_df = df[['sl', 'name', 'country', 'overall_rank_original', 'overall_rank_new', 'rank_change', 'score_difference']].copy()
    
    # Rank Shift Distribution Bins (gained 20+, gained 1-19, unchanged, lost 1-19, lost 20+)
    shifts = df['rank_change']
    gained_large = int((shifts >= 20).sum())
    gained_small = int(((shifts > 0) & (shifts < 20)).sum())
    unchanged = int((shifts == 0).sum())
    lost_small = int(((shifts < 0) & (shifts > -20)).sum())
    lost_large = int((shifts <= -20).sum())

    shift_binned = [
        {'category': 'Gained 20+ Ranks', 'count': gained_large, 'color': '#10B981'},
        {'category': 'Gained 1-19 Ranks', 'count': gained_small, 'color': '#34D399'},
        {'category': 'Unchanged', 'count': unchanged, 'color': '#6B7280'},
        {'category': 'Lost 1-19 Ranks', 'count': lost_small, 'color': '#F87171'},
        {'category': 'Lost 20+ Ranks', 'count': lost_large, 'color': '#EF4444'},
    ]

    return {
        'scatter_data': sample_df.to_dict(orient='records'),
        'shift_binned': shift_binned
    }


def compute_map_data(df: pd.DataFrame) -> list:
    """
    Aggregates country metrics with ISO-3 codes for World Map visualization.
    """
    map_data = []
    for country_name, group in df.groupby('country'):
        iso3 = ISO3_MAP.get(country_name, country_name[:3].upper())
        top_uni = group.sort_values('overall_rank_new').iloc[0]['name']
        map_data.append({
            'country': country_name,
            'iso3': iso3,
            'count': int(len(group)),
            'avg_score': round(float(group['overall_score_new'].mean()), 2),
            'median_score': round(float(group['overall_score_new'].median()), 2),
            'top_university': top_uni
        })

    return sorted(map_data, key=lambda x: x['count'], reverse=True)
