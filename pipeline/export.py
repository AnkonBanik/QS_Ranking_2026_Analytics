"""
Export module for writing JSON data contracts, CSVs, and Excel workbooks consumed by the Next.js frontend and users.
"""
import json
from pathlib import Path
import pandas as pd
from pipeline.config import OUTPUT_DIR, FRONTEND_DATA_DIR


def ensure_output_dirs():
    """Create output and frontend data directories if they don't exist."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    FRONTEND_DATA_DIR.mkdir(parents=True, exist_ok=True)


def export_json(data, filename: str):
    """
    Helper to export dict or DataFrame to JSON in both /output/ and /frontend/public/data/.
    """
    ensure_output_dirs()
    target_paths = [OUTPUT_DIR / filename, FRONTEND_DATA_DIR / filename]

    for filepath in target_paths:
        if isinstance(data, pd.DataFrame):
            data.to_json(filepath, orient='records', indent=2)
        elif isinstance(data, dict) or isinstance(data, list):
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        else:
            raise ValueError(f"Unsupported data type for JSON export: {type(data)}")

    print(f"  📄 Exported: {filename} -> /output/ & /frontend/public/data/")


def export_excel_and_csv(df_complete: pd.DataFrame, country_df: pd.DataFrame, imputation_log_df: pd.DataFrame):
    """
    Export full dataset to Excel (.xlsx) and CSV format for user inspection.
    """
    ensure_output_dirs()
    excel_path = OUTPUT_DIR / "qs_rankings_complete_2025.xlsx"
    csv_path = OUTPUT_DIR / "qs_rankings_complete_2025.csv"

    # Export CSV
    df_complete.to_csv(csv_path, index=False)
    print(f"  📊 Exported CSV: {csv_path.name} -> /output/")

    # Export Excel Workbook with multiple formatted sheets
    with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
        df_complete.to_excel(writer, sheet_name='Complete Rankings', index=False)
        country_df.to_excel(writer, sheet_name='Country Summary', index=False)
        imputation_log_df.to_excel(writer, sheet_name='Imputation Method Log', index=False)

    print(f"  📈 Exported Multi-Sheet Excel Workbook: {excel_path.name} -> /output/")


def export_all_pipeline_outputs(
    df_complete: pd.DataFrame,
    country_df: pd.DataFrame,
    region_df: pd.DataFrame,
    size_df: pd.DataFrame,
    status_df: pd.DataFrame,
    cross_tab_dict: dict,
    corr_df: pd.DataFrame,
    missing_report_df: pd.DataFrame,
    imputation_log_df: pd.DataFrame,
    outlier_summary_df: pd.DataFrame,
    stats_tests_dict: dict
):
    """
    Orchestrate full JSON export contract for frontend dashboard + Excel workbook.
    """
    print("\n[Exporting JSON Contracts & Excel Workbooks]")
    
    # 1. Complete Rankings
    export_json(df_complete, 'rankings.json')

    # 2. Country Aggregation
    export_json(country_df, 'countries.json')

    # 3. Region Aggregation
    export_json(region_df, 'regions.json')

    # 4. Size & Status Breakdown
    size_status_payload = {
        'by_size': size_df.to_dict(orient='records'),
        'by_status': status_df.to_dict(orient='records'),
        'cross_tabulation': cross_tab_dict
    }
    export_json(size_status_payload, 'size_status.json')

    # 5. Correlation Matrix
    corr_payload = {
        'indicators': list(corr_df.columns),
        'matrix': corr_df.to_dict()
    }
    export_json(corr_payload, 'correlation.json')

    # 6. Missing Value Report
    export_json(missing_report_df, 'missing_value_report.json')

    # 7. Imputation Log & Summary
    export_json(imputation_log_df, 'imputation_log.json')

    # 8. Outlier Summary
    export_json(outlier_summary_df, 'outlier_summary.json')

    # 9. Statistical Tests
    export_json(stats_tests_dict, 'stats_tests.json')

    # 10. Excel & CSV Exports
    export_excel_and_csv(df_complete, country_df, imputation_log_df)

    print("✅ All JSON data contracts and Excel workbook exported successfully.")
