"use client";

import { useState, useMemo } from "react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell
} from "recharts";
import { Scale, Trophy, Award } from "lucide-react";

interface University {
  name: string;
  country: string;
  overall_rank_new: number;
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

interface UniversityThreeWayCompareProps {
  data: University[];
}

const INDICATORS = [
  { key: "ar_score_imputed", label: "Academic Reputation" },
  { key: "er_score_imputed", label: "Employer Reputation" },
  { key: "fsr_score_imputed", label: "Faculty Student Ratio" },
  { key: "cpf_score_imputed", label: "Citations per Faculty" },
  { key: "ifr_score_imputed", label: "International Faculty" },
  { key: "isr_score_imputed", label: "International Students" },
  { key: "irn_score_imputed", label: "Int'l Research Network" },
  { key: "eo_score_imputed", label: "Employment Outcomes" },
  { key: "sus_score_imputed", label: "Sustainability Score" },
];

export default function UniversityThreeWayCompare({ data }: UniversityThreeWayCompareProps) {
  // Sort universities alphabetically for selectors
  const uniList = useMemo(() => {
    return [...data].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const [uniA, setUniA] = useState("Massachusetts Institute of Technology (MIT)");
  const [uniB, setUniB] = useState("Imperial College London");
  const [uniC, setUniC] = useState("Stanford University");

  const objA = useMemo(() => data.find((u) => u.name === uniA) || data[0], [data, uniA]);
  const objB = useMemo(() => data.find((u) => u.name === uniB) || data[1], [data, uniB]);
  const objC = useMemo(() => data.find((u) => u.name === uniC) || data[2], [data, uniC]);

  // Dumbbell Chart Scatter Data Structure
  const dumbbellData = useMemo(() => {
    if (!objA || !objB || !objC) return [];

    return INDICATORS.map((ind, idx) => ({
      yIndex: idx,
      indicator: ind.label,
      scoreA: Number((objA[ind.key as keyof University] as number || 0).toFixed(1)),
      scoreB: Number((objB[ind.key as keyof University] as number || 0).toFixed(1)),
      scoreC: Number((objC[ind.key as keyof University] as number || 0).toFixed(1)),
    }));
  }, [objA, objB, objC]);

  return (
    <div className="space-y-6">
      {/* Selector Banner */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-main text-lg tracking-tight">
                3-University Head-to-Head Comparison & Dumbbell Chart
              </h3>
              <p className="text-xs text-sub">
                Select 3 universities to compare score breakdowns across all 9 QS dimensions.
              </p>
            </div>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                University A (Indigo)
              </label>
              <select
                value={uniA}
                onChange={(e) => setUniA(e.target.value)}
                className="w-full custom-input rounded-xl px-2.5 py-1.5 font-bold focus:outline-none"
              >
                {uniList.map((u) => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                University B (Emerald)
              </label>
              <select
                value={uniB}
                onChange={(e) => setUniB(e.target.value)}
                className="w-full custom-input rounded-xl px-2.5 py-1.5 font-bold focus:outline-none"
              >
                {uniList.map((u) => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">
                University C (Amber)
              </label>
              <select
                value={uniC}
                onChange={(e) => setUniC(e.target.value)}
                className="w-full custom-input rounded-xl px-2.5 py-1.5 font-bold focus:outline-none"
              >
                {uniList.map((u) => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 1. Comparison Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="custom-table-header uppercase tracking-wider font-extrabold">
              <tr>
                <th className="py-3 px-4">Indicator</th>
                <th className="py-3 px-4 text-center text-indigo-600 dark:text-indigo-400">{objA?.name} (# {objA?.overall_rank_new})</th>
                <th className="py-3 px-4 text-center text-emerald-600 dark:text-emerald-400">{objB?.name} (# {objB?.overall_rank_new})</th>
                <th className="py-3 px-4 text-center text-amber-600 dark:text-amber-400">{objC?.name} (# {objC?.overall_rank_new})</th>
                <th className="py-3 px-4 text-center">Top Performing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {/* Overall Score */}
              <tr className="custom-table-row font-bold bg-indigo-500/10">
                <td className="py-3 px-4 text-main font-extrabold">Overall Re-Rank Score</td>
                <td className="py-3 px-4 text-center font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                  {objA?.overall_score_new.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  {objB?.overall_score_new.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center font-mono font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                  {objC?.overall_score_new.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40">
                    {Math.max(objA?.overall_score_new || 0, objB?.overall_score_new || 0, objC?.overall_score_new || 0) === objA?.overall_score_new
                      ? objA?.name
                      : Math.max(objA?.overall_score_new || 0, objB?.overall_score_new || 0, objC?.overall_score_new || 0) === objB?.overall_score_new
                      ? objB?.name
                      : objC?.name}
                  </span>
                </td>
              </tr>

              {/* 9 Indicator Rows */}
              {INDICATORS.map((ind) => {
                const valA = (objA[ind.key as keyof University] as number) || 0;
                const valB = (objB[ind.key as keyof University] as number) || 0;
                const valC = (objC[ind.key as keyof University] as number) || 0;
                const maxVal = Math.max(valA, valB, valC);

                return (
                  <tr key={ind.key} className="custom-table-row transition-colors">
                    <td className="py-3 px-4 font-bold text-main">{ind.label}</td>
                    <td className={`py-3 px-4 text-center font-mono ${valA === maxVal ? "font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 rounded" : "text-sub"}`}>
                      {valA.toFixed(1)}
                    </td>
                    <td className={`py-3 px-4 text-center font-mono ${valB === maxVal ? "font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded" : "text-sub"}`}>
                      {valB.toFixed(1)}
                    </td>
                    <td className={`py-3 px-4 text-center font-mono ${valC === maxVal ? "font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded" : "text-sub"}`}>
                      {valC.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-xs">
                      {valA === maxVal ? objA?.name : valB === maxVal ? objB?.name : objC?.name}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Dumbbell Chart Component */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="pb-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-extrabold text-main text-base">
            University A vs B vs C — Dumbbell Chart
          </h3>
          <p className="text-xs text-sub">
            Indicator alignment plot showing score gap dispersion across all 9 QS dimensions.
          </p>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 30, left: 100, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
              <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
              <YAxis
                type="category"
                dataKey="indicator"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                width={140}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl space-y-1">
                        <div className="font-bold text-gray-200">{d.indicator}</div>
                        <div className="text-indigo-400">{objA?.name}: {d.scoreA}</div>
                        <div className="text-emerald-400">{objB?.name}: {d.scoreB}</div>
                        <div className="text-amber-400">{objC?.name}: {d.scoreC}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name={objA?.name} data={dumbbellData.map((d) => ({ ...d, xScore: d.scoreA }))} fill="#6366F1" />
              <Scatter name={objB?.name} data={dumbbellData.map((d) => ({ ...d, xScore: d.scoreB }))} fill="#10B981" />
              <Scatter name={objC?.name} data={dumbbellData.map((d) => ({ ...d, xScore: d.scoreC }))} fill="#F59E0B" />
              <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "11px", fontWeight: 700 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
