"""
Configuration file containing constants, weights, manual corrections, and parameters for the QS Rankings Pipeline.
"""
from pathlib import Path

# Base Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "main_db.csv"
OUTPUT_DIR = PROJECT_ROOT / "output"
FRONTEND_DATA_DIR = PROJECT_ROOT / "frontend" / "public" / "data"

# QS 2025 Indicator Weights (Official published methodology)
QS_WEIGHTS = {
    'AR': 0.30,   # Academic Reputation (30%)
    'ER': 0.15,   # Employer Reputation (15%)
    'FSR': 0.10,  # Faculty Student Ratio (10%)
    'CPF': 0.20,  # Citations per Faculty (20%)
    'IFR': 0.05,  # International Faculty Ratio (5%)
    'ISR': 0.05,  # International Student Ratio (5%)
    'IRN': 0.05,  # International Research Network (5%)
    'EO': 0.05,   # Employment Outcomes (5%)
    'SUS': 0.05   # Sustainability (5%)
}

INDICATORS = ['AR', 'ER', 'FSR', 'CPF', 'IFR', 'ISR', 'IRN', 'EO', 'SUS']

SCORE_COLUMNS = [f"{ind} SCORE" for ind in INDICATORS]
RANK_COLUMNS = [f"{ind} RANK" for ind in INDICATORS]

# Ordinal Encoding Maps
SIZE_ORDER = {'S': 0, 'M': 1, 'L': 2, 'XL': 3}
RESEARCH_ORDER = {'LO': 0, 'MD': 1, 'HI': 2, 'VH': 3}

# Manual Corrections: Status Updates (56 verified sl records)
STATUS_UPDATES = {
    79: "Public", 97: "Public", 363: "Public", 516: "Public", 648: "Public",
    668: "Public", 810: "Public", 846: "Private not for Profit", 867: "Public",
    897: "Public", 941: "Public", 967: "Public", 985: "Public", 1008: "Public",
    1015: "Public", 1020: "Public", 1023: "Private not for Profit", 1030: "Public",
    1076: "Public", 1093: "Public", 1110: "Public", 1123: "Public", 1125: "Public",
    1130: "Public", 1145: "Public", 1149: "Public", 1159: "Public", 1160: "Public",
    1184: "Public", 1206: "Public", 1225: "Public", 1237: "Public", 1260: "Public",
    1269: "Public", 1273: "Public", 1274: "Public", 1317: "Public", 1318: "Public",
    1331: "Public", 1335: "Public", 1341: "Public", 1342: "Public", 1344: "Public",
    1345: "Public", 1346: "Public", 1373: "Public", 1382: "Public", 1388: "Public",
    1391: "Public", 1392: "Public", 1402: "Public", 1427: "Private not for Profit",
    1443: "Public", 1464: "Public", 1483: "Public", 1488: "Public"
}

# Manual Corrections: Size Updates (5 verified sl records)
SIZE_UPDATES = {
    987: 'L',
    1409: 'L',
    1427: 'XL',
    1429: 'L',
    1490: 'L'
}

# Imputation Parameters
GROUP_COLS = ['country', 'size', 'research']
MIN_GROUP_SIZE = 3
KNN_NEIGHBORS = 5
KNN_WEIGHTS = 'distance'

# Tie-Breaker Column Hierarchy
TIE_BREAK_ORDER = ['overall_score_new'] + [f"{ind}_score_standardized" for ind in INDICATORS] + ['name']
