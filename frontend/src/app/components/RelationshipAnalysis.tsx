"use client";

import { useMemo } from "react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList
} from "recharts";
import { Network, Activity, Sparkles, Scale, Layers } from "lucide-react";
import BoxPlotChart from "./BoxPlotChart";

interface University {
  name: string;
  country: string;
  region: string;
  size: string;
  status_group: string;
  overall_score_new: number;
  ar_score_imputed: number;
  er_score_imputed: number;
  cpf_score_imputed: number;
  eo_score_imputed: number;
  sus_score_imputed: number;
}

interface CountryStat {
  country: string;
  university_count: number;
  mean_overall_score: number;
  top_university: string;
}

interface RelationshipAnalysisProps {
  rankings: University[];
  countries: CountryStat[];
}

export default function RelationshipAnalysis({ rankings, countries }: RelationshipAnalysisProps) {
  // 1. Country Quality vs Quantity Scatter
  const countryQualityVsQuantity = useMemo(() => {
    return countries.map((c) => ({
      country: c.country,
      count: c.university_count,
      mean_score: c.mean_overall_score,
      top_uni: c.top_university,
    }));
  }, [countries]);

  // 2. Sustainability vs Overall Score Scatter
  const susVsOverall = useMemo(() => {
    return rankings.slice(0, 300).map((u) => ({
      name: u.name,
      sus: u.sus_score_imputed,
      score: u.overall_score_new,
    }));
  }, [rankings]);

  // 3. Academic Rep vs Employer Rep Scatter
  const arVsEr = useMemo(() => {
    return rankings.slice(0, 300).map((u) => ({
      name: u.name,
      ar: u.ar_score_imputed,
      er: u.er_score_imputed,
    }));
  }, [rankings]);

  // 4. Citations per Faculty vs Overall Score Scatter
  const cpfVsOverall = useMemo(() => {
    return rankings.slice(0, 300).map((u) => ({
      name: u.name,
      cpf: u.cpf_score_imputed,
      score: u.overall_score_new,
    }));
  }, [rankings]);

  // 5. Employment Outcomes vs Overall Score Scatter
  const eoVsOverall = useMemo(() => {
    return rankings.slice(0, 300).map((u) => ({
      name: u.name,
      eo: u.eo_score_imputed,
      score: u.overall_score_new,
    }));
  }, [rankings]);

  // 6. Research Intensity vs Overall Score Box/Bar Stats
  const researchIntensityStats = useMemo(() => {
    // Categorize by CPF ranges as proxy for Research Intensity
    const vh = rankings.filter((u) => u.cpf_score_imputed >= 75);
    const h = rankings.filter((u) => u.cpf_score_imputed >= 50 && u.cpf_score_imputed < 75);
    const m = rankings.filter((u) => u.cpf_score_imputed >= 25 && u.cpf_score_imputed < 50);
    const l = rankings.filter((u) => u.cpf_score_imputed < 25);

    const getAvg = (list: University[]) => 
      list.length > 0 ? Number((list.reduce((a, b) => a + b.overall_score_new, 0) / list.length).toFixed(1)) : 0;

    return [
      { category: "Very High Research", meanScore: getAvg(vh), count: vh.length, color: "#6366F1" },
      { category: "High Research", meanScore: getAvg(h), count: h.length, color: "#10B981" },
      { category: "Medium Research", meanScore: getAvg(m), count: m.length, color: "#F59E0B" },
      { category: "Low Research", meanScore: getAvg(l), count: l.length, color: "#EF4444" },
    ];
  }, [rankings]);

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
          Part 1 — Relationship Analysis Suite
        </span>
        <h2 className="text-2xl font-extrabold text-main tracking-tight mt-1">
          Bivariate & Distribution Relationships
        </h2>
        <p className="text-xs text-sub mt-0.5">
          Empirical scatter correlations and structural box plot dispersions.
        </p>
      </div>

      {/* Row 1: Country Quality vs Quantity & Sustainability vs Overall Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Quality vs Quantity — Scatter */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h3 className="font-extrabold text-main text-base">Country Quality vs Quantity — Scatter</h3>
              <p className="text-xs text-sub">Mean Overall Score vs Number of Institutions per Country</p>
            </div>
            <Network className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis type="number" dataKey="count" name="University Count" stroke="#94a3b8" fontSize={10} />
                <YAxis type="number" dataKey="mean_score" name="Mean Score" stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl space-y-1">
                          <div className="font-bold text-amber-400">{d.country}</div>
                          <div className="text-gray-300">Count: {d.count} Institutions</div>
                          <div className="font-mono text-emerald-400">Mean Score: {d.mean_score}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Countries" data={countryQualityVsQuantity} fill="#6366F1" opacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sustainability vs Overall Score — Scatter */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h3 className="font-extrabold text-main text-base">Sustainability vs Overall Score — Scatter</h3>
              <p className="text-xs text-sub">Correlation between Sustainability indicator and Re-Rank Score</p>
            </div>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis type="number" dataKey="sus" name="Sustainability" stroke="#94a3b8" fontSize={10} />
                <YAxis type="number" dataKey="score" name="Overall Score" stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl space-y-1">
                          <div className="font-bold text-emerald-400">{d.name}</div>
                          <div className="text-gray-300">Sustainability: {d.sus}</div>
                          <div className="font-mono text-indigo-400">Overall Score: {d.score}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Universities" data={susVsOverall} fill="#10B981" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Academic Rep vs Employer Rep & Research Intensity Box/Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Reputation vs Employer Reputation — Scatter */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h3 className="font-extrabold text-main text-base">Academic Rep vs Employer Rep — Scatter</h3>
              <p className="text-xs text-sub">Bivariate perception alignment between Academic & Employer reputation</p>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis type="number" dataKey="ar" name="Academic Rep" stroke="#94a3b8" fontSize={10} />
                <YAxis type="number" dataKey="er" name="Employer Rep" stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl space-y-1">
                          <div className="font-bold text-amber-400">{d.name}</div>
                          <div className="text-indigo-400">Academic Rep: {d.ar}</div>
                          <div className="text-emerald-400">Employer Rep: {d.er}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Universities" data={arVsEr} fill="#F59E0B" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Research Intensity vs Overall Score — Box Plot / Bar Breakdown */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h3 className="font-extrabold text-main text-base">Research Intensity vs Overall Score — Box Plot</h3>
              <p className="text-xs text-sub">Average score performance by Citations-driven Research Intensity levels</p>
            </div>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={researchIntensityStats} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF" }}
                />
                <Bar dataKey="meanScore" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="meanScore" position="top" fill="#818CF8" fontSize={11} fontWeight={700} />
                  {researchIntensityStats.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Public vs Private & Size Box Plot Component */}
      <BoxPlotChart />

      {/* Row 4: Citations per Faculty vs Overall Score & Employment Outcomes vs Overall Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Citations per Faculty vs Overall Score — Scatter */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h3 className="font-extrabold text-main text-base">Citations per Faculty vs Overall Score — Scatter</h3>
              <p className="text-xs text-sub">Impact of research citation volume on overall rank placement</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis type="number" dataKey="cpf" name="Citations/Faculty" stroke="#94a3b8" fontSize={10} />
                <YAxis type="number" dataKey="score" name="Overall Score" stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl space-y-1">
                          <div className="font-bold text-indigo-400">{d.name}</div>
                          <div className="text-gray-300">CPF: {d.cpf}</div>
                          <div className="font-mono text-emerald-400">Score: {d.score}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Universities" data={cpfVsOverall} fill="#8B5CF6" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employment Outcomes vs Overall Score — Scatter */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h3 className="font-extrabold text-main text-base">Employment Outcomes vs Overall Score — Scatter</h3>
              <p className="text-xs text-sub">Graduate career placement impact on overall institutional rank</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                <XAxis type="number" dataKey="eo" name="Employment Outcomes" stroke="#94a3b8" fontSize={10} />
                <YAxis type="number" dataKey="score" name="Overall Score" stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl space-y-1">
                          <div className="font-bold text-pink-400">{d.name}</div>
                          <div className="text-gray-300">Employment: {d.eo}</div>
                          <div className="font-mono text-emerald-400">Score: {d.score}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Universities" data={eoVsOverall} fill="#EC4899" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
