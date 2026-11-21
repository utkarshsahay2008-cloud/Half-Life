"use client";

import React, { useState } from "react";
import { Activity, ChevronDown, ChevronUp, Cpu, Layers, Clock, Zap, ShieldCheck } from "lucide-react";
import { CircuitSplinesPattern } from "./CardGraphics";

export interface TelemetryTraceItem {
  stage: "EXTRACTION" | "ADJUDICATION" | "GENERATION";
  model: string;
  routedVia: string;
  latencyMs: number;
  tokensUsed: number;
  timestamp: string;
  isMockFallback?: boolean;
}

interface TelemetryDrawerProps {
  traces: TelemetryTraceItem[];
  searchSkipSavingsMs?: number;
}

export function TelemetryDrawer({
  traces,
  searchSkipSavingsMs = 420,
}: TelemetryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalTokens = traces.reduce((acc, t) => acc + (t.tokensUsed || 0), 0);
  const totalLatencyMs = traces.reduce((acc, t) => acc + (t.latencyMs || 0), 0);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white/95 to-blue-50/30 dark:from-[#0B1120]/90 dark:to-[#070A13]/90 p-5 sm:p-6 shadow-sm shadow-blue-500/5 dark:shadow-black/50 backdrop-blur-xl">
      <CircuitSplinesPattern />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs">
              <Activity className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
                  Bifrost Multi-Model Gateway Telemetry
                </span>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60">
                  @maximhq/bifrost
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live routing: <span className="font-semibold text-slate-700 dark:text-slate-300">groq/openai/gpt-oss-20b</span> (extraction) → <span className="font-semibold text-slate-700 dark:text-slate-300">groq/openai/gpt-oss-120b</span> (adjudication)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-slate-700 dark:text-slate-300 shadow-2xs">
                ⏱ {totalLatencyMs}ms
              </span>
              <span className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-slate-700 dark:text-slate-300 shadow-2xs">
                ⚡ {totalTokens} tokens
              </span>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95"
            >
              <span>{isOpen ? "Hide Route Graph" : "Inspect Gateway Traces"}</span>
              {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Trace Breakdown */}
        {isOpen && (
          <div className="mt-4 space-y-3.5 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {traces.map((trace, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-3.5 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60">
                      <Layers className="h-3 w-3" />
                      Stage {idx + 1}: {trace.stage}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      {trace.latencyMs}ms
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Target Model:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{trace.model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Gateway Route:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{trace.routedVia}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Tokens Billed:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{trace.tokensUsed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tavily Search-Skip Architecture highlight */}
            <div className="rounded-2xl border border-teal-200/90 dark:border-teal-900/50 bg-gradient-to-r from-teal-50/70 via-emerald-50/50 to-white dark:from-teal-950/40 dark:via-emerald-950/20 dark:to-slate-900 p-3.5 text-xs text-teal-950 dark:text-teal-200 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-600 text-white shadow-2xs">
                    <Zap className="h-3 w-3" />
                  </div>
                  <span className="font-bold">Tavily Search-Skip Architecture:</span>
                  <span className="text-teal-800 dark:text-teal-300 font-medium hidden sm:inline">
                    Timeless & mathematical invariant claims bypass external search.
                  </span>
                </div>
                <span className="rounded-lg bg-teal-100/80 dark:bg-teal-900/50 px-2 py-0.5 font-mono font-bold text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800/60">
                  +{searchSkipSavingsMs}ms latency saved
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
