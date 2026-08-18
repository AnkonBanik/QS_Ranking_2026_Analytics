"use client";

import { useState, useMemo } from "react";
import { Scale, Search, Trophy, Award } from "lucide-react";

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

  // Selected University States
  const [uniA, setUniA] = useState("Massachusetts Institute of Technology (MIT)");
  const [uniB, setUniB] = useState("Imperial College London");
  const [uniC, setUniC] = useState("Stanford University");

  // Search Input States
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [searchC, setSearchC] = useState("");

  const filteredA = useMemo(() => uniList.filter((u) => u.name.toLowerCase().includes(searchA.toLowerCase())), [uniList, searchA]);
  const filteredB = useMemo(() => uniList.filter((u) => u.name.toLowerCase().includes(searchB.toLowerCase())), [uniList, searchB]);
  const filteredC = useMemo(() => uniList.filter((u) => u.name.toLowerCase().includes(searchC.toLowerCase())), [uniList, searchC]);

  const objA = useMemo(() => data.find((u) => u.name === uniA) || data[0], [data, uniA]);
  const objB = useMemo(() => data.find((u) => u.name === uniB) || data[1], [data, uniB]);
  const objC = useMemo(() => data.find((u) => u.name === uniC) || data[2], [data, uniC]);

  // Dumbbell Chart Row Calculation
  const dumbbellRows = useMemo(() => {
    if (!objA || !objB || !objC) return [];

    return INDICATORS.map((ind) => {
      const valA = Number(((objA[ind.key as keyof University] as number) || 0).toFixed(1));
      const valB = Number(((objB[ind.key as keyof University] as number) || 0).toFixed(1));
      const valC = Number(((objC[ind.key as keyof University] as number) || 0).toFixed(1));

      const minVal = Math.min(valA, valB, valC);
      const maxVal = Math.max(valA, valB, valC);

      return {
        label: ind.label,
        valA,
        valB,
        valC,
        minVal,
        maxVal,
      };
    });
  }, [objA, objB, objC]);

  return (
    <div className="space-y-6">
      {/* Search & Selector Banner */}
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
                Type institution names to search, filter, and compare across all 9 QS dimensions.
              </p>
            </div>
          </div>

          {/* Searchable Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Uni A */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                Uni A (Indigo): <span className="font-extrabold truncate">{objA?.name}</span>
              </label>
              <div className="relative">
                <Search className="w-3 h-3 text-sub absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Uni A..."
                  value={searchA}
                  onChange={(e) => setSearchA(e.target.value)}
                  className="w-full custom-input rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>
              <select
                value={uniA}
                onChange={(e) => { setUniA(e.target.value); setSearchA(""); }}
                className="w-full custom-input rounded-xl px-2 py-1 font-bold text-xs focus:outline-none"
              >
                {filteredA.map((u) => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Uni B */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Uni B (Emerald): <span className="font-extrabold truncate">{objB?.name}</span>
              </label>
              <div className="relative">
                <Search className="w-3 h-3 text-sub absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Uni B..."
                  value={searchB}
                  onChange={(e) => setSearchB(e.target.value)}
                  className="w-full custom-input rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>
              <select
                value={uniB}
                onChange={(e) => { setUniB(e.target.value); setSearchB(""); }}
                className="w-full custom-input rounded-xl px-2 py-1 font-bold text-xs focus:outline-none"
              >
                {filteredB.map((u) => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Uni C */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-amber-600 dark:text-amber-400">
                Uni C (Amber): <span className="font-extrabold truncate">{objC?.name}</span>
              </label>
              <div className="relative">
                <Search className="w-3 h-3 text-sub absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search Uni C..."
                  value={searchC}
                  onChange={(e) => setSearchC(e.target.value)}
                  className="w-full custom-input rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold focus:outline-none"
                />
              </div>
              <select
                value={uniC}
                onChange={(e) => { setUniC(e.target.value); setSearchC(""); }}
                className="w-full custom-input rounded-xl px-2 py-1 font-bold text-xs focus:outline-none"
              >
                {filteredC.map((u) => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
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

      {/* 2. Custom SVG Dumbbell Chart Component */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="font-extrabold text-main text-base">
              University A vs B vs C — Dumbbell Chart
            </h3>
            <p className="text-xs text-sub">
              Score alignment dumbbell plot displaying exact indicator gaps between selected institutions.
            </p>
          </div>
          
          <div className="flex items-center space-x-3 text-xs font-bold">
            <span className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
              <span>{objA?.name}</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>{objB?.name}</span>
            </span>
            <span className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>{objC?.name}</span>
            </span>
          </div>
        </div>

        {/* Interactive Horizontal Dumbbell Rows */}
        <div className="space-y-4 pt-2">
          {dumbbellRows.map((row) => (
            <div key={row.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-main">
                <span>{row.label}</span>
                <div className="flex items-center space-x-3 font-mono text-[11px]">
                  <span className="text-indigo-600 dark:text-indigo-400">A: {row.valA}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">B: {row.valB}</span>
                  <span className="text-amber-600 dark:text-amber-400">C: {row.valC}</span>
                </div>
              </div>

              {/* Bar track & Dumbbell Dots */}
              <div className="relative h-6 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center px-2">
                {/* Connecting Line between Min and Max */}
                <div
                  className="absolute h-1.5 bg-indigo-500/50 rounded-full"
                  style={{
                    left: `${row.minVal}%`,
                    width: `${Math.max(row.maxVal - row.minVal, 1)}%`,
                  }}
                />

                {/* Dot A (Indigo) */}
                <div
                  className="absolute w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-md transition-all z-10"
                  style={{ left: `calc(${row.valA}% - 8px)` }}
                  title={`${objA?.name}: ${row.valA}`}
                />

                {/* Dot B (Emerald) */}
                <div
                  className="absolute w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md transition-all z-10"
                  style={{ left: `calc(${row.valB}% - 8px)` }}
                  title={`${objB?.name}: ${row.valB}`}
                />

                {/* Dot C (Amber) */}
                <div
                  className="absolute w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-md transition-all z-10"
                  style={{ left: `calc(${row.valC}% - 8px)` }}
                  title={`${objC?.name}: ${row.valC}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
