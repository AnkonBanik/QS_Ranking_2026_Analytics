"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LabelList,
  Legend
} from "recharts";
import { 
  ShieldCheck, 
  Database, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Grid,
  FileSpreadsheet,
  Workflow
} from "lucide-react";
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

interface OutlierItem {
  indicator: string;
  outlier_count: number;
  pct_outliers: number;
}

export default function DataQualityPage() {
  const [missingReport, setMissingReport] = useState<MissingReportItem[]>([]);
  const [imputationLog, setImputationLog] = useState<ImputationLogItem[]>([]);
  const [outliers, setOutliers] = useState<OutlierItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/missing_value_report.json").then((r) => r.json()),
      fetch("/data/imputation_log.json").then((r) => r.json()),
      fetch("/data/outlier_summary.json").then((r) => r.json()),
    ]).then(([mReport, iLog, oSummary]) => {
      setMissingReport(mReport);
      setImputationLog(iLog);
      setOutliers(oSummary);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading data quality audit:", err);
      setLoading(false);
    });
  }, []);

  // 1. Calculate Raw Data Health Metrics
  const totalRecords = 1504;
  const totalCells = 1504 * 9;
  const totalMissingCells = useMemo(() => missingReport.reduce((acc, curr) => acc + curr.total_missing, 0), [missingReport]);
  const totalOutliers = useMemo(() => outliers.reduce((acc, curr) => acc + curr.outlier_count, 0), [outliers]);
  const affectedRecords = 165; // Records with at least 1 missing cell

  // 2. Data Issue Distribution Data
  const issueDistribution = useMemo(() => [
    { category: "Missing Values", count: totalMissingCells, color: "#EF4444" },
    { category: "Outliers Flagged", count: totalOutliers, color: "#F59E0B" },
    { category: "Rank Patterns ('701+', '43=')", count: 85, color: "#6366F1" },
    { category: "Formatting/Dash ('-') Cells", count: 80, color: "#06B6D4" },
    { category: "Duplicate Records", count: 0, color: "#10B981" },
  ], [totalMissingCells, totalOutliers]);

  // 3. Treatment Methods Data
  const totalLayer1 = useMemo(() => imputationLog.reduce((acc, curr) => acc + curr.group_median, 0), [imputationLog]);
  const totalLayer2 = useMemo(() => imputationLog.reduce((acc, curr) => acc + curr.knn, 0), [imputationLog]);
  const totalLayer3 = useMemo(() => imputationLog.reduce((acc, curr) => acc + curr.global_median, 0), [imputationLog]);

  const treatmentMethods = useMemo(() => [
    { method: "Layer 1: Group Median", count: totalLayer1, color: "#6366F1" },
    { method: "Layer 2: KNN Imputer (k=5)", count: totalLayer2, color: "#10B981" },
    { method: "Layer 3: Global Median", count: totalLayer3, color: "#F59E0B" },
    { method: "Z-Score Standardization", count: 13536, color: "#8B5CF6" },
  ], [totalLayer1, totalLayer2, totalLayer3]);

  // 4. Missing Values Before vs After Data
  const beforeAfterMissing = useMemo(() => {
    return missingReport.map((item) => ({
      column: item.column.replace(" Score", ""),
      before: item.total_missing,
      after: 0,
    }));
  }, [missingReport]);

  // 5. Enriched Attributes List
  const enrichedAttributes = [
    { category: "Geographic Enrichment", count: 2, fields: "Region, ISO-3 Code" },
    { category: "Institutional Status", count: 2, fields: "Status Group (Public/Private), Normalized Size" },
    { category: "Imputed Indicator Scores", count: 9, fields: "AR, ER, FSR, CPF, IFR, ISR, IRN, EO, SUS Imputed" },
    { category: "Imputation Method Flags", count: 9, fields: "9 Imputation Method Stamps (*_imputed_method)" },
    { category: "Deterministic Re-Ranking", count: 4, fields: "Overall Score New, Dense Rank, Rank Shift, Score Difference" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-sub">Loading Data Quality & Enrichment Audit...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
          🧪 Data Quality & Data Enrichment Suite
        </span>
        <h1 className="text-3xl font-extrabold text-main tracking-tight mt-2">
          Data Quality & <span className="gradient-text">Enrichment Transformation</span>
        </h1>
        <p className="text-sm text-sub mt-1 max-w-3xl">
          From raw, incomplete published data to a 100% validated, standardized, and enriched analytical dataset.
        </p>
      </div>

      {/* SECTION 01 — 🔴 Raw Data Health */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
          <h2 className="text-xl font-extrabold text-main tracking-tight">
            01 — 🔴 Raw Data Health
          </h2>
        </div>

        {/* 6 Raw Health KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <ScoreCard title="Total Records" value={totalRecords.toLocaleString()} subtitle="Raw Universities" icon={Database} />
          <ScoreCard title="Missing Values" value={`${totalMissingCells}`} subtitle="Raw Missing Cells" badge={{ text: "1.22% of total", type: "warning" }} icon={AlertTriangle} />
          <ScoreCard title="Affected Records" value={`${affectedRecords}`} subtitle="Unis with missing data" badge={{ text: "10.97% of Unis", type: "warning" }} icon={AlertTriangle} />
          <ScoreCard title="Problem Fields" value="9 / 9" subtitle="Columns affected" icon={Grid} />
          <ScoreCard title="Outliers Detected" value={`${totalOutliers}`} subtitle="IQR Outlier Cells" icon={TrendingUp} />
          <ScoreCard title="Duplicate Records" value="0" subtitle="Zero duplicates" badge={{ text: "Clean Primary Key", type: "success" }} icon={CheckCircle2} />
        </div>

        {/* Visualization: Missing Values by Field (Horizontal Bar Chart) */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h3 className="font-extrabold text-main text-base">Raw Missing Values by Indicator Field</h3>
              <p className="text-xs text-sub">Pre-cleaned breakdown of missing observation counts across 9 indicators</p>
            </div>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-500/15 px-2.5 py-1 rounded-full">
              Raw Field Gaps
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missingReport} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="column" type="category" stroke="#94a3b8" fontSize={11} width={140} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }} />
                <Bar dataKey="total_missing" fill="#EF4444" radius={[0, 6, 6, 0]}>
                  <LabelList dataKey="total_missing" position="right" fill="#EF4444" fontSize={11} fontWeight={800} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 02 — 🚨 What Was Wrong? */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <h2 className="text-xl font-extrabold text-main tracking-tight">
            02 — 🚨 What Was Wrong? (Raw Problem Breakdown)
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Issue Distribution Bar Chart */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-extrabold text-main text-base">Data Issue Category Distribution</h3>
              <span className="text-xs text-amber-600 dark:text-amber-300 font-bold bg-amber-500/15 px-2.5 py-1 rounded-full">
                Issue Audit
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issueDistribution} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="count" position="top" fill="#94A3B8" fontSize={11} fontWeight={700} />
                    {issueDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Problems by Indicator Heatmap */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-extrabold text-main text-base">Problems by Indicator Matrix</h3>
              <span className="text-xs text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-500/15 px-2.5 py-1 rounded-full">
                Problem Matrix
              </span>
            </div>

            <div className="overflow-x-auto pt-1">
              <table className="w-full text-left text-xs">
                <thead className="custom-table-header uppercase tracking-wider font-extrabold">
                  <tr>
                    <th className="py-2.5 px-3">Indicator</th>
                    <th className="py-2.5 px-3 text-center">Missing</th>
                    <th className="py-2.5 px-3 text-center">Outlier</th>
                    <th className="py-2.5 px-3 text-center">Pattern ('701+')</th>
                    <th className="py-2.5 px-3 text-center">Total Affected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {missingReport.map((m) => {
                    const out = outliers.find((o) => o.indicator.startsWith(m.column.substring(0, 4)))?.outlier_count || 0;
                    return (
                      <tr key={m.column} className="custom-table-row">
                        <td className="py-2 px-3 font-bold text-main">{m.column}</td>
                        <td className="py-2 px-3 text-center font-mono text-rose-600 dark:text-rose-400 font-bold">{m.total_missing}</td>
                        <td className="py-2 px-3 text-center font-mono text-amber-600 dark:text-amber-400 font-bold">{out}</td>
                        <td className="py-2 px-3 text-center font-mono text-indigo-600 dark:text-indigo-400 font-bold">{m.pattern_count}</td>
                        <td className="py-2 px-3 text-center font-mono font-extrabold text-main">{m.total_missing + out}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 03 — 🛠️ Data Treatment */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
          <h2 className="text-xl font-extrabold text-main tracking-tight">
            03 — 🛠️ Data Treatment & Pipeline Architecture
          </h2>
        </div>

        {/* Cleaning Pipeline Diagram Flow */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-main text-base">End-to-End Data Treatment Pipeline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl custom-pill border border-rose-500/30 font-bold space-y-1">
              <div className="text-rose-600 dark:text-rose-400">1. RAW SOURCE</div>
              <div className="text-[10px] text-sub font-normal">NaN, dashes, patterns</div>
            </div>
            <div className="p-3 rounded-xl custom-pill border border-indigo-500/30 font-bold space-y-1">
              <div className="text-indigo-600 dark:text-indigo-400">2. IMPUTATION</div>
              <div className="text-[10px] text-sub font-normal">Layer 1 → KNN → Global</div>
            </div>
            <div className="p-3 rounded-xl custom-pill border border-purple-500/30 font-bold space-y-1">
              <div className="text-purple-600 dark:text-purple-400">3. STANDARDIZATION</div>
              <div className="text-[10px] text-sub font-normal">Z-Score & 0-100 Rescale</div>
            </div>
            <div className="p-3 rounded-xl custom-pill border border-amber-500/30 font-bold space-y-1">
              <div className="text-amber-600 dark:text-amber-400">4. VALIDATION</div>
              <div className="text-[10px] text-sub font-normal">6/6 Deep Audits Passed</div>
            </div>
            <div className="p-3 rounded-xl custom-pill border border-emerald-500/30 font-bold space-y-1 bg-emerald-500/10">
              <div className="text-emerald-600 dark:text-emerald-400 font-extrabold">5. ENRICHED DATA</div>
              <div className="text-[10px] text-sub font-normal">Ready for Analysis</div>
            </div>
          </div>
        </div>

        {/* Treatment Methods Bar Chart & Treatment x Indicator Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Treatment Methods Bar Chart */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <h3 className="font-extrabold text-main text-base">Treatment Methods Executed</h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={treatmentMethods} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                  <XAxis dataKey="method" stroke="#94a3b8" fontSize={9} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="count" position="top" fill="#94A3B8" fontSize={11} fontWeight={700} />
                    {treatmentMethods.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Treatment Method x Indicator Heatmap */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <h3 className="font-extrabold text-main text-base">Treatment Method × Indicator Matrix</h3>
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-left text-xs">
                <thead className="custom-table-header uppercase tracking-wider font-extrabold">
                  <tr>
                    <th className="py-2.5 px-3">Indicator</th>
                    <th className="py-2.5 px-3 text-center">Observed</th>
                    <th className="py-2.5 px-3 text-center">Layer 1 (Group)</th>
                    <th className="py-2.5 px-3 text-center">Layer 2 (KNN)</th>
                    <th className="py-2.5 px-3 text-center">Total Imputed %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {imputationLog.map((row) => (
                    <tr key={row.indicator} className="custom-table-row">
                      <td className="py-2 px-3 font-bold text-main">{row.indicator}</td>
                      <td className="py-2 px-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-bold">{row.observed}</td>
                      <td className="py-2 px-3 text-center font-mono text-indigo-600 dark:text-indigo-400 font-bold">{row.group_median}</td>
                      <td className="py-2 px-3 text-center font-mono text-indigo-600 dark:text-indigo-400 font-bold">{row.knn}</td>
                      <td className="py-2 px-3 text-center font-mono font-extrabold text-amber-600 dark:text-amber-400">{row.pct_imputed}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 04 — 🟢 BEFORE vs AFTER ⭐ (HERO SECTION) */}
      <div className="glass-card p-8 rounded-3xl border-2 border-emerald-500/30 space-y-8 bg-emerald-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/30">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white">
              ⭐ HERO SECTION — MEASURABLE IMPROVEMENT
            </span>
            <h2 className="text-2xl font-extrabold text-main tracking-tight mt-2">
              04 — 🟢 Before vs. After Transformation Evidence
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              100.00% Data Completeness Achieved
            </span>
          </div>
        </div>

        {/* 5 Before -> After Hero KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 text-center space-y-1">
            <div className="text-[10px] font-bold text-sub uppercase">Missing Values</div>
            <div className="text-xl font-extrabold text-main">
              <span className="text-rose-500 line-through">165</span> <ArrowRight className="w-4 h-4 inline text-emerald-500" /> <span className="text-emerald-600 dark:text-emerald-400 font-mono">0</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% Resolved</div>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 text-center space-y-1">
            <div className="text-[10px] font-bold text-sub uppercase">Affected Records</div>
            <div className="text-xl font-extrabold text-main">
              <span className="text-amber-500 line-through">165</span> <ArrowRight className="w-4 h-4 inline text-emerald-500" /> <span className="text-emerald-600 dark:text-emerald-400 font-mono">0</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Zero Gaps Remaining</div>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 text-center space-y-1">
            <div className="text-[10px] font-bold text-sub uppercase">Outliers Handled</div>
            <div className="text-xl font-extrabold text-main">
              <span className="text-sub font-mono">288</span> <ArrowRight className="w-4 h-4 inline text-emerald-500" /> <span className="text-emerald-600 dark:text-emerald-400 font-mono">288</span>
            </div>
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Flags Preserved</div>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 text-center space-y-1">
            <div className="text-[10px] font-bold text-sub uppercase">Data Completeness</div>
            <div className="text-xl font-extrabold text-main">
              <span className="text-sub line-through">98.78%</span> <ArrowRight className="w-4 h-4 inline text-emerald-500" /> <span className="text-emerald-600 dark:text-emerald-400 font-mono">100.00%</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+1.22% Boost</div>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 text-center space-y-1">
            <div className="text-[10px] font-bold text-sub uppercase">Usable Records</div>
            <div className="text-xl font-extrabold text-main">
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">1,504 / 1,504</span>
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% Retained</div>
          </div>
        </div>

        {/* Grouped Bar Chart: Missing Values Before vs After */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <h3 className="font-extrabold text-main text-base">Missing Values — Before vs After Imputation</h3>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={beforeAfterMissing} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis dataKey="column" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 40]} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }} />
                <Legend wrapperStyle={{ fontSize: "12px", fontWeight: 700 }} />
                <Bar name="Before Cleaning (Raw Missing)" dataKey="before" fill="#EF4444" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="before" position="top" fill="#EF4444" fontSize={11} fontWeight={700} />
                </Bar>
                <Bar name="After Imputation (Cleaned)" dataKey="after" fill="#10B981" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="after" position="top" fill="#10B981" fontSize={11} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 05 — 📦 Data Enrichment */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
          <h2 className="text-xl font-extrabold text-main tracking-tight">
            05 — 📦 Data Enrichment & Added Attributes
          </h2>
        </div>

        {/* Enrichment KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ScoreCard title="Original Columns" value="15" subtitle="Raw Schema Fields" icon={FileSpreadsheet} />
          <ScoreCard title="Added Enriched Columns" value="14" subtitle="Derived & Method Fields" badge={{ text: "+93.3% Schema Expansion", type: "indigo" }} icon={Sparkles} />
          <ScoreCard title="Original Records" value="1,504" subtitle="Raw Universities" icon={Database} />
          <ScoreCard title="Enriched Records" value="1,504" subtitle="Full Data Coverage" badge={{ text: "100% Enriched", type: "success" }} icon={CheckCircle2} />
        </div>

        {/* Added Attributes Bar Chart */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <h3 className="font-extrabold text-main text-base">Enriched Attributes Breakdown</h3>
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="custom-table-header uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="py-3 px-4">Enrichment Category</th>
                  <th className="py-3 px-4 text-center">Attribute Count</th>
                  <th className="py-3 px-4">Enriched Fields Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {enrichedAttributes.map((attr) => (
                  <tr key={attr.category} className="custom-table-row">
                    <td className="py-3 px-4 font-bold text-main">{attr.category}</td>
                    <td className="py-3 px-4 text-center font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                      {attr.count}
                    </td>
                    <td className="py-3 px-4 font-semibold text-sub">{attr.fields}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 06 — 🧬 Data Lineage & Final Summary */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <h2 className="text-xl font-extrabold text-main tracking-tight">
            06 — 🧬 Data Lineage & Final Dataset Summary
          </h2>
        </div>

        {/* Lineage Flow Visual */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-main text-base">Complete Data Lineage Flow</h3>
          <div className="p-4 rounded-xl bg-slate-900 text-gray-200 font-mono text-xs overflow-x-auto space-y-2 border border-slate-700">
            <div className="text-emerald-400 font-bold">RAW DATA (15 Columns, 1,504 Records, 165 Missing Cells)</div>
            <div className="pl-4">↓</div>
            <div className="text-indigo-400 font-bold">3-LAYER IMPUTATION (Layer 1 Group Median → Layer 2 KNN k=5 → Layer 3 Global)</div>
            <div className="pl-4">↓</div>
            <div className="text-purple-400 font-bold">Z-SCORE STANDARDIZATION & 0-100 RESCALING</div>
            <div className="pl-4">↓</div>
            <div className="text-amber-400 font-bold">VALIDATION (6/6 Automated Pipeline Verification Tests Passed)</div>
            <div className="pl-4">↓</div>
            <div className="text-cyan-400 font-bold">ENRICHMENT (14 New Attributes Added: Region, ISO3, Method Flags, Dense Rank)</div>
            <div className="pl-4">↓</div>
            <div className="text-emerald-300 font-extrabold">FINAL ANALYTICAL DATASET (29 Columns, 1,504 Records, 0 Missing Cells)</div>
          </div>
        </div>

        {/* Final Dataset Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ScoreCard title="Final Records" value="1,504" subtitle="100% Retained" icon={Database} />
          <ScoreCard title="Final Columns" value="29" subtitle="Enriched Schema" icon={FileSpreadsheet} />
          <ScoreCard title="Remaining Missing" value="0" subtitle="Zero Missing Cells" badge={{ text: "100% Complete", type: "success" }} icon={CheckCircle2} />
          <ScoreCard title="Final Completeness" value="100.00%" subtitle="13,536 / 13,536 Cells" badge={{ text: "Fully Cleaned", type: "success" }} icon={ShieldCheck} />
          <ScoreCard title="Enriched Fields" value="14" subtitle="Derived Attributes" badge={{ text: "Analytical Ready", type: "indigo" }} icon={Sparkles} />
        </div>
      </div>
    </div>
  );
}
