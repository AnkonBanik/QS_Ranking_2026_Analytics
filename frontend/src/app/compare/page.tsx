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
  ScatterChart,
  Scatter,
  LabelList
} from "recharts";
import { ArrowUpRight, ArrowDownRight, AlertCircle, RefreshCw, Filter } from "lucide-react";
import RadarComparison from "../components/RadarComparison";

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
  const [rankings, setRankings] = useState<University[]>([]);
  const [origVsNew, setOrigVsNew] = useState<OriginalVsNewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Region Chart Rank Tier Filter & Custom Numeric Input
  const [regionRankLimit, setRegionRankLimit] = useState<number>(0);
  const [regionCustomInput, setRegionCustomInput] = useState<string>("");

  // Country Chart Filters & Custom Limits
  const [countryRankLimit, setCountryRankLimit] = useState<number>(0);
  const [countryCustomRankInput, setCountryCustomRankInput] = useState<string>("");
  const [topCountryCountLimit, setTopCountryCountLimit] = useState<number>(15);
  const [countryCountInput, setCountryCountInput] = useState<string>("15");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rkRes, ovnRes] = await Promise.allSettled([
          fetch("/data/rankings.json").then((r) => r.json()),
          fetch("/data/original_vs_new.json").then((r) => r.json()),
        ]);

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

  // Compute Regional Stats based on filtered rankings
  const activeRegionLimit = useMemo(() => {
    if (regionCustomInput.trim() !== "") {
      const parsed = parseInt(regionCustomInput, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return regionRankLimit;
  }, [regionRankLimit, regionCustomInput]);

  const regionalStats = useMemo(() => {
    if (rankings.length === 0) return [];
    
    // Filter rankings by rank tier limit if active
    const filtered = activeRegionLimit > 0
      ? rankings.filter((u) => u.overall_rank_new <= activeRegionLimit)
      : rankings;

    // Group by region
    const map: Record<string, number[]> = {};
    filtered.forEach((u) => {
      if (!u.region) return;
      if (!map[u.region]) map[u.region] = [];
      map[u.region].push(u.overall_score_new);
    });

    return Object.entries(map).map(([region, scores]) => {
      const sum = scores.reduce((a, b) => a + b, 0);
      const mean = scores.length > 0 ? Number((sum / scores.length).toFixed(2)) : 0;
      return {
        region,
        mean_overall_score: mean,
        university_count: scores.length
      };
    }).sort((a, b) => b.mean_overall_score - a.mean_overall_score);
  }, [rankings, activeRegionLimit]);

  // Compute Country Stats based on filtered rankings & limit
  const activeCountryRankLimit = useMemo(() => {
    if (countryCustomRankInput.trim() !== "") {
      const parsed = parseInt(countryCustomRankInput, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return countryRankLimit;
  }, [countryRankLimit, countryCustomRankInput]);

  const activeCountryCountLimit = useMemo(() => {
    if (countryCountInput.trim() !== "") {
      const parsed = parseInt(countryCountInput, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return topCountryCountLimit;
  }, [topCountryCountLimit, countryCountInput]);

  const countryStats = useMemo(() => {
    if (rankings.length === 0) return [];

    const filtered = activeCountryRankLimit > 0
      ? rankings.filter((u) => u.overall_rank_new <= activeCountryRankLimit)
      : rankings;

    const map: Record<string, number> = {};
    filtered.forEach((u) => {
      if (!u.country) return;
      map[u.country] = (map[u.country] || 0) + 1;
    });

    return Object.entries(map)
      .map(([country, count]) => ({ country, university_count: count }))
      .sort((a, b) => b.university_count - a.university_count)
      .slice(0, activeCountryCountLimit);
  }, [rankings, activeCountryRankLimit, activeCountryCountLimit]);

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
          Comparative Analytics Suite
        </span>
        <h1 className="text-3xl font-extrabold text-main tracking-tight mt-2">
          Country, Regional & <span className="gradient-text">3-Country Radar Analytics</span>
        </h1>
        <p className="text-sm text-sub mt-1 max-w-2xl">
          Analyze institutional rank shifts, regional mean overall scores, and multi-country indicator profiles.
        </p>
      </div>

      {/* 1. Multi-Indicator Radar Component (3 Countries) */}
      <RadarComparison data={rankings} />

      {/* 2. Regional Mean Overall Score Chart with Filter & Score Labels */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="font-extrabold text-main text-lg">Regional Mean Overall Scores</h3>
            <p className="text-xs text-sub">Average standardized score across geographical regions</p>
          </div>

          {/* Filters & Numeric Input */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-sub font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Rank Filter:
            </span>
            {[
              { label: "All", value: 0 },
              { label: "Top 20", value: 20 },
              { label: "Top 50", value: 50 },
              { label: "Top 100", value: 100 },
              { label: "Top 200", value: 200 },
              { label: "Top 500", value: 500 },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setRegionRankLimit(t.value);
                  setRegionCustomInput("");
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  regionRankLimit === t.value && regionCustomInput === ""
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "custom-pill hover:bg-indigo-600/20"
                }`}
              >
                {t.label}
              </button>
            ))}

            {/* Custom Numeric Input */}
            <div className="flex items-center space-x-1 pl-2">
              <input
                type="number"
                placeholder="Custom (e.g. 75)..."
                value={regionCustomInput}
                onChange={(e) => setRegionCustomInput(e.target.value)}
                className="w-28 custom-input rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionalStats} margin={{ top: 25, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis dataKey="region" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }}
                itemStyle={{ color: "#818CF8" }}
              />
              <Bar dataKey="mean_overall_score" fill="#6366f1" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="mean_overall_score" position="top" fill="#818CF8" fontSize={12} fontWeight={700} />
                {regionalStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "#6366f1" : "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Top Countries by Ranked Institutions Chart with Filters & Score Labels */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="font-extrabold text-main text-lg">Top Countries by Ranked Institutions</h3>
            <p className="text-xs text-sub">Number of institutions in dataset by nation</p>
          </div>

          {/* Controls: Rank Tier Filter & Custom Count Input */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Rank Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-sub font-bold">Rank Tier:</span>
              {[
                { label: "All", value: 0 },
                { label: "Top 50", value: 50 },
                { label: "Top 100", value: 100 },
                { label: "Top 200", value: 200 },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    setCountryRankLimit(t.value);
                    setCountryCustomRankInput("");
                  }}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    countryRankLimit === t.value && countryCustomRankInput === ""
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "custom-pill hover:bg-emerald-600/20"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Custom Rank Input */}
            <div className="flex items-center space-x-1">
              <input
                type="number"
                placeholder="Rank (e.g. 75)..."
                value={countryCustomRankInput}
                onChange={(e) => setCountryCustomRankInput(e.target.value)}
                className="w-24 custom-input rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Number of Countries Input */}
            <div className="flex items-center space-x-1 pl-2 border-l border-gray-200 dark:border-gray-800">
              <span className="text-sub font-bold">Show Countries:</span>
              <input
                type="number"
                placeholder="Count (e.g. 15)..."
                value={countryCountInput}
                onChange={(e) => setCountryCountInput(e.target.value)}
                className="w-20 custom-input rounded-lg px-2 py-1 text-xs font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="h-96 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryStats} layout="vertical" margin={{ top: 5, right: 40, left: 90, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis dataKey="country" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={130} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }}
                itemStyle={{ color: "#10B981" }}
              />
              <Bar dataKey="university_count" fill="#10b981" radius={[0, 8, 8, 0]}>
                <LabelList dataKey="university_count" position="right" fill="#10B981" fontSize={12} fontWeight={700} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Original vs. New Re-Ranking Scatter Plot & Shift Histogram */}
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
                <BarChart data={origVsNew.shift_binned} margin={{ top: 15, right: 20, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="count" position="top" fill="#94A3B8" fontSize={11} fontWeight={700} />
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

      {/* 5. Biggest Rank Gainers & Largest Re-Rank Adjustments Grid (POSITIONED AT BOTTOM) */}
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

        {/* Largest Re-Rank Adjustments */}
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
    </div>
  );
}
