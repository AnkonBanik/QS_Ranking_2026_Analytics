import { LucideIcon } from "lucide-react";

interface ScoreCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    type?: "success" | "warning" | "indigo" | "neutral";
  };
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive?: boolean;
  };
}

export default function ScoreCard({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  trend,
}: ScoreCardProps) {
  const getBadgeStyle = () => {
    switch (badge?.type) {
      case "success":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "warning":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "indigo":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <div className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
      {/* Background Subtle Glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {title}
          </span>
          {Icon && (
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800/80 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700/50">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={`text-xs font-semibold ${
                trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800/60 flex items-center justify-between">
        {subtitle && <span className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</span>}
        {badge && (
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${getBadgeStyle()}`}>
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
}
