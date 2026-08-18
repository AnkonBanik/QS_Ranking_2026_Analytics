"use client";

import { useMemo } from "react";
import { Globe2, MapPin } from "lucide-react";

interface University {
  country: string;
  region: string;
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

interface CountryStat {
  country: string;
  university_count: number;
  mean_overall_score: number;
  median_overall_score: number;
  top_university: string;
  top_university_score: number;
}

interface GeographicPerformanceProps {
  countries: CountryStat[];
  rankings: University[];
}

const INDICATORS = [
  { key: "ar_score_imputed", name: "AR (30%)" },
  { key: "er_score_imputed", name: "ER (15%)" },
  { key: "fsr_score_imputed", name: "FSR (10%)" },
  { key: "cpf_score_imputed", name: "CPF (20%)" },
  { key: "ifr_score_imputed", name: "IFR (5%)" },
  { key: "isr_score_imputed", name: "ISR (5%)" },
  { key: "irn_score_imputed", name: "IRN (5%)" },
  { key: "eo_score_imputed", name: "EO (5%)" },
  { key: "sus_score_imputed", name: "SUS (5%)" },
];

export default function GeographicPerformance({ countries, rankings }: GeographicPerformanceProps) {
  // Top 25 countries sorted by mean score
  const top25Countries = useMemo(() => {
    return [...countries]
      .sort((a, b) => b.mean_overall_score - a.mean_overall_score)
      .slice(0, 25);
  }, [countries]);

  // Regional indicator averages
  const regionalMatrix = useMemo(() => {
    if (rankings.length === 0) return [];

    const map: Record<string, University[]> = {};
    rankings.forEach((u) => {
      if (!u.region) return;
      if (!map[u.region]) map[u.region] = [];
      map[u.region].push(u);
    });

    return Object.entries(map).map(([region, list]) => {
      const calcAvg = (key: string) => {
        const sum = list.reduce((a, b) => a + ((b[key as keyof University] as number) || 0), 0);
        return Number((sum / list.length).toFixed(1));
      };

      const overallMean = Number(
        (list.reduce((a, b) => a + b.overall_score_new, 0) / list.length).toFixed(1)
      );

      return {
        region,
        count: list.length,
        overallMean,
        ar: calcAvg("ar_score_imputed"),
        er: calcAvg("er_score_imputed"),
        fsr: calcAvg("fsr_score_imputed"),
        cpf: calcAvg("cpf_score_imputed"),
        ifr: calcAvg("ifr_score_imputed"),
        isr: calcAvg("isr_score_imputed"),
        irn: calcAvg("irn_score_imputed"),
        eo: calcAvg("eo_score_imputed"),
        sus: calcAvg("sus_score_imputed"),
      };
    }).sort((a, b) => b.overallMean - a.overallMean);
  }, [rankings]);

  // Intensity color helpers
  const getScoreColor = (val: number) => {
    if (val >= 60) return "bg-emerald-600 dark:bg-emerald-500 text-white font-extrabold";
    if (val >= 45) return "bg-teal-600 dark:bg-teal-500 text-white font-bold";
    if (val >= 35) return "bg-indigo-600 dark:bg-indigo-500 text-white font-bold";
    if (val >= 25) return "bg-amber-500/80 dark:bg-amber-600/80 text-slate-900 dark:text-white font-semibold";
    return "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-gray-300 font-medium";
  };

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
          Part 3 — Geographic Performance Suite
        </span>
        <h2 className="text-2xl font-extrabold text-main tracking-tight mt-1">
          Geographic & Regional Performance Matrices
        </h2>
        <p className="text-xs text-sub mt-0.5">
          Country-level benchmarking and 5-region indicator heatmap matrices.
        </p>
      </div>

      {/* 1. Country Performance Matrix — Heatmap */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-main text-base">Country Performance Matrix — Heatmap</h3>
              <p className="text-xs text-sub">Mean scores, median scores, and top ranked institution per nation</p>
            </div>
          </div>

          <span className="text-xs text-indigo-600 dark:text-indigo-300 font-bold bg-indigo-500/15 px-3 py-1 rounded-full">
            Top 25 Countries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="custom-table-header uppercase tracking-wider font-extrabold">
              <tr>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4 text-center">Ranked Institutions</th>
                <th className="py-3 px-4 text-center">Mean Overall Score</th>
                <th className="py-3 px-4 text-center">Median Overall Score</th>
                <th className="py-3 px-4">Top Ranked Institution</th>
                <th className="py-3 px-4 text-center">Top Score</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {top25Countries.map((c) => (
                <tr key={c.country} className="custom-table-row transition-colors">
                  <td className="py-3 px-4 font-extrabold text-main">{c.country}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {c.university_count}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-mono ${getScoreColor(c.mean_overall_score)}`}>
                      {c.mean_overall_score}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-sub">
                    {c.median_overall_score}
                  </td>
                  <td className="py-3 px-4 font-semibold text-main text-xs">{c.top_university}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                    {c.top_university_score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Regional Performance Matrix — Heatmap */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-main text-base">Regional Performance Matrix — Heatmap</h3>
              <p className="text-xs text-sub">Average indicator scores across all 5 geographical regions</p>
            </div>
          </div>

          <span className="text-xs text-emerald-600 dark:text-emerald-300 font-bold bg-emerald-500/15 px-3 py-1 rounded-full">
            5 Regions × 9 Indicators
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="custom-table-header uppercase tracking-wider font-extrabold">
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4 text-center">Unis</th>
                <th className="py-3 px-4 text-center">Mean Score</th>
                <th className="py-3 px-3 text-center">AR</th>
                <th className="py-3 px-3 text-center">ER</th>
                <th className="py-3 px-3 text-center">FSR</th>
                <th className="py-3 px-3 text-center">CPF</th>
                <th className="py-3 px-3 text-center">IFR</th>
                <th className="py-3 px-3 text-center">ISR</th>
                <th className="py-3 px-3 text-center">IRN</th>
                <th className="py-3 px-3 text-center">EO</th>
                <th className="py-3 px-3 text-center">SUS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {regionalMatrix.map((r) => (
                <tr key={r.region} className="custom-table-row transition-colors">
                  <td className="py-3 px-4 font-extrabold text-main">{r.region}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-sub">{r.count}</td>
                  <td className="py-3 px-4 text-center font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                    {r.overallMean}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">{r.ar}</td>
                  <td className="py-3 px-3 text-center font-mono">{r.er}</td>
                  <td className="py-3 px-3 text-center font-mono">{r.fsr}</td>
                  <td className="py-3 px-3 text-center font-mono">{r.cpf}</td>
                  <td className="py-3 px-3 text-center font-mono">{r.ifr}</td>
                  <td className="py-3 px-3 text-center font-mono">{r.isr}</td>
                  <td className="py-3 px-3 text-center font-mono">{r.irn}</td>
                  <td className="py-3 px-3 text-center font-mono">{r.eo}</td>
                  <td className="py-3 px-3 text-center font-mono">{r.sus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
