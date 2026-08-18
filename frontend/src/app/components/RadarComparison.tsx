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
import { Search } from "lucide-react";

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
  // Unique list of countries
  const countries = useMemo(() => {
    const set = new Set(data.map((d) => d.country).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  // Selected Country States
  const [countryA, setCountryA] = useState("United States of America");
  const [countryB, setCountryB] = useState("United Kingdom");
  const [countryC, setCountryC] = useState("Germany");

  // Search Input States
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [searchC, setSearchC] = useState("");

  const filteredA = useMemo(() => countries.filter((c) => c.toLowerCase().includes(searchA.toLowerCase())), [countries, searchA]);
  const filteredB = useMemo(() => countries.filter((c) => c.toLowerCase().includes(searchB.toLowerCase())), [countries, searchB]);
  const filteredC = useMemo(() => countries.filter((c) => c.toLowerCase().includes(searchC.toLowerCase())), [countries, searchC]);

  // Radar Data calculation
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
            Search or select 3 countries to analyze side-by-side performance across all 9 QS dimensions.
          </p>
        </div>

        {/* Searchable Country Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Country A */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              Country A (Indigo): <span className="font-extrabold">{countryA}</span>
            </label>
            <div className="relative">
              <Search className="w-3 h-3 text-sub absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search country A..."
                value={searchA}
                onChange={(e) => setSearchA(e.target.value)}
                className="w-full custom-input rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold focus:outline-none"
              />
            </div>
            <select
              value={countryA}
              onChange={(e) => { setCountryA(e.target.value); setSearchA(""); }}
              className="w-full custom-input rounded-xl px-2 py-1 font-bold text-xs focus:outline-none"
            >
              {filteredA.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Country B */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Country B (Emerald): <span className="font-extrabold">{countryB}</span>
            </label>
            <div className="relative">
              <Search className="w-3 h-3 text-sub absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search country B..."
                value={searchB}
                onChange={(e) => setSearchB(e.target.value)}
                className="w-full custom-input rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold focus:outline-none"
              />
            </div>
            <select
              value={countryB}
              onChange={(e) => { setCountryB(e.target.value); setSearchB(""); }}
              className="w-full custom-input rounded-xl px-2 py-1 font-bold text-xs focus:outline-none"
            >
              {filteredB.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Country C */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-amber-600 dark:text-amber-400">
              Country C (Amber): <span className="font-extrabold">{countryC}</span>
            </label>
            <div className="relative">
              <Search className="w-3 h-3 text-sub absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search country C..."
                value={searchC}
                onChange={(e) => setSearchC(e.target.value)}
                className="w-full custom-input rounded-xl pl-8 pr-2 py-1.5 text-xs font-semibold focus:outline-none"
              />
            </div>
            <select
              value={countryC}
              onChange={(e) => { setCountryC(e.target.value); setSearchC(""); }}
              className="w-full custom-input rounded-xl px-2 py-1 font-bold text-xs focus:outline-none"
            >
              {filteredC.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Radar Canvas */}
      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#475569" strokeDasharray="3 3" opacity={0.4} />
            <PolarAngleAxis dataKey="indicator" stroke="#94A3B8" tick={{ fontSize: 11, fontWeight: 700 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 10 }} />
            <Radar name={countryA} dataKey={countryA} stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} />
            <Radar name={countryB} dataKey={countryB} stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
            <Radar name={countryC} dataKey={countryC} stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
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
