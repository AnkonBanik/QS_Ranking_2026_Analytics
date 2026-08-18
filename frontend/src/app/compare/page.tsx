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
import { ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react";

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
  overall_rank_new: number;
  overall_rank_original: number;
  rank_change: number;
  overall_score_new: number;
}

export default function ComparePage() {
  const [countries, setCountries] = useState<CountryStat[]>([]);
  const [regions, setRegions] = useState<RegionStat[]>([]);
  const [rankings, setRankings] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/data/countries.json").then((r) => { if (!r.ok) throw new Error("countries.json missing"); return r.json(); }),
      fetch("/data/regions.json").then((r) => { if (!r.ok) throw new Error("regions.json missing"); return r.json(); }),
      fetch("/data/rankings.json").then((r) => { if (!r.ok) throw new Error("rankings.json missing"); return r.json(); }),
    ]).then(([cData, rData, rkData]) => {
      setCountries(cData.slice(0, 15));
      setRegions(rData);
      setRankings(rkData);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading comparison data:", err);
      setError("Failed to load comparative data contracts. Please run python -m pipeline.run_pipeline.");
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-400">Loading Comparison Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 glass-card rounded-2xl border border-rose-500/30 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-white">Comparative Data Missing</h2>
        <p className="text-xs text-gray-400 max-w-md">{error}</p>
      </div>
    );
  }

  const gainers = [...rankings].sort((a, b) => b.rank_change - a.rank_change).slice(0, 5);
  const losers = [...rankings].sort((a, b) => a.rank_change - b.rank_change).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-gray-800">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Part 2 — Comparative Intelligence
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
          Country & Regional <span className="gradient-text">Rank-Shift Comparisons</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl">
          Analyze how regional distributions and imputation standardizations reshaped institutional ranks globally.
        </p>
      </div>

      {/* Top Gainers & Losers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biggest Rank Gainers */}
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Biggest Rank Gainers</h3>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Positive Rank Shift
            </span>
          </div>

          <div className="space-y-3">
            {gainers.map((uni, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-gray-800">
                <div>
                  <div className="font-semibold text-white text-sm">{uni.name}</div>
                  <div className="text-xs text-gray-400">{uni.country} • Score: {uni.overall_score_new}</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    +{uni.rank_change} Places
                  </span>
                  <div className="text-[10px] text-gray-500 mt-0.5">Rank #{uni.overall_rank_new}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biggest Rank Drops */}
        <div className="glass-card p-6 rounded-2xl border border-rose-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Largest Re-Rank Adjustments</h3>
            </div>
            <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              Score Adjustment
            </span>
          </div>

          <div className="space-y-3">
            {losers.map((uni, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-gray-800">
                <div>
                  <div className="font-semibold text-white text-sm">{uni.name}</div>
                  <div className="text-xs text-gray-400">{uni.country} • Score: {uni.overall_score_new}</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    {uni.rank_change} Places
                  </span>
                  <div className="text-[10px] text-gray-500 mt-0.5">Rank #{uni.overall_rank_new}</div>
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
            <h3 className="font-bold text-white text-lg">Regional Mean Overall Scores</h3>
            <p className="text-xs text-gray-400">Comparison of average standardized score across geographical regions</p>
          </div>
          <span className="text-xs text-indigo-400 font-medium bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {regions.length} Regions
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regions} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="region" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 50]} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                itemStyle={{ color: "#818cf8" }}
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
            <h3 className="font-bold text-white text-lg">Top 15 Countries by Ranked Institutions</h3>
            <p className="text-xs text-gray-400">Number of institutions in QS 2025 dataset by nation</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countries} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="country" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={120} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px" }}
                itemStyle={{ color: "#10b981" }}
              />
              <Bar dataKey="university_count" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
