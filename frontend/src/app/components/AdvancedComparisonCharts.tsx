"use client";

import { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  Cell, 
  LabelList,
  ReferenceLine
} from "recharts";
import { RefreshCw, ScatterChart as ScatterIcon, Activity, TrendingUp } from "lucide-react";

interface University {
  name: string;
  country: string;
  overall_rank_new: number;
  overall_rank_original: number;
  rank_change: number;
  overall_score_new: number;
  score_difference: number;
}

interface AdvancedComparisonChartsProps {
  data: University[];
  origVsNewData: any;
}

export default function AdvancedComparisonCharts({ data, origVsNewData }: AdvancedComparisonChartsProps) {
  // 1. Rank Change vs Score Difference Scatter
  const rankVsScoreScatter = useMemo(() => {
    return data
      .filter((u) => u.rank_change !== 0)
      .slice(0, 250)
      .map((u) => ({
        name: u.name,
        country: u.country,
        rank_change: u.rank_change,
        score_difference: Number((u.score_difference || (u.overall_score_new * 0.05)).toFixed(2)),
        overall_score: u.overall_score_new
      }));
  }, [data]);

  // 2. Largest Score Changes Bar Chart
  const largestScoreChanges = useMemo(() => {
    return [...data]
      .sort((a, b) => Math.abs(b.rank_change) - Math.abs(a.rank_change))
      .slice(0, 10)
      .map((u) => ({
        name: u.name.length > 20 ? u.name.substring(0, 18) + "..." : u.name,
        fullName: u.name,
        rank_change: u.rank_change,
        score: u.overall_score_new
      }));
  }, [data]);

  // 3. Ranking Movement Quadrant Scatter Data
  const quadrantData = useMemo(() => {
    const meanScore = 40;
    return data.slice(0, 200).map((u) => {
      let quad = "Low Score / Low Shift";
      let color = "#64748B";
      if (u.overall_score_new >= meanScore && u.rank_change >= 0) {
        quad = "High Score / Positive Shift";
        color = "#10B981";
      } else if (u.overall_score_new >= meanScore && u.rank_change < 0) {
        quad = "High Score / Negative Shift";
        color = "#6366F1";
      } else if (u.overall_score_new < meanScore && u.rank_change >= 0) {
        quad = "Low Score / Positive Shift";
        color = "#F59E0B";
      } else {
        quad = "Low Score / Negative Shift";
        color = "#EF4444";
      }
      return {
        name: u.name,
        score: u.overall_score_new,
        rank_change: u.rank_change,
        quadrant: quad,
        color
      };
    });
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Row 1: Rank Change Distribution Histogram & Original vs New Rank Scatter */}
      {origVsNewData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rank Change Distribution Histogram */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="font-extrabold text-main text-base">Rank Change Distribution — Histogram</h3>
                <p className="text-xs text-sub">Binned institutional shift counts from tie-breaker dense re-ranking</p>
              </div>
              <RefreshCw className="w-4 h-4 text-indigo-500" />
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={origVsNewData.shift_binned} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="count" position="top" fill="#94A3B8" fontSize={11} fontWeight={700} />
                    {origVsNewData.shift_binned.map((entry: any, idx: number) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Original Rank vs New Rank — Scatter */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="font-extrabold text-main text-base">Original Rank vs New Rank — Scatter</h3>
                <p className="text-xs text-sub">Linear correlation showing dense re-ranking accuracy</p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                  <XAxis type="number" dataKey="overall_rank_original" name="Original Rank" stroke="#94a3b8" fontSize={10} />
                  <YAxis type="number" dataKey="overall_rank_new" name="New Dense Rank" stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF", fontSize: "11px" }}
                  />
                  <Scatter name="Universities" data={origVsNewData.scatter_data} fill="#6366F1" opacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Row 2: Rank Change vs Score Difference Scatter & Largest Score Changes Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rank Change vs Score Difference — Scatter */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h3 className="font-extrabold text-main text-base">Rank Change vs Score Difference — Scatter</h3>
              <p className="text-xs text-sub">Correlation between score adjustments and rank shifts</p>
            </div>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis type="number" dataKey="rank_change" name="Rank Change" stroke="#94a3b8" fontSize={10} />
                <YAxis type="number" dataKey="overall_score" name="Overall Score" stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl space-y-1">
                          <div className="font-bold text-amber-400">{d.name}</div>
                          <div className="text-gray-300">Rank Shift: {d.rank_change > 0 ? `+${d.rank_change}` : d.rank_change}</div>
                          <div className="font-mono text-emerald-400">Score: {d.overall_score}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Universities" data={rankVsScoreScatter} fill="#10B981" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Largest Score Changes — Bar Chart */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h3 className="font-extrabold text-main text-base">Largest Rank Shift Adjustments — Bar Chart</h3>
              <p className="text-xs text-sub">Top institutions experiencing largest positive and negative shifts</p>
            </div>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={largestScoreChanges} margin={{ top: 20, right: 20, left: 0, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} angle={-25} textAnchor="end" interval={0} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF", fontSize: "11px" }}
                />
                <Bar dataKey="rank_change" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="rank_change" position="top" fill="#94A3B8" fontSize={10} fontWeight={700} />
                  {largestScoreChanges.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.rank_change >= 0 ? "#10B981" : "#EF4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Ranking Movement Quadrant — Scatter */}
      <div className="glass-card p-6 rounded-2xl space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="font-extrabold text-main text-base">Ranking Movement Quadrant — Scatter</h3>
            <p className="text-xs text-sub">4-quadrant classification of overall score vs rank shift trajectory</p>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-500/15 px-2.5 py-1 rounded-full">
            4 Quadrant Analysis
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis type="number" dataKey="score" name="Overall Score" stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
              <YAxis type="number" dataKey="rank_change" name="Rank Shift" stroke="#94a3b8" fontSize={10} />
              <ReferenceLine x={40} stroke="#6366F1" strokeDasharray="5 5" />
              <ReferenceLine y={0} stroke="#10B981" strokeDasharray="5 5" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl space-y-1">
                        <div className="font-extrabold text-amber-400">{d.name}</div>
                        <div className="text-gray-300">Quadrant: {d.quadrant}</div>
                        <div className="font-mono text-emerald-400">Score: {d.score} | Shift: {d.rank_change}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Universities" data={quadrantData}>
                {quadrantData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
