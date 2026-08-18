import { Sparkles, Mail, ExternalLink, Calendar } from "lucide-react";

export default function Footer() {
  return (
    <footer className="glass-card border-t border-gray-200 dark:border-gray-800 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Brand & Project Info */}
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm">
                QS Analytics 2025
              </span>
            </div>
            <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Independent data cleaning, 3-layer imputation, standardization, and deterministic re-ranking.
            </p>
          </div>

          {/* Data Source & Publication Metadata */}
          <div className="flex flex-col items-center justify-center text-center space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs text-gray-700 dark:text-gray-200">
              <span className="font-medium text-gray-600 dark:text-gray-300">Data Source:</span>
              <a
                href="https://www.topuniversities.com/world-university-rankings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 font-bold text-indigo-600 dark:text-indigo-300 hover:underline"
              >
                <span>topuniversities.com</span>
                <ExternalLink className="w-3 h-3 ml-0.5 text-indigo-500" />
              </a>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-gray-600 dark:text-gray-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>Published on: <strong className="font-bold text-slate-900 dark:text-white">18 June 2026</strong></span>
            </div>
          </div>

          {/* Social Icons & Author */}
          <div className="flex items-center justify-end space-x-3">
            {/* Mail Icon Hyperlink */}
            <a
              href="mailto:ankonbnk@gmail.com"
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-gray-300 dark:border-gray-700 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all hover:scale-110"
              title="Contact via Email (ankonbnk@gmail.com)"
              aria-label="Send email to Ankon Banik"
            >
              <Mail className="w-4 h-4" />
            </a>

            {/* GitHub Icon Hyperlink */}
            <a
              href="https://github.com/AnkonBanik"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all hover:scale-110"
              title="GitHub Profile"
              aria-label="GitHub Profile"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>

            {/* LinkedIn Icon Hyperlink */}
            <a
              href="https://www.linkedin.com/in/ankonbanik"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all hover:scale-110"
              title="LinkedIn Profile"
              aria-label="LinkedIn Profile"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.75a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9z" />
              </svg>
            </a>

            {/* Author Attribution */}
            <div className="pl-2 border-l border-gray-300 dark:border-gray-700 text-right text-xs text-gray-600 dark:text-gray-300">
              <span>By <strong className="font-bold text-slate-900 dark:text-white">Ankon Banik</strong></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
