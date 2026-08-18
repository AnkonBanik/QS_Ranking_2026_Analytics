"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Database, Layers, CheckCircle2, FileSpreadsheet, AlertCircle } from "lucide-react";
import ScoreCard from "../components/ScoreCard";

interface MissingReportItem {
  column: string;
  nan_count: number;
  dash_count: number;
  empty_count: number;
  pattern_count: number;
  total_missing: number;
  pct_missing: number;
}

interface ImputationLogItem {
  indicator: string;
  observed: number;
  group_median: number;
  knn: number;
  global_median: number;
  total_cells: number;
  pct_imputed: number;
}

export default function DataQualityPage() {
  const [missingReport, setMissingReport] = useState<MissingReportItem[]>([]);
  const [imputationLog, setImputationLog] = useState<ImputationLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/missing_value_report.json").then((r) => r.json()),
      fetch("/data/imputation_log.json").then((r) => r.json()),
    ]).then(([mReport, iLog]) => {
      setMissingReport(mReport);
      setImputationLog(iLog);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading data quality audit:", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-400">Loading Data Quality Audit...</p>
      </div>
    );
  }

  // Totals for Score Cards
  const totalCells = 1504 * 9;
  const totalObserved = imputationLog.reduce((acc, curr) => acc + curr.observed, 0);
  const totalLayer1 = imputationLog.reduce((acc, curr) => acc + curr.group_median, 0);
  const totalLayer2 = imputationLog.reduce((acc, curr) => acc + curr.knn, 0);
  const totalLayer3 = imputationLog.reduce((acc, curr) => acc + curr.global_median, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-gray-800">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Part 4 — Data Quality & Transparency Audit
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
          Data Quality & <span className="gradient-text">Imputation Audit</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl">
          Full per-cell audit of missing value taxonomy and 3-layer imputation cascade tracking.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Observed Data"
          value={`${((totalObserved / totalCells) * 100).toFixed(2)}%`}
          subtitle={`${totalObserved.toLocaleString()} / ${totalCells.toLocaleString()} cells`}
          badge={{ text: "Raw Complete", type: "success" }}
          icon={Database}
        />
        <ScoreCard
          title="Layer 1: Group Median"
          value={`${totalLayer1} cells`}
          subtitle="Country + Size + Research (min n=3)"
          badge={{ text: `${((totalLayer1 / totalCells) * 100).toFixed(2)}% filled`, type: "indigo" }}
          icon={Layers}
        />
        <ScoreCard
          title="Layer 2: KNN Imputer"
          value={`${totalLayer2} cells`}
          subtitle="k=5, Distance-Weighted"
          badge={{ text: `${((totalLayer2 / totalCells) * 100).toFixed(2)}% filled`, type: "indigo" }}
          icon={CheckCircle2}
        />
        <ScoreCard
          title="Layer 3: Global Fallback"
          value={`${totalLayer3} cells`}
          subtitle="Column-wide median"
          badge={{ text: "0% needed", type: "success" }}
          icon={ShieldCheck}
        />
      </div>

      {/* Pre-Imputation Raw Missing Value Taxonomy Table */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-lg">Raw Source Missing Value Taxonomy</h3>
            <p className="text-xs text-gray-400">Pre-cleaning breakdown of NaN, dashes (-), empty strings, and 701+/43= rank patterns</p>
          </div>
          <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            9 Score Columns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-900/90 text-gray-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Column</th>
                <th className="py-3 px-4 text-center">NaN Count</th>
                <th className="py-3 px-4 text-center">Dash ('-') Count</th>
                <th className="py-3 px-4 text-center">Empty String</th>
                <th className="py-3 px-4 text-center">Pattern ('701+', '43=')</th>
                <th className="py-3 px-4 text-center">Total Missing</th>
                <th className="py-3 px-4 text-center">Missing %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {missingReport.map((row) => (
                <tr key={row.column} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-bold text-white">{row.column}</td>
                  <td className="py-3 px-4 text-center font-mono">{row.nan_count}</td>
                  <td className="py-3 px-4 text-center font-mono">{row.dash_count}</td>
                  <td className="py-3 px-4 text-center font-mono">{row.empty_count}</td>
                  <td className="py-3 px-4 text-center font-mono text-indigo-400">{row.pattern_count}</td>
                  <td className="py-3 px-4 text-center font-bold text-amber-400">{row.total_missing}</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-400">{row.pct_missing}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Layer Imputation Breakdown per Indicator Table */}
      <div className="glass-card p-6 rounded-2xl border border-emerald-500/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-lg">Per-Cell Imputation Method Breakdown</h3>
            <p className="text-xs text-gray-400">Recorded by the *_imputed_method tracking flag during pipeline execution</p>
          </div>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            0% Gaps Remaining
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-slate-900/90 text-gray-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Indicator</th>
                <th className="py-3 px-4 text-center">Observed (Raw)</th>
                <th className="py-3 px-4 text-center">Layer 1 (Group Median)</th>
                <th className="py-3 px-4 text-center">Layer 2 (KNN k=5)</th>
                <th className="py-3 px-4 text-center">Layer 3 (Global Median)</th>
                <th className="py-3 px-4 text-center">Total Imputed %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {imputationLog.map((row) => (
                <tr key={row.indicator} className="hover:bg-slate-800/50">
                  <td className="py-3 px-4 font-bold text-white">{row.indicator}</td>
                  <td className="py-3 px-4 text-center font-mono text-emerald-400">{row.observed}</td>
                  <td className="py-3 px-4 text-center font-mono text-indigo-400">{row.group_median}</td>
                  <td className="py-3 px-4 text-center font-mono text-indigo-400">{row.knn}</td>
                  <td className="py-3 px-4 text-center font-mono text-gray-500">{row.global_median}</td>
                  <td className="py-3 px-4 text-center font-bold text-amber-400">{row.pct_imputed}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
