"use client";

import { useMemo } from "react";
import { Grid } from "lucide-react";

interface University {
  overall_rank_new: number;
  name: string;
  country: string;
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

interface UniversityHeatmapProps {
  data: University[];
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

export default function UniversityHeatmap({ data }: UniversityHeatmapProps) {
  const top20 = useMemo(() => {
    return [...data]
      .sort((a, b) => a.overall_rank_new - b.overall_rank_new)
      .slice(0, 20);
  }, [data]);

  // Vibrant Multi-Color Intensity Helper (No monochrome blue!)
  const getCellColorClass = (val: number) => {
    if (val >= 98) return "bg-emerald-600 dark:bg-emerald-500 text-white font-extrabold shadow-sm";
    if (val >= 90) return "bg-teal-600 dark:bg-teal-500 text-white font-bold";
    if (val >= 80) return "bg-indigo-600 dark:bg-indigo-500 text-white font-bold";
    if (val >= 70) return "bg-amber-500/90 dark:bg-amber-600/90 text-slate-900 dark:text-white font-semibold";
    if (val >= 50) return "bg-rose-500/70 dark:bg-rose-600/70 text-white font-semibold";
    return "bg-slate-300 dark:bg-slate-800 text-slate-900 dark:text-gray-300 font-medium";
  };

  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-main text-lg tracking-tight">
              University Performance Heatmap (Top 20 × 9 Indicators)
            </h3>
            <p className="text-xs text-sub">
              Multi-colored intensity matrix across all 9 QS dimensions for top 20 global institutions.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-bold">
          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white">98+</span>
          <span className="px-2 py-0.5 rounded bg-teal-600 text-white">90-97</span>
          <span className="px-2 py-0.5 rounded bg-indigo-600 text-white">80-89</span>
          <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-900">70-79</span>
          <span className="px-2 py-0.5 rounded bg-rose-500 text-white">&lt;70</span>
        </div>
      </div>

      {/* Heatmap Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="custom-table-header uppercase tracking-wider font-extrabold">
              <th className="py-2.5 px-3 text-center">Rank</th>
              <th className="py-2.5 px-3">University</th>
              {INDICATORS.map((ind) => (
                <th key={ind.key} className="py-2.5 px-2 text-center text-[11px]">
                  {ind.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {top20.map((uni) => (
              <tr key={uni.overall_rank_new} className="custom-table-row transition-colors">
                <td className="py-2 px-3 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md font-extrabold text-xs bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
                    #{uni.overall_rank_new}
                  </span>
                </td>

                <td className="py-2 px-3 font-bold text-main">
                  <div className="truncate max-w-[180px]">{uni.name}</div>
                  <div className="text-[10px] text-sub font-normal">{uni.country}</div>
                </td>

                {INDICATORS.map((ind) => {
                  const val = (uni[ind.key as keyof University] as number) || 0;
                  return (
                    <td key={ind.key} className="p-1 text-center">
                      <div
                        className={`py-1.5 px-1 rounded-md text-[11px] font-mono transition-all ${getCellColorClass(val)}`}
                        title={`${uni.name} - ${ind.name}: ${val.toFixed(1)}`}
                      >
                        {val.toFixed(1)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
