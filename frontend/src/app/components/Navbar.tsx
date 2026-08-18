"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Trophy, 
  BarChart2, 
  BrainCircuit, 
  ShieldCheck, 
  BookOpen,
  Sparkles,
  Mail
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { name: "Rankings", href: "/rankings", icon: Trophy },
  { name: "Compare & Shifts", href: "/compare", icon: BarChart2 },
  { name: "Insights & Stats", href: "/insights", icon: BrainCircuit },
  { name: "Data Quality", href: "/data-quality", icon: ShieldCheck },
  { name: "Methodology", href: "/methodology", icon: BookOpen },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/rankings" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                QS <span className="gradient-text">Analytics</span>
              </span>
              <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase">
                Independent Re-Ranking
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (pathname === "/" && item.href === "/rankings");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600/10 dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Mail + Theme Toggle + Counter Badge */}
          <div className="flex items-center space-x-3">
            {/* Direct Mail Contact Button */}
            <a
              href="mailto:ankonbnk@gmail.com"
              className="p-2.5 rounded-xl border transition-all flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105"
              title="Contact Ankon Banik (ankonbnk@gmail.com)"
            >
              <Mail className="w-4 h-4" />
            </a>

            {/* Light / Dark Mode Switcher */}
            <ThemeToggle />

            {/* Total Universities Badge */}
            <div className="hidden sm:flex items-center space-x-2 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">1,504 Universities</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
