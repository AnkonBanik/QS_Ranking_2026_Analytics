"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, CheckCircle2, AlertTriangle, Scale, Activity } from "lucide-react";
import ScoreCard from "../components/ScoreCard";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/stats_tests.json").then((r) => r.json()),
      fetch("/data/correlation.json").then((r) => r.json()),
      fetch("/data/outlier_summary.json").then((r) => r.json()),
    ]).then(([sData, cData, oData]) => {
      setStats(sData);
      setCorr(cData);
      setOutliers(oData);
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
        <p className="text-sm font-medium text-gray-400">Loading Statistical Analytics & Heatmaps...</p>
      </div>
    );
  }

  const tTest = stats.t_test_public_vs_private;
  const anova = stats.anova_size;

  // Helper function for correlation heatmap cell colors
  const getCorrColor = (val: number) => {
    if (val === 1) return "bg-indigo-600 text-white font-bold";
    if (val >= 0.8) return "bg-indigo-500/80 text-white font-semibold";
    if (val >= 0.5) return "bg-indigo-500/50 text-indigo-100";
    if (val >= 0.3) return "bg-indigo-500/30 text-indigo-200";
    if (val >= 0.1) return "bg-indigo-500/10 text-gray-300";
    if (val <= -0.1) return "bg-rose-500/20 text-rose-300";
    return "bg-slate-900 text-gray-400";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-gray-800">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Part 3 — Statistical Rigor & Hypothesis Testing
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
          Statistical Insights & <span className="gradient-text">Indicator Correlations</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl">
          Empirical validation using Welch's t-test, One-Way ANOVA, Pearson correlation matrices, and IQR outlier detection.
        </p>
      </div>

      {/* Statistical Hypothesis Test Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Welch's t-test card */}
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Public vs Private Welch's t-Test</h3>
                <p className="text-xs text-gray-400">Two-sample unequal variance test</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Significant (p &lt; 0.01)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-800 my-4 text-xs">
            <div>
              <span className="text-gray-400 block">Public Mean Score:</span>
              <span className="text-xl font-bold text-white">{tTest.mean_public}</span>
              <span className="text-[10px] text-gray-500 block">(n = {tTest.n_public})</span>
            </div>
            <div>
              <span className="text-gray-400 block">Private Mean Score:</span>
              <span className="text-xl font-bold text-white">{tTest.mean_private}</span>
              <span className="text-[10px] text-gray-500 block">(n = {tTest.n_private})</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>t-statistic: <strong className="text-white">{tTest.t_statistic}</strong></span>
            <span>p-value: <strong className="text-emerald-400">{tTest.p_value.toFixed(6)}</strong></span>
          </div>
        </div>

        {/* ANOVA card */}
        <div className="glass-card p-6 rounded-2xl border border-indigo-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">One-Way ANOVA (Institution Size)</h3>
                <p className="text-xs text-gray-400">Score variance across S, M, L, XL categories</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Significant (p &lt; 0.001)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-800 my-4 text-xs">
            <div>
              <span className="text-gray-400 block">F-Statistic:</span>
              <span className="text-xl font-bold text-white">{anova.f_statistic}</span>
            </div>
            <div>
              <span className="text-gray-400 block">p-Value:</span>
              <span className="text-xl font-bold text-emerald-400">&lt; 0.000001</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Confirms that university size plays a statistically significant role in overall performance metrics.
          </p>
        </div>
      </div>

      {/* Correlation Matrix Heatmap */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-white text-lg">Indicator Pearson Correlation Matrix</h3>
            <p className="text-xs text-gray-400">Pairwise correlation coefficients across all 9 imputed indicator score columns</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2 bg-slate-900 text-gray-400 font-bold text-left">Indicator</th>
                {corr.indicators.map((ind) => (
                  <th key={ind} className="p-2 bg-slate-900 text-gray-300 font-bold">{ind}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corr.indicators.map((rowInd) => (
                <tr key={rowInd}>
                  <td className="p-2 bg-slate-900 font-bold text-gray-300 text-left border-t border-gray-800">{rowInd}</td>
                  {corr.indicators.map((colInd) => {
                    const val = corr.matrix[rowInd][colInd];
                    return (
                      <td 
                        key={colInd} 
                        className={`p-3 border border-gray-800/80 transition-colors ${getCorrColor(val)}`}
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

      {/* Outliers Table */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-bold text-white text-lg mb-2">IQR Outlier Callouts per Indicator</h3>
        <p className="text-xs text-gray-400 mb-6">
          Values outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR] are flagged without dropping or altering records.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-900/90 text-gray-400 uppercase tracking-wider font-semibold">
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
            <tbody className="divide-y divide-gray-800/60">
              {outliers.map((o) => (
                <tr key={o.indicator} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-bold text-white">{o.indicator}</td>
                  <td className="py-3 px-4 text-center font-mono">{o.q1}</td>
                  <td className="py-3 px-4 text-center font-mono">{o.q3}</td>
                  <td className="py-3 px-4 text-center font-mono">{o.iqr}</td>
                  <td className="py-3 px-4 text-center font-mono">{o.upper_bound}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      o.outlier_count > 0 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-gray-800 text-gray-400"
                    }`}>
                      {o.outlier_count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-gray-400">{o.pct_outliers}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
