"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Globe, ShieldCheck, Zap, ExternalLink, RefreshCw } from "lucide-react";

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="font-mono text-sm font-bold tracking-tight text-emerald-400">t½</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                HALF-LIFE
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase text-slate-500">
                AI Fact Freshness & Decay Lab
              </span>
            </div>
          </Link>

          <div className="hidden h-5 w-px bg-slate-200 sm:block" />

          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Maxim AI × Tavily
          </div>
        </div>

        {/* Live Gateway Telemetry & Pills */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Bifrost Gateway Status */}
          <div
            title={`Bifrost Gateway: ${health?.bifrost.baseURL || "Local Gateway"}`}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1 text-xs shadow-xs"
          >
            <Activity className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-medium text-slate-600">Bifrost:</span>
            <span
              className={`font-mono text-[11px] font-semibold ${
                health?.bifrost.connected ? "text-emerald-600" : "text-blue-600"
              }`}
            >
              {health?.bifrost.connected ? "Active" : "Sim / Multi-Route"}
            </span>
          </div>

          {/* Tavily Grounding Status */}
          <div
            title="Tavily Grounding Engine with Search-Skip for Static Invariants"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1 text-xs shadow-xs"
          >
            <Globe className="h-3.5 w-3.5 text-teal-600" />
            <span className="font-medium text-slate-600">Tavily:</span>
            <span
              className={`font-mono text-[11px] font-semibold ${
                health?.tavily.active ? "text-emerald-600" : "text-teal-600"
              }`}
            >
              {health?.tavily.active ? "Live Key" : "Dual-Mode"}
            </span>
          </div>

          {/* Resilient Mode Pill */}
          <div className="hidden items-center gap-1 rounded-lg border border-slate-200/90 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 md:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            <span>Zero-Downtime Fallback</span>
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            title="Check live health"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
