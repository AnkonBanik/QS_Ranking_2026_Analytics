import Link from "next/link";
import { BookOpen, CheckCircle, ExternalLink, ShieldCheck, Code, Award, Mail } from "lucide-react";

export default function MethodologyPage() {
  const rules = [
    {
      title: "1. Missing-Value Taxonomy",
      desc: "Distinguishes between NaN, dashes ('-'), empty strings, and regex pattern ranks (701+, 43=). Pattern strings are parsed to numeric ranks in RANK columns and coerced to NaN in SCORE columns.",
    },
    {
      title: "2. Three-Layer Imputation Cascade",
      desc: "Preserves all 1,504 records via Group Median (country+size+research, n≥3) → KNN (k=5, distance-weighted) → Global Median fallback.",
    },
    {
      title: "3. Country Excluded from KNN Distance Features",
      desc: "Country label encoding into arbitrary integers induces artificial numerical proximity. Signal is retained in Layer 1; excluded from KNN distance metrics.",
    },
    {
      title: "4. Z-Score Normalization & Min-Max Rescaling",
      desc: "Scores are Z-scored and rescaled to 0–100 before applying weights to prevent high-variance indicators (e.g. CPF) from dominating the overall score.",
    },
    {
      title: "5. Official QS 2025 Weighting",
      desc: "AR (30%), ER (15%), FSR (10%), CPF (20%), IFR (5%), ISR (5%), IRN (5%), EO (5%), SUS (5%). Total sum = 100%.",
    },
    {
      title: "6. Status Group Binary Mapping",
      desc: "Combines 'Private for Profit' and 'Private not for Profit' into 'Private' to enable valid two-sample Welch's t-testing against 'Public' institutions.",
    },
    {
      title: "7. Deterministic 10-Level Tie-Breaker Dense Rank",
      desc: "Ranks sorted by overall_score → AR → ER → FSR → CPF → IFR → ISR → IRN → EO → SUS → name. Guarantees deterministic, reproducible ranking with no gaps.",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-gray-800">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Methodology & Case Study
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
          Technical Methodology & <span className="gradient-text">Project Case Study</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-2xl">
          Architectural decisions, bug fixes, and statistical foundations governing the QS Rankings pipeline.
        </p>
      </div>

      {/* Case Study Narrative Block */}
      <div className="glass-card p-8 rounded-2xl border border-indigo-500/30 space-y-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Case Study: Fixing Real-World Ranking Data Bugs</h2>
            <p className="text-xs text-gray-400">Ankon Banik • Senior Data Engineer & Frontend Lead</p>
          </div>
        </div>

        <div className="text-sm text-gray-300 space-y-3 leading-relaxed border-t border-gray-800/80 pt-4">
          <p>
            Public higher-education ranking datasets suffer from hidden missingness, category mismatches, and unequal feature distributions. During initial exploratory analysis, three critical bugs in naive approaches were identified and resolved:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs text-gray-300 pl-2">
            <li>
              <strong className="text-white">The KNN Country-Encoding Bug:</strong> Label-encoding country into arbitrary integers (e.g. Bangladesh=12, France=13) caused Euclidean distance to treat unrelated countries as neighbors. This was fixed by dropping country from KNN distance features and relying on Layer 1 (Group Median) for location signal.
            </li>
            <li>
              <strong className="text-white">Silent t-test Failure:</strong> A naive t-test for literal <code className="text-indigo-400">'Private'</code> category failed silently because the real dataset contained <code className="text-indigo-400">'Private not for Profit'</code> and <code className="text-indigo-400">'Private for Profit'</code>. Fixed via explicit mapping to <code className="text-indigo-400">status_group</code>.
            </li>
            <li>
              <strong className="text-white">Variance Dominance:</strong> Raw score variance differed across indicators (e.g. CPF vs FSR). Standardizing to Z-scores before applying QS 2025 weights restored mathematical balance.
            </li>
          </ul>
        </div>
      </div>

      {/* The 7 Methodology Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <span>The 7 Golden Methodology Rules</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {rules.map((r, i) => (
            <div key={i} className="glass-card p-5 rounded-xl border border-gray-800 flex items-start space-x-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 font-mono font-bold text-sm">
                #{i + 1}
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">{r.title}</h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Author & Contact Card */}
      <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Built by Ankon Banik</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Full-Stack Data Engineer & Web Architect</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="mailto:ankonbnk@gmail.com"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all text-xs font-semibold"
          >
            <Mail className="w-4 h-4" />
            <span>ankonbnk@gmail.com</span>
          </a>
          <a
            href="https://github.com/AnkonBanik"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-indigo-600/20 text-gray-200 hover:text-indigo-400 border border-gray-700 transition-colors text-xs font-semibold"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub Profile</span>
          </a>
          <a
            href="https://www.linkedin.com/in/ankonbanik"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all text-xs font-semibold"
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
