import Link from "next/link";
import { BookOpen, CheckCircle, ExternalLink, ShieldCheck, Code, Award, Mail } from "lucide-react";

export default function MethodologyPage() {
  const rules = [
    { title: "Missing-Value Taxonomy", desc: "Explicit distinction between structural missingness (unranked/new) and random data gaps." },
    { title: "3-Layer Cascade Imputation", desc: "Layer 1: Group Median (n≥3) → Layer 2: KNN (k=5) → Layer 3: Global Median." },
    { title: "Per-Cell Imputation Tracking", desc: "Every imputed cell tagged with method flag (observed, group_median, knn, global_median)." },
    { title: "Distribution Standardization", desc: "Z-score normalization and 0–100 rescaling before applying QS 2026 weights." },
    { title: "Official QS 2026 Weights", desc: "AR 30%, ER 15%, FSR 10%, CPF 20%, IFR 5%, ISR 5%, IRN 5%, EO 5%, SUS 5%." },
    { title: "Status Group Standardization", desc: "Categorized into Public vs. Private status groups." },
    { title: "10-Level Tie-Breaker Dense Rank", desc: "Deterministic tie-breaking: overall score → 9 indicator scores → university name." },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200 dark:border-gray-800 text-center sm:text-left">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
          Methodology & Technical Architecture
        </span>
        <h1 className="text-3xl font-extrabold text-main tracking-tight mt-2">
          The 7 Golden Rules of <span className="gradient-text">QS Re-Ranking</span>
        </h1>
        <p className="text-sm text-sub mt-1 max-w-2xl">
          An open, reproducible data engineering standard for university performance benchmarking.
        </p>
      </div>

      {/* Case Study Narrative */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="font-extrabold text-main text-xl">Executive Summary</h3>
        <p className="text-sm text-sub leading-relaxed">
          Public university rankings often contain non-standard missing values, arbitrary ties, and unstandardized indicator weights.
          This project implements a rigorous end-to-end Python data pipeline that parses, imputes, standardizes, and re-ranks the 
          <strong> QS World University Rankings 2026</strong> dataset across 1,504 institutions and 9 core indicators.
        </p>
      </div>

      {/* 7 Golden Rules Grid */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-main text-lg">The 7 Locked Data Engineering Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((r, i) => (
            <div key={i} className="glass-card p-5 rounded-xl flex items-start space-x-4">
              <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-mono font-extrabold text-sm">
                #{i + 1}
              </div>
              <div>
                <h4 className="font-bold text-main text-sm">{r.title}</h4>
                <p className="text-xs text-sub mt-1 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Author & Contact Card (No Designations) */}
      <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-extrabold text-main text-base">Built by Ankon Banik</h4>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mail Icon Button Only */}
          <a
            href="mailto:ankonbnk@gmail.com"
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all text-xs font-bold flex items-center justify-center"
            title="Contact via Email (ankonbnk@gmail.com)"
            aria-label="Send email to Ankon Banik"
          >
            <Mail className="w-4 h-4" />
          </a>

          {/* GitHub Profile */}
          <a
            href="https://github.com/AnkonBanik"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl custom-pill text-main hover:text-indigo-600 dark:hover:text-indigo-300 border border-gray-300 dark:border-gray-700 transition-colors text-xs font-bold"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub Profile</span>
          </a>

          {/* LinkedIn Profile */}
          <a
            href="https://www.linkedin.com/in/ankonbanik"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all text-xs font-bold"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            <span>LinkedIn Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
}
