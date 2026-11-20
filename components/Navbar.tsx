"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Globe, ShieldCheck, Sparkles, RefreshCw, Zap } from "lucide-react";

interface GatewayHealth {
  bifrost: {
    connected: boolean;
    baseURL: string;
    latencyMs: number;
  };
  tavily: {
    active: boolean;
  };
  resilience: {
    demoFallbackMode: boolean;
  };
}

export function Navbar() {
  const [health, setHealth] = useState<GatewayHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      // Graceful fallback
      setHealth({
        bifrost: { connected: false, baseURL: "http://localhost:8080/openai", latencyMs: 2 },
        tavily: { active: false },
        resilience: { demoFallbackMode: true },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md shadow-slate-900/10 ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/20">
              <span className="font-mono text-sm font-bold tracking-tight text-emerald-400 drop-shadow-xs">t½</span>
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 opacity-0 blur-xs transition-opacity duration-300 group-hover:opacity-30" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-950 transition-colors">
                  HALF-LIFE
                </span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.2 font-mono text-[9px] font-bold text-indigo-600 border border-indigo-100">
                  LAB
                </span>
              </div>
              <span className="text-[10px] font-medium tracking-wide text-slate-500">
                AI Fact Freshness & Temporal Decay
              </span>
            </div>
          </Link>

          <div className="hidden h-5 w-px bg-slate-200/80 sm:block" />

          {/* Maxim AI & Tavily Collaboration Badge */}
          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-indigo-50/80 px-3 py-1 text-[11px] font-semibold text-emerald-800 shadow-2xs sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="bg-gradient-to-r from-emerald-800 to-teal-900 bg-clip-text text-transparent font-medium">
              Bifrost (Maxim AI) × Tavily
            </span>
          </div>
        </div>

        {/* Live Gateway Telemetry & Status Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bifrost Gateway Status Pill */}
          <div
            title={`Bifrost Gateway: ${health?.bifrost.baseURL || "Local Gateway"}`}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200/70 bg-gradient-to-b from-white to-blue-50/40 px-3 py-1.5 text-xs shadow-2xs transition-all hover:border-blue-300"
          >
            <Activity className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
            <span className="font-semibold text-slate-600 hidden md:inline">Bifrost:</span>
            <span
              className={`font-mono text-[11px] font-bold ${
                health?.bifrost.connected ? "text-emerald-700" : "text-blue-700"
              }`}
            >
              {health?.bifrost.connected ? "Active" : "Multi-Route"}
            </span>
          </div>

          {/* Tavily Grounding Status Pill */}
          <div
            title="Tavily Grounding Engine with Search-Skip for Static Invariants"
            className="flex items-center gap-1.5 rounded-xl border border-teal-200/70 bg-gradient-to-b from-white to-teal-50/40 px-3 py-1.5 text-xs shadow-2xs transition-all hover:border-teal-300"
          >
            <Globe className="h-3.5 w-3.5 text-teal-600" />
            <span className="font-semibold text-slate-600 hidden md:inline">Tavily:</span>
            <span
              className={`font-mono text-[11px] font-bold ${
                health?.tavily.active ? "text-emerald-700" : "text-teal-700"
              }`}
            >
              {health?.tavily.active ? "Live Key" : "Dual-Mode"}
            </span>
          </div>

          {/* Zero Downtime Badge */}
          <div className="hidden items-center gap-1.5 rounded-xl border border-slate-200/70 bg-slate-50/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 lg:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Zero-Downtime</span>
          </div>

          {/* Refresh Health Button */}
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-2xs hover:bg-slate-50 hover:text-slate-800 transition active:scale-95"
            title="Check live gateway status"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
