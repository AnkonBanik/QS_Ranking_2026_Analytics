"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { ShieldCheck, Database, Layers, CheckCircle2, FileSpreadsheet, AlertCircle, BarChart2 } from "lucide-react";
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
        <p className="text-sm font-medium text-sub">Loading Data Quality Audit...</p>
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
      <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
          Data Quality & Transparency Audit
        </span>
        <h1 className="text-3xl font-extrabold text-main tracking-tight mt-2">
          Data Quality & <span className="gradient-text">Imputation Audit</span>
        </h1>
        <p className="text-sm text-sub mt-1 max-w-2xl">
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

      {/* Missingness Percentage Bar Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-main text-lg">Raw Missingness Percentage Bar Chart</h3>
            <p className="text-xs text-sub">Percentage of gaps per indicator prior to 3-layer cascade imputation</p>
          </div>
          <BarChart2 className="w-5 h-5 text-indigo-500" />
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={missingReport} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis dataKey="column" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 10]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }}
              />
              <Bar dataKey="pct_missing" fill="#6366F1" radius={[8, 8, 0, 0]}>
                {missingReport.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.pct_missing > 3 ? "#EF4444" : "#6366F1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pre-Imputation Raw Missing Value Taxonomy Table */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-main text-lg">Raw Source Missing Value Taxonomy</h3>
            <p className="text-xs text-sub">Pre-cleaning breakdown of NaN, dashes (-), empty strings, and 701+/43= rank patterns</p>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/30">
            9 Score Columns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="custom-table-header uppercase tracking-wider font-extrabold">
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
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {missingReport.map((row) => (
                <tr key={row.column} className="custom-table-row transition-colors">
                  <td className="py-3 px-4 font-bold text-main">{row.column}</td>
                  <td className="py-3 px-4 text-center font-mono">{row.nan_count}</td>
                  <td className="py-3 px-4 text-center font-mono">{row.dash_count}</td>
                  <td className="py-3 px-4 text-center font-mono">{row.empty_count}</td>
                  <td className="py-3 px-4 text-center font-mono text-indigo-600 dark:text-indigo-400 font-bold">{row.pattern_count}</td>
                  <td className="py-3 px-4 text-center font-bold text-amber-600 dark:text-amber-400">{row.total_missing}</td>
                  <td className="py-3 px-4 text-center font-mono text-sub">{row.pct_missing}%</td>
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
            <h3 className="font-extrabold text-main text-lg">Per-Cell Imputation Method Breakdown</h3>
            <p className="text-xs text-sub">Recorded by the *_imputed_method tracking flag during pipeline execution</p>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-300 font-bold bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
            0% Gaps Remaining
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="custom-table-header uppercase tracking-wider font-extrabold">
              <tr>
                <th className="py-3 px-4">Indicator</th>
                <th className="py-3 px-4 text-center">Observed (Raw)</th>
                <th className="py-3 px-4 text-center">Layer 1 (Group Median)</th>
                <th className="py-3 px-4 text-center">Layer 2 (KNN k=5)</th>
                <th className="py-3 px-4 text-center">Layer 3 (Global Median)</th>
                <th className="py-3 px-4 text-center">Total Imputed %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {imputationLog.map((row) => (
                <tr key={row.indicator} className="custom-table-row transition-colors">
                  <td className="py-3 px-4 font-bold text-main">{row.indicator}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">{row.observed}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.group_median}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.knn}</td>
                  <td className="py-3 px-4 text-center font-mono text-muted-custom">{row.global_median}</td>
                  <td className="py-3 px-4 text-center font-bold text-amber-600 dark:text-amber-400">{row.pct_imputed}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
