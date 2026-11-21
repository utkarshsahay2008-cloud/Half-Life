"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("half-life-theme");
    if (stored === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      localStorage.setItem("half-life-theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      localStorage.setItem("half-life-theme", "light");
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    // Render a placeholder with identical dimensions to prevent layout shift
    return (
      <div className="flex h-8 items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 px-2.5 py-1 text-xs text-slate-500 shadow-2xs">
        <Sun className="h-3.5 w-3.5 text-amber-500" />
        <span className="font-mono text-[11px] font-semibold">Light</span>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      title={`Switch to ${isDark ? "Light Mode" : "Dark Mode"}`}
      className={`group relative flex h-8 items-center gap-2 rounded-xl border px-2.5 py-1 text-xs font-semibold shadow-2xs transition-all duration-200 active:scale-95 ${
        isDark
          ? "border-slate-700/80 bg-slate-900/90 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-850 hover:text-white hover:shadow-indigo-950/40"
          : "border-slate-200/90 bg-white/95 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun className="h-3.5 w-3.5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-indigo-600 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </div>

      <div className="flex items-center gap-1 font-mono text-[11px]">
        <span className="text-slate-400 hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isDark ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-indigo-600"
          }`}
        />
      </div>
    </button>
  );
}
