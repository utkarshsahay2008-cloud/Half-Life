"use client";

import React, { useState } from "react";
import { Activity, ChevronDown, ChevronUp, Cpu, Layers, Clock, Zap } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-white/85 p-5 shadow-sm backdrop-blur-md">
      <CircuitSplinesPattern />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  Bifrost Multi-Model Gateway Telemetry
                </span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700 border border-blue-200/70">
                  @maximhq/bifrost
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Live routing: <span className="font-semibold text-slate-700">gpt-4o-mini</span> (extraction) → <span className="font-semibold text-slate-700">gpt-4o</span> (temporal reasoning)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-600">
              <span className="rounded-md bg-slate-100 px-2 py-1">
                ⏱ {totalLatencyMs}ms
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1">
                ⚡ {totalTokens} tokens
              </span>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <span>{isOpen ? "Hide Route Graph" : "Inspect Gateway Traces"}</span>
              {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Trace Breakdown */}
        {isOpen && (
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {traces.map((trace, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-800">
                      <Layers className="h-3 w-3" />
                      Stage {idx + 1}: {trace.stage}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-500">
                      {trace.latencyMs}ms
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Target Model:</span>
                      <span className="font-mono font-medium text-slate-800">{trace.model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Gateway Route:</span>
                      <span className="font-medium text-slate-700">{trace.routedVia}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tokens Billed:</span>
                      <span className="font-mono font-semibold text-slate-800">{trace.tokensUsed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tavily Search-Skip Architecture highlight */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-3 text-xs text-teal-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-teal-600" />
                  <span className="font-semibold">Tavily Search-Skip Engine:</span>
                  <span className="text-teal-700">
                    Timeless & mathematical invariant claims bypass live external search.
                  </span>
                </div>
                <span className="font-mono font-bold text-teal-800">
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
