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
  Cell,
  ScatterChart,
  Scatter
} from "recharts";
import { ArrowUpRight, ArrowDownRight, AlertCircle, RefreshCw } from "lucide-react";
import RadarComparison from "../components/RadarComparison";

interface CountryStat {
  country: string;
  university_count: number;
  mean_overall_score: number;
  median_overall_score: number;
  top_university: string;
  top_university_score: number;
}

interface RegionStat {
  region: string;
  university_count: number;
  mean_overall_score: number;
  median_overall_score: number;
}

interface University {
  name: string;
  country: string;
  region: string;
  overall_rank_new: number;
  overall_rank_original: number;
  rank_change: number;
  overall_score_new: number;
  ar_score_imputed: number;
  er_score_imputed: number;
  fsr_score_imputed: number;
  cpf_score_imputed: number;
  ifr_score_imputed: number;
  isr_score_imputed: number;
  irn_score_imputed: number;
  eo_score_imputed: number;
  sus_score_imputed: number;
}

interface OriginalVsNewData {
  scatter_data: Array<{
    sl: number;
    name: string;
    country: string;
    overall_rank_original: number;
    overall_rank_new: number;
    rank_change: number;
    score_difference: number;
  }>;
  shift_binned: Array<{
    category: string;
    count: number;
    color: string;
  }>;
}

export default function ComparePage() {
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [regions, setRegions] = useState<RegionStat[]>([]);
  const [rankings, setRankings] = useState<University[]>([]);
  const [origVsNew, setOrigVsNew] = useState<OriginalVsNewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cRes, rRes, rkRes, ovnRes] = await Promise.allSettled([
          fetch("/data/countries.json").then((r) => r.json()),
          fetch("/data/regions.json").then((r) => r.json()),
          fetch("/data/rankings.json").then((r) => r.json()),
          fetch("/data/original_vs_new.json").then((r) => r.json()),
        ]);

        if (cRes.status === "fulfilled") setCountries(cRes.value.slice(0, 15));
        if (rRes.status === "fulfilled") setRegions(rRes.value);
        if (rkRes.status === "fulfilled") setRankings(rkRes.value);
        if (ovnRes.status === "fulfilled") setOrigVsNew(ovnRes.value);

        setLoading(false);
      } catch (err) {
        console.error("Error loading comparison data:", err);
        setError("Failed to load comparative data contracts.");
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-sub">Loading Comparison Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 glass-card rounded-2xl border border-rose-500/30 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-main">Comparative Data Missing</h2>
        <p className="text-xs text-sub max-w-md">{error}</p>
      </div>
    );
  }

  const gainers = [...rankings].sort((a, b) => b.rank_change - a.rank_change).slice(0, 5);
  const losers = [...rankings].sort((a, b) => a.rank_change - b.rank_change).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
          Comparative & Dynamic Intelligence
        </span>
        <h1 className="text-3xl font-extrabold text-main tracking-tight mt-2">
          Country, Regional & <span className="gradient-text">Radar Comparisons</span>
        </h1>
        <p className="text-sm text-sub mt-1 max-w-2xl">
          Analyze institutional rank shifts, country-level indicator radars, and tie-breaker re-ranking distributions.
        </p>
      </div>

      {/* Multi-Indicator Radar Component */}
      <RadarComparison data={rankings} />

      {/* Original vs. New Re-Ranking Scatter Plot & Shift Histogram */}
      {origVsNew && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rank Shift Distribution Histogram */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-main text-base">Rank Shift Category Distribution</h3>
                <p className="text-xs text-sub">Institutional shifts resulting from 10-level tie-breaker</p>
              </div>
              <RefreshCw className="w-4 h-4 text-indigo-500" />
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={origVsNew.shift_binned} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {origVsNew.shift_binned.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Original Rank vs New Tie-Breaker Rank Scatter */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-main text-base">Original vs. New Rank Scatter</h3>
                <p className="text-xs text-sub">Linear correlation showing rank adjustment precision</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                  <XAxis type="number" dataKey="overall_rank_original" name="Original Rank" stroke="#94a3b8" fontSize={10} />
                  <YAxis type="number" dataKey="overall_rank_new" name="New Dense Rank" stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF", fontSize: "11px" }}
                  />
                  <Scatter name="Universities" data={origVsNew.scatter_data} fill="#6366F1" opacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Top Gainers & Losers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biggest Rank Gainers */}
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-main text-base">Biggest Rank Gainers</h3>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-300 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Positive Rank Shift
            </span>
          </div>

          <div className="space-y-3">
            {gainers.map((uni, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl custom-pill border border-gray-200 dark:border-gray-800">
                <div>
                  <div className="font-bold text-main text-sm">{uni.name}</div>
                  <div className="text-xs text-sub">{uni.country} • Score: {uni.overall_score_new}</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                    +{uni.rank_change} Places
                  </span>
                  <div className="text-[10px] text-muted-custom mt-0.5 font-mono">Rank #{uni.overall_rank_new}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biggest Rank Drops */}
        <div className="glass-card p-6 rounded-2xl border border-rose-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-main text-base">Largest Re-Rank Adjustments</h3>
            </div>
            <span className="text-xs text-rose-600 dark:text-rose-300 font-bold bg-rose-500/15 px-2.5 py-1 rounded-full border border-rose-500/30">
              Score Adjustment
            </span>
          </div>

          <div className="space-y-3">
            {losers.map((uni, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl custom-pill border border-gray-200 dark:border-gray-800">
                <div>
                  <div className="font-bold text-main text-sm">{uni.name}</div>
                  <div className="text-xs text-sub">{uni.country} • Score: {uni.overall_score_new}</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                    {uni.rank_change} Places
                  </span>
                  <div className="text-[10px] text-muted-custom mt-0.5 font-mono">Rank #{uni.overall_rank_new}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional Mean Overall Score Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-extrabold text-main text-lg">Regional Mean Overall Scores</h3>
            <p className="text-xs text-sub">Comparison of average standardized score across geographical regions</p>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/30">
            {regions.length} Regions
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regions} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis dataKey="region" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 50]} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }}
                itemStyle={{ color: "#818CF8" }}
              />
              <Bar dataKey="mean_overall_score" radius={[8, 8, 0, 0]}>
                {regions.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#6366f1" : "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 15 Countries by University Count Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-extrabold text-main text-lg">Top 15 Countries by Ranked Institutions</h3>
            <p className="text-xs text-sub">Number of institutions in QS 2025 dataset by nation</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countries} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="country" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={120} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }}
                itemStyle={{ color: "#10B981" }}
              />
              <Bar dataKey="university_count" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
