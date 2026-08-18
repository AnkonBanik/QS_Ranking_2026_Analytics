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
  Cell, 
  LabelList 
} from "recharts";
import { BarChart2, TrendingUp } from "lucide-react";

interface University {
  overall_score_new: number;
  overall_rank_new: number;
}

interface ScoreRankHistogramsProps {
  data: University[];
}

export default function ScoreRankHistograms({ data }: ScoreRankHistogramsProps) {
  // 1. Overall Score Distribution Binned Histogram
  const scoreBins = useMemo(() => {
    const bins = [
      { range: "90-100", min: 90, max: 100, count: 0, color: "#6366F1" },
      { range: "80-89", min: 80, max: 89.99, count: 0, color: "#10B981" },
      { range: "70-79", min: 70, max: 79.99, count: 0, color: "#F59E0B" },
      { range: "60-69", min: 60, max: 69.99, count: 0, color: "#8B5CF6" },
      { range: "50-59", min: 50, max: 59.99, count: 0, color: "#06B6D4" },
      { range: "40-49", min: 40, max: 49.99, count: 0, color: "#EC4899" },
      { range: "30-39", min: 30, max: 39.99, count: 0, color: "#F97316" },
      { range: "<30", min: 0, max: 29.99, count: 0, color: "#64748B" },
    ];

    data.forEach((u) => {
      const score = u.overall_score_new;
      const bin = bins.find((b) => score >= b.min && score <= b.max);
      if (bin) bin.count += 1;
    });

    return bins;
  }, [data]);

  // 2. Rank Distribution Binned Histogram
  const rankBins = useMemo(() => {
    const bins = [
      { range: "Rank 1-50", min: 1, max: 50, count: 0, color: "#6366F1" },
      { range: "Rank 51-100", min: 51, max: 100, count: 0, color: "#10B981" },
      { range: "Rank 101-200", min: 101, max: 200, count: 0, color: "#F59E0B" },
      { range: "Rank 201-500", min: 201, max: 500, count: 0, color: "#8B5CF6" },
      { range: "Rank 501-1000", min: 501, max: 1000, count: 0, color: "#06B6D4" },
      { range: "Rank 1001+", min: 1001, max: 2000, count: 0, color: "#EC4899" },
    ];

    data.forEach((u) => {
      const rank = u.overall_rank_new;
      const bin = bins.find((b) => rank >= b.min && rank <= b.max);
      if (bin) bin.count += 1;
    });

    return bins;
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overall Score Distribution Histogram */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-main text-base">Overall Score Distribution</h3>
              <p className="text-xs text-sub">Institutional frequency across 0–100 score brackets</p>
            </div>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-500/15 px-2.5 py-1 rounded-full">
            Histogram
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreBins} margin={{ top: 20, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF", fontSize: "12px" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="count" position="top" fill="#94A3B8" fontSize={11} fontWeight={700} />
                {scoreBins.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rank Distribution Histogram */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-main text-base">Rank Distribution</h3>
              <p className="text-xs text-sub">Institutional frequency across dense rank tiers</p>
            </div>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-300 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-full">
            Tier Breakdown
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rankBins} margin={{ top: 20, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF", fontSize: "12px" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="count" position="top" fill="#94A3B8" fontSize={11} fontWeight={700} />
                {rankBins.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
