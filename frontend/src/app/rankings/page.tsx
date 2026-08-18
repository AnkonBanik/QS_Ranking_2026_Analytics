"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Trophy, 
  Search, 
  Building2, 
  Globe2, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import ScoreCard from "../components/ScoreCard";

interface University {
  sl: number;
  name: string;
  country: string;
  region: string;
  size: string;
  status: string;
  status_group: string;
  overall_score_new: number;
  overall_rank_new: number;
  overall_rank_original: number;
  rank_change: number;
  score_difference: number;
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

export default function RankingsPage() {
  const [data, setData] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [selectedRegion, setSelectedRegion] = useState("ALL");
  const [selectedSize, setSelectedSize] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [tierLimit, setTierLimit] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    fetch("/data/rankings.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load rankings dataset:", err);
        setError("Failed to load rankings dataset. Please ensure JSON contracts are present in public/data/.");
        setLoading(false);
      });
  }, []);

  // Filter Options Lists
  const countries = useMemo(() => {
    const set = new Set(data.map((d) => d.country).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  const regions = useMemo(() => {
    const set = new Set(data.map((d) => d.region).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  // Filtered Dataset
  const filteredData = useMemo(() => {
    return data.filter((uni) => {
      if (searchTerm && !uni.name.toLowerCase().includes(searchTerm.toLowerCase()) && !uni.country.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedCountry !== "ALL" && uni.country !== selectedCountry) {
        return false;
      }
      if (selectedRegion !== "ALL" && uni.region !== selectedRegion) {
        return false;
      }
      if (selectedSize !== "ALL" && uni.size !== selectedSize) {
        return false;
      }
      if (selectedStatus !== "ALL" && uni.status_group !== selectedStatus) {
        return false;
      }
      if (tierLimit > 0 && uni.overall_rank_new > tierLimit) {
        return false;
      }
      return true;
    });
  }, [data, searchTerm, selectedCountry, selectedRegion, selectedSize, selectedStatus, tierLimit]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCountry("ALL");
    setSelectedRegion("ALL");
    setSelectedSize("ALL");
    setSelectedStatus("ALL");
    setTierLimit(0);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Loading rankings dataset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 glass-card rounded-2xl border border-rose-500/30 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Data Contract Missing</h2>
        <p className="text-xs text-gray-400 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              QS 2025 Dataset
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">• Dense Tie-Breaker Re-Ranking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Global University <span className="gradient-text">Rankings Dashboard</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
            Cleaned and re-scored across 9 indicators using 3-layer imputation (Group Median → KNN → Global Median) and Z-score standardization.
          </p>
        </div>

        <button
          onClick={resetFilters}
          className="self-start md:self-auto px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 transition-colors"
        >
          Reset All Filters
        </button>
      </div>

      {/* Overview Score-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          title="Total Universities"
          value={data.length.toLocaleString()}
          subtitle="Zero rows deleted"
          badge={{ text: "100% Retained", type: "success" }}
          icon={Building2}
        />
        <ScoreCard
          title="Rank #1 Institution"
          value={data[0]?.name.split("(")[0].trim() || "MIT"}
          subtitle={`Score: ${data[0]?.overall_score_new}`}
          badge={{ text: "Dense Rank #1", type: "indigo" }}
          icon={Trophy}
        />
        <ScoreCard
          title="Public vs Private"
          value="1,197 / 307"
          subtitle="Welch's t-test p = 0.005"
          badge={{ text: "Sig. Difference", type: "success" }}
          icon={Globe2}
        />
        <ScoreCard
          title="Imputation Rate"
          value="1.22%"
          subtitle="165 cells filled across 3 layers"
          badge={{ text: "98.78% Observed", type: "indigo" }}
          icon={CheckCircle2}
        />
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by university name or country..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-slate-900/90 border border-gray-300 dark:border-gray-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Country Dropdown */}
          <div>
            <select
              value={selectedCountry}
              onChange={(e) => { setSelectedCountry(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-slate-900/90 border border-gray-300 dark:border-gray-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="ALL">All Countries ({countries.length})</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Region Dropdown */}
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => { setSelectedRegion(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-slate-900/90 border border-gray-300 dark:border-gray-700/80 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="ALL">All Regions ({regions.length})</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-200 dark:border-gray-800/80 text-xs">
          {/* Rank Tier Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Rank Tier:</span>
            {[
              { label: "All", value: 0 },
              { label: "Top 50", value: 50 },
              { label: "Top 100", value: 100 },
              { label: "Top 500", value: 500 },
              { label: "Top 1000", value: 1000 },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => { setTierLimit(t.value); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  tierLimit === t.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Size Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Size:</span>
            {["ALL", "S", "M", "L", "XL"].map((sz) => (
              <button
                key={sz}
                onClick={() => { setSelectedSize(sz); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedSize === sz
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Status:</span>
            {["ALL", "Public", "Private"].map((st) => (
              <button
                key={st}
                onClick={() => { setSelectedStatus(st); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedStatus === st
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Rankings Data Table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-gray-300">
            <thead className="bg-gray-100 dark:bg-slate-900/90 text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-4 text-center">Rank</th>
                <th className="py-3.5 px-4">University</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Size / Status</th>
                <th className="py-3.5 px-4 text-right">Re-Rank Score</th>
                <th className="py-3.5 px-4 text-center">Rank Shift</th>
                <th className="py-3.5 px-4 text-center">AR</th>
                <th className="py-3.5 px-4 text-center">ER</th>
                <th className="py-3.5 px-4 text-center">FSR</th>
                <th className="py-3.5 px-4 text-center">CPF</th>
                <th className="py-3.5 px-4 text-center">SUS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800/60">
              {paginatedData.map((uni) => {
                const isTop10 = uni.overall_rank_new <= 10;
                return (
                  <tr
                    key={uni.sl}
                    className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isTop10 ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
                    }`}
                  >
                    {/* Rank Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold ${
                          uni.overall_rank_new === 1
                            ? "bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/30"
                            : uni.overall_rank_new === 2
                            ? "bg-slate-200 dark:bg-slate-300/20 text-slate-700 dark:text-slate-200 border border-slate-300/30"
                            : uni.overall_rank_new === 3
                            ? "bg-amber-700/20 text-amber-700 dark:text-amber-500 border border-amber-700/30"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {uni.overall_rank_new}
                      </span>
                    </td>

                    {/* University Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {uni.name}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-gray-200">{uni.country}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">{uni.region}</div>
                    </td>

                    {/* Size / Status */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono text-[10px]">
                          {uni.size}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            uni.status_group === "Public"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          {uni.status_group}
                        </span>
                      </div>
                    </td>

                    {/* Score */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {uni.overall_score_new.toFixed(2)}
                      </div>
                    </td>

                    {/* Rank Shift */}
                    <td className="py-3.5 px-4 text-center">
                      {uni.rank_change > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          +{uni.rank_change}
                        </span>
                      ) : uni.rank_change < 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          {uni.rank_change}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-mono text-[10px]">=</span>
                      )}
                    </td>

                    {/* Scores excerpt */}
                    <td className="py-3.5 px-4 text-center font-mono text-gray-600 dark:text-gray-400">{uni.ar_score_imputed.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-gray-600 dark:text-gray-400">{uni.er_score_imputed.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-gray-600 dark:text-gray-400">{uni.fsr_score_imputed.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-gray-600 dark:text-gray-400">{uni.cpf_score_imputed.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-center font-mono text-gray-600 dark:text-gray-400">{uni.sus_score_imputed.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-gray-50 dark:bg-slate-900/90 px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{filteredData.length}</span> universities
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 dark:text-gray-200">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
