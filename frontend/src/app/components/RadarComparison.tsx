"use client";

import { useState, useMemo } from "react";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface University {
  country: string;
  region: string;
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

interface RadarComparisonProps {
  data: University[];
}

const INDICATOR_KEYS = [
  { key: "ar_score_imputed", name: "Academic Rep." },
  { key: "er_score_imputed", name: "Employer Rep." },
  { key: "fsr_score_imputed", name: "Faculty Student" },
  { key: "cpf_score_imputed", name: "Citations/Faculty" },
  { key: "ifr_score_imputed", name: "Int'l Faculty" },
  { key: "isr_score_imputed", name: "Int'l Students" },
  { key: "irn_score_imputed", name: "Research Network" },
  { key: "eo_score_imputed", name: "Employment" },
  { key: "sus_score_imputed", name: "Sustainability" },
];

export default function RadarComparison({ data }: RadarComparisonProps) {
  // Available Countries
  const countries = useMemo(() => {
    const set = new Set(data.map((d) => d.country).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const [countryA, setCountryA] = useState("United States of America");
  const [countryB, setCountryB] = useState("United Kingdom");
  const [countryC, setCountryC] = useState("Germany");

  // Compute Averages for Country A, Country B, and Country C
  const radarData = useMemo(() => {
    const listA = data.filter((d) => d.country === countryA);
    const listB = data.filter((d) => d.country === countryB);
    const listC = data.filter((d) => d.country === countryC);

    const calcAvg = (list: University[], key: string) => {
      if (list.length === 0) return 0;
      const sum = list.reduce((acc, curr) => acc + (curr[key as keyof University] as number || 0), 0);
      return Number((sum / list.length).toFixed(1));
    };

    return INDICATOR_KEYS.map((ind) => ({
      indicator: ind.name,
      [countryA]: calcAvg(listA, ind.key),
      [countryB]: calcAvg(listB, ind.key),
      [countryC]: calcAvg(listC, ind.key),
    }));
  }, [data, countryA, countryB, countryC]);

  return (
    <div className="glass-card p-6 rounded-2xl space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="font-extrabold text-main text-lg tracking-tight">
            Multi-Indicator 3-Country Radar Comparison
          </h3>
          <p className="text-xs text-sub mt-0.5">
            Side-by-side performance profiling across all 9 QS dimensions for 3 selected nations.
          </p>
        </div>

        {/* 3 Country Selectors */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-sub mb-1">Country A (Indigo)</label>
            <select
              value={countryA}
              onChange={(e) => setCountryA(e.target.value)}
              className="custom-input rounded-xl px-3 py-1.5 font-bold focus:outline-none"
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <span className="font-extrabold text-sub pt-4">VS</span>

          <div>
            <label className="block text-[10px] font-bold text-sub mb-1">Country B (Emerald)</label>
            <select
              value={countryB}
              onChange={(e) => setCountryB(e.target.value)}
              className="custom-input rounded-xl px-3 py-1.5 font-bold focus:outline-none"
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <span className="font-extrabold text-sub pt-4">VS</span>

          <div>
            <label className="block text-[10px] font-bold text-sub mb-1">Country C (Amber)</label>
            <select
              value={countryC}
              onChange={(e) => setCountryC(e.target.value)}
              className="custom-input rounded-xl px-3 py-1.5 font-bold focus:outline-none"
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Radar Chart Canvas */}
      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#475569" strokeDasharray="3 3" opacity={0.4} />
            <PolarAngleAxis dataKey="indicator" stroke="#94A3B8" tick={{ fontSize: 11, fontWeight: 700 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 10 }} />
            <Radar
              name={countryA}
              dataKey={countryA}
              stroke="#6366F1"
              fill="#6366F1"
              fillOpacity={0.3}
            />
            <Radar
              name={countryB}
              dataKey={countryB}
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
            />
            <Radar
              name={countryC}
              dataKey={countryC}
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.3}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                borderColor: "#334155",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#FFFFFF",
                fontWeight: 700
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px", fontWeight: 700 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
