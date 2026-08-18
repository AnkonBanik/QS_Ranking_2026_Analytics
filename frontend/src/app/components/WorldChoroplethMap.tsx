"use client";

import { useState, useEffect, useMemo } from "react";
import { Globe2, Building2, Trophy, BarChart3, Search } from "lucide-react";

interface MapCountry {
  country: string;
  iso3: string;
  count: number;
  avg_score: number;
  median_score: number;
  top_university: string;
}

export default function WorldChoroplethMap() {
  const [mapData, setMapData] = useState<MapCountry[]>([]);
  const [metric, setMetric] = useState<"count" | "avg_score">("count");
  const [activeCountry, setActiveCountry] = useState<MapCountry | null>(null);
  const [countrySearch, setCountrySearch] = useState("");

  useEffect(() => {
    fetch("/data/map_data.json")
      .then((res) => res.json())
      .then((json) => {
        setMapData(json);
        if (json.length > 0) setActiveCountry(json[0]);
      })
      .catch((err) => console.error("Failed to load map data:", err));
  }, []);

  // Filter countries by search term
  const filteredMapData = useMemo(() => {
    if (!countrySearch.trim()) return mapData;
    const term = countrySearch.toLowerCase().trim();
    return mapData.filter(
      (c) => c.country.toLowerCase().includes(term) || c.iso3.toLowerCase().includes(term)
    );
  }, [mapData, countrySearch]);

  const maxCount = Math.max(...mapData.map((d) => d.count), 1);
  const maxScore = Math.max(...mapData.map((d) => d.avg_score), 1);

  const getHeatColor = (country: MapCountry) => {
    const val = metric === "count" ? country.count / maxCount : country.avg_score / maxScore;
    if (val > 0.75) return "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-400";
    if (val > 0.4) return "bg-indigo-500/80 dark:bg-indigo-600/80 text-white border-indigo-400/80";
    if (val > 0.2) return "bg-indigo-400/60 dark:bg-indigo-700/60 text-slate-900 dark:text-white border-indigo-300/60";
    return "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-gray-200 border-gray-200 dark:border-gray-700";
  };

  return (
    <div className="glass-card p-6 rounded-2xl space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-main text-lg tracking-tight">
              Global University Choropleth Map
            </h3>
            <p className="text-xs text-sub">
              Geographical distribution across 106 countries and 5 regions.
            </p>
          </div>
        </div>

        {/* Metric Toggle Buttons */}
        <div className="flex items-center space-x-2 text-xs font-bold">
          <button
            onClick={() => setMetric("count")}
            className={`px-3 py-1.5 rounded-xl transition-all border ${
              metric === "count"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "custom-pill border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-slate-800"
            }`}
          >
            University Density
          </button>
          <button
            onClick={() => setMetric("avg_score")}
            className={`px-3 py-1.5 rounded-xl transition-all border ${
              metric === "avg_score"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "custom-pill border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-slate-800"
            }`}
          >
            Average Overall Score
          </button>
        </div>
      </div>

      {/* Main Grid View with Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Country Search & Grid (106 Countries) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-sub px-1">
            <span>Select Country ({filteredMapData.length} Shown / 106 Total)</span>

            {/* Map Country Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-sub absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search map country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full custom-input rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredMapData.map((item) => (
              <button
                key={item.country}
                onClick={() => setActiveCountry(item)}
                className={`p-2.5 rounded-xl text-left transition-all border ${getHeatColor(item)} ${
                  activeCountry?.country === item.country ? "ring-2 ring-indigo-400 font-extrabold scale-102 shadow-md" : "opacity-90 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="truncate pr-1">{item.country}</span>
                  <span className="text-[10px] font-mono opacity-80">{item.iso3}</span>
                </div>
                <div className="text-[11px] mt-1 font-mono font-semibold opacity-90">
                  {metric === "count" ? `${item.count} Unis` : `Score: ${item.avg_score}`}
                </div>
              </button>
            ))}
            {filteredMapData.length === 0 && (
              <div className="col-span-full py-8 text-center text-xs text-sub">
                No countries matched "{countrySearch}"
              </div>
            )}
          </div>
        </div>

        {/* Selected Country Inspector Card */}
        {activeCountry && (
          <div className="glass-card p-5 rounded-xl border border-indigo-500/30 space-y-4 bg-indigo-500/5">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-sub uppercase tracking-wider">Country Insight</span>
                <h4 className="font-extrabold text-main text-base">{activeCountry.country}</h4>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold">
                {activeCountry.iso3}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg custom-pill">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-sub">Total Universities</span>
                </div>
                <span className="font-extrabold text-main font-mono">{activeCountry.count}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg custom-pill">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-sub">Average Overall Score</span>
                </div>
                <span className="font-extrabold text-main font-mono">{activeCountry.avg_score}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg custom-pill">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-sub">Top Ranked Institution</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 font-bold text-xs">
                {activeCountry.top_university}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
