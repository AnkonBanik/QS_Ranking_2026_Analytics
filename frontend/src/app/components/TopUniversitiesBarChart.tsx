"use client";

import { useState, useMemo } from "react";
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
import { Trophy, BarChart3, Filter } from "lucide-react";

interface University {
  sl: number;
  name: string;
  country: string;
  region: string;
  overall_rank_new: number;
  overall_score_new: number;
  ar_score_imputed: number;
  er_score_imputed: number;
  cpf_score_imputed: number;
}

interface TopUniversitiesBarChartProps {
  data: University[];
}

const BAR_COLORS = [
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#A855F7", // Violet
  "#EF4444", // Red
  "#84CC16", // Lime
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#3B82F6",
  "#F97316",
];

export default function TopUniversitiesBarChart({ data }: TopUniversitiesBarChartProps) {
  const [topLimit, setTopLimit] = useState<number>(10);
  const [customLimitInput, setCustomLimitInput] = useState<string>("");

  const activeLimit = useMemo(() => {
    if (customLimitInput.trim() !== "") {
      const parsed = parseInt(customLimitInput, 10);
      if (!isNaN(parsed) && parsed > 0) return Math.min(parsed, 50);
    }
    return topLimit;
  }, [topLimit, customLimitInput]);

  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => a.overall_rank_new - b.overall_rank_new)
      .slice(0, activeLimit)
      .map((uni) => ({
        rank: uni.overall_rank_new,
        name: uni.name.length > 22 ? uni.name.substring(0, 20) + "..." : uni.name,
        fullName: uni.name,
        country: uni.country,
        score: uni.overall_score_new,
        academicRep: uni.ar_score_imputed,
        employerRep: uni.er_score_imputed,
        citations: uni.cpf_score_imputed,
      }));
  }, [data, activeLimit]);

  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-main text-lg tracking-tight">
              Top Institutions Performance Bar Chart
            </h3>
            <p className="text-xs text-sub">
              Comparison of overall re-rank scores for top ranked global universities.
            </p>
          </div>
        </div>

        {/* Top 5, 10, 15, 20 Toggles & Custom Input */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="text-sub flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Show Top:
          </span>

          {[5, 10, 15, 20].map((n) => (
            <button
              key={n}
              onClick={() => {
                setTopLimit(n);
                setCustomLimitInput("");
              }}
              className={`px-3 py-1.5 rounded-xl transition-all border ${
                topLimit === n && customLimitInput === ""
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "custom-pill border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-slate-800"
              }`}
            >
              Top {n}
            </button>
          ))}

          {/* Custom Input */}
          <div className="flex items-center space-x-1 pl-1">
            <input
              type="number"
              placeholder="Custom..."
              value={customLimitInput}
              onChange={(e) => setCustomLimitInput(e.target.value)}
              className="w-24 custom-input rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Bar Chart Canvas */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 25, right: 20, left: 0, bottom: 45 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={11} 
              angle={-25} 
              textAnchor="end"
              interval={0}
            />
            <YAxis stroke="#94a3b8" fontSize={11} domain={[80, 100]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl space-y-1">
                      <div className="font-extrabold text-amber-400">#{d.rank} {d.fullName}</div>
                      <div className="text-gray-300">{d.country}</div>
                      <div className="font-mono text-emerald-400 font-bold">Overall Score: {d.score}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
              <LabelList dataKey="score" position="top" fill="#818CF8" fontSize={11} fontWeight={800} />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
