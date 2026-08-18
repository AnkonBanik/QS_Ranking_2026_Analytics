"use client";

import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";

interface BoxMetric {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  mean: number;
  std: number;
}

interface DistributionData {
  indicator_boxes: Record<string, BoxMetric>;
  by_status: Record<string, Record<string, BoxMetric>>;
  by_size: Record<string, Record<string, BoxMetric>>;
  overall_score_histogram: Array<{ bin: string; count: number }>;
}

export default function BoxPlotChart() {
  const [distData, setDistData] = useState<DistributionData | null>(null);
  const [activeTab, setActiveTab] = useState<"status" | "size">("status");

  useEffect(() => {
    fetch("/data/indicator_distributions.json")
      .then((res) => res.json())
      .then((json) => setDistData(json))
      .catch((err) => console.error("Failed to load indicator distributions:", err));
  }, []);

  if (!distData) return null;

  const indicators = Object.keys(distData.indicator_boxes);

  return (
    <div className="glass-card p-6 rounded-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h3 className="font-extrabold text-main text-lg tracking-tight">
            Indicator Distribution Box Plots (IQR & Dispersion)
          </h3>
          <p className="text-xs text-sub mt-0.5">
            Statistical distribution breakdown (Min, Q1, Median, Q3, Max) across status and institution sizes.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("status")}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              activeTab === "status"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "custom-pill border-gray-300 dark:border-gray-700"
            }`}
          >
            Public vs Private Box Plot
          </button>
          <button
            onClick={() => setActiveTab("size")}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              activeTab === "size"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "custom-pill border-gray-300 dark:border-gray-700"
            }`}
          >
            Institution Size (S, M, L, XL)
          </button>
        </div>
      </div>

      {/* Box Plots Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indicators.map((ind) => {
          const groupData = activeTab === "status" ? distData.by_status[ind] : distData.by_size[ind];
          if (!groupData) return null;

          return (
            <div key={ind} className="p-4 rounded-xl custom-pill border border-gray-200 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-main text-xs">{ind}</span>
                <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
              </div>

              {/* Individual Category Box Visualizers */}
              <div className="space-y-2 text-[11px]">
                {Object.entries(groupData).map(([cat, box]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between font-bold text-sub">
                      <span>{cat}</span>
                      <span className="font-mono text-indigo-500">Med: {box.median}</span>
                    </div>

                    {/* SVG Box Plot Line */}
                    <div className="relative h-5 w-full bg-gray-200 dark:bg-slate-800 rounded-md overflow-hidden flex items-center px-1">
                      {/* Whisker Line (Min to Max) */}
                      <div
                        className="absolute h-0.5 bg-gray-400 dark:bg-gray-600"
                        style={{
                          left: `${box.min}%`,
                          width: `${Math.max(box.max - box.min, 2)}%`
                        }}
                      />

                      {/* Box (Q1 to Q3) */}
                      <div
                        className="absolute h-3.5 bg-indigo-500/40 border border-indigo-500 rounded-xs"
                        style={{
                          left: `${box.q1}%`,
                          width: `${Math.max(box.q3 - box.q1, 3)}%`
                        }}
                      />

                      {/* Median Bar */}
                      <div
                        className="absolute h-4 w-1 bg-emerald-500 font-bold"
                        style={{ left: `${box.median}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[9px] font-mono text-muted-custom">
                      <span>Min: {box.min}</span>
                      <span>Q1: {box.q1}</span>
                      <span>Q3: {box.q3}</span>
                      <span>Max: {box.max}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
