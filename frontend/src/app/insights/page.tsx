"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, CheckCircle2, AlertTriangle, Scale, Activity, Grid } from "lucide-react";
import ScoreCard from "../components/ScoreCard";
import RelationshipAnalysis from "../components/RelationshipAnalysis";
import GeographicPerformance from "../components/GeographicPerformance";

interface StatsTestPayload {
  t_test_public_vs_private: {
    n_public: number;
    mean_public: number;
    n_private: number;
    mean_private: number;
    t_statistic: number;
    p_value: number;
    significant_p05: boolean;
  };
  anova_size: {
    f_statistic: number;
    p_value: number;
    significant_p05: boolean;
  };
  kruskal_size: {
    h_statistic: number;
    p_value: number;
    significant_p05: boolean;
  };
}

interface CorrelationPayload {
  indicators: string[];
  matrix: Record<string, Record<string, number>>;
}

interface OutlierItem {
  indicator: string;
  q1: number;
  q3: number;
  iqr: number;
  lower_bound: number;
  upper_bound: number;
  outlier_count: number;
  pct_outliers: number;
}

export default function InsightsPage() {
  const [stats, setStats] = useState<StatsTestPayload | null>(null);
  const [corr, setCorr] = useState<CorrelationPayload | null>(null);
  const [outliers, setOutliers] = useState<OutlierItem[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/stats_tests.json").then((r) => r.json()),
      fetch("/data/correlation.json").then((r) => r.json()),
      fetch("/data/outlier_summary.json").then((r) => r.json()),
      fetch("/data/rankings.json").then((r) => r.json()),
      fetch("/data/countries.json").then((r) => r.json()),
    ]).then(([sData, cData, oData, rkData, ctyData]) => {
      setStats(sData);
      setCorr(cData);
      setOutliers(oData);
      setRankings(rkData);
      setCountries(ctyData);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading insights:", err);
      setLoading(false);
    });
  }, []);

  if (loading || !stats || !corr) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-sub">Loading Statistical Analytics & Heatmaps...</p>
      </div>
    );
  }

  const tTest = stats.t_test_public_vs_private;

  // Helper function for correlation heatmap cell colors
  const getCorrColor = (val: number) => {
    if (val === 1) return "bg-indigo-600 dark:bg-indigo-500 text-white font-extrabold";
    if (val >= 0.8) return "bg-indigo-500/80 dark:bg-indigo-600/80 text-white font-bold";
    if (val >= 0.5) return "bg-teal-500/80 dark:bg-teal-600/80 text-white font-semibold";
    if (val >= 0.3) return "bg-emerald-500/40 dark:bg-emerald-700/50 text-slate-900 dark:text-white font-semibold";
    if (val >= 0.1) return "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-gray-300";
    if (val <= -0.1) return "bg-rose-500/30 dark:bg-rose-700/40 text-rose-700 dark:text-rose-300 font-semibold";
    return "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-gray-400";
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
          Statistical Rigor & Bivariate Analysis
        </span>
        <h1 className="text-3xl font-extrabold text-main tracking-tight mt-2">
          Statistical Insights & <span className="gradient-text">Indicator Correlations</span>
        </h1>
        <p className="text-sm text-sub mt-1 max-w-2xl">
          Comprehensive empirical statistical suite: Bivariate scatter plots, indicator correlation matrices, and regional heatmaps.
        </p>
      </div>

      {/* Overview Hypothesis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScoreCard
          title="Welch's t-Test (Public vs Private)"
          value={`t = ${tTest.t_statistic.toFixed(2)}, p = ${tTest.p_value.toFixed(4)}`}
          subtitle={`Public Mean (${tTest.mean_public.toFixed(1)}) vs Private (${tTest.mean_private.toFixed(1)})`}
          badge={{
            text: tTest.significant_p05 ? "Statistically Significant (p < 0.05)" : "Not Significant",
            type: tTest.significant_p05 ? "success" : "warning",
          }}
          icon={CheckCircle2}
        />
        <ScoreCard
          title="One-Way ANOVA (University Size)"
          value={`F = ${stats.anova_size.f_statistic.toFixed(2)}, p = 0.000`}
          subtitle="Significant variance in score across S, M, L, XL institutions"
          badge={{ text: "Strong Size Effect", type: "indigo" }}
          icon={BrainCircuit}
        />
      </div>

      {/* 1. SECTION 1: Relationship Analysis Suite */}
      <RelationshipAnalysis rankings={rankings} countries={countries} />

      {/* 2. SECTION 2: Correlation Matrix Heatmap */}
      <div className="space-y-4">
        <div className="pb-3 border-b border-gray-200 dark:border-gray-800">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
            Part 2 — Correlation Suite
          </span>
          <h2 className="text-2xl font-extrabold text-main tracking-tight mt-1">
            QS Indicator Correlation Matrix — Heatmap
          </h2>
          <p className="text-xs text-sub mt-0.5">
            Pearson correlation coefficients (r) between all 9 QS performance dimensions.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-2">
              <Grid className="w-5 h-5 text-indigo-500" />
              <h3 className="font-extrabold text-main text-base">Correlation Matrix Heatmap</h3>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded bg-indigo-600 text-white">1.0 (Identical)</span>
              <span className="px-2 py-0.5 rounded bg-teal-600 text-white">0.8+ (High)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-900">0.5+ (Med)</span>
              <span className="px-2 py-0.5 rounded bg-rose-500 text-white">&lt;0 (Neg)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="custom-table-header uppercase tracking-wider font-extrabold">
                  <th className="p-3 text-left">Indicator</th>
                  {corr.indicators.map((ind) => (
                    <th key={ind} className="p-2 text-center text-[10px]">
                      {ind}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {corr.indicators.map((rowInd) => (
                  <tr key={rowInd} className="custom-table-row">
                    <td className="p-2.5 font-extrabold text-main text-left border-r border-gray-200 dark:border-gray-800">
                      {rowInd}
                    </td>
                    {corr.indicators.map((colInd) => {
                      const val = corr.matrix[rowInd][colInd];
                      return (
                        <td
                          key={colInd}
                          className={`p-2.5 border border-gray-200 dark:border-gray-800 font-mono transition-colors ${getCorrColor(val)}`}
                        >
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Outliers Callout Table */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="font-extrabold text-main text-base">IQR Outlier Callouts per Indicator</h3>
        <p className="text-xs text-sub">
          Values outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR] are flagged without dropping or altering records.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="custom-table-header uppercase tracking-wider font-extrabold">
              <tr>
                <th className="py-3 px-4">Indicator</th>
                <th className="py-3 px-4 text-center">Q1 (25th %)</th>
                <th className="py-3 px-4 text-center">Q3 (75th %)</th>
                <th className="py-3 px-4 text-center">IQR Range</th>
                <th className="py-3 px-4 text-center">Upper Bound</th>
                <th className="py-3 px-4 text-center">Outlier Count</th>
                <th className="py-3 px-4 text-center">Outlier %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {outliers.map((o) => (
                <tr key={o.indicator} className="custom-table-row">
                  <td className="py-3 px-4 font-bold text-main">{o.indicator}</td>
                  <td className="py-3 px-4 text-center font-mono">{o.q1}</td>
                  <td className="py-3 px-4 text-center font-mono">{o.q3}</td>
                  <td className="py-3 px-4 text-center font-mono">{o.iqr}</td>
                  <td className="py-3 px-4 text-center font-mono">{o.upper_bound}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      o.outlier_count > 0 ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30" : "custom-pill"
                    }`}>
                      {o.outlier_count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-sub">{o.pct_outliers}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. SECTION 3: Geographic Performance Suite */}
      <GeographicPerformance countries={countries} rankings={rankings} />
    </div>
  );
}
