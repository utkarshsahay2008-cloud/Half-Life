"use client";

import React, { useState, useMemo } from "react";
import { Sliders, Calculator, Zap, Clock, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";

export function DecaySimulatorSandbox() {
  const [halfLifeDays, setHalfLifeDays] = useState(90); // default 90 days (API standard)
  const [initialConfidence, setInitialConfidence] = useState(100); // 100%
  const [elapsedDays, setElapsedDays] = useState(120); // 120 days elapsed

  // Formula: N(t) = N0 * (0.5)^(t / t_half)
  const currentFreshness = useMemo(() => {
    if (halfLifeDays >= 9999) return initialConfidence;
    const ratio = elapsedDays / halfLifeDays;
    const score = initialConfidence * Math.pow(0.5, ratio);
    return Math.max(1, Math.round(score));
  }, [halfLifeDays, initialConfidence, elapsedDays]);

  // Decay Constant: lambda = ln(2) / halfLife
  const decayConstant = useMemo(() => {
    if (halfLifeDays >= 9999) return 0;
    return (Math.LN2 / halfLifeDays).toFixed(4);
  }, [halfLifeDays]);

  // Recommended grounding check interval (at 80% threshold: t = -t_half * log2(0.8) ~= 0.322 * t_half)
  const recommendedInterval = useMemo(() => {
    if (halfLifeDays >= 9999) return "Never (Static Law)";
    const days = Math.max(7, Math.round(halfLifeDays * 0.32));
    return `Every ${days} days`;
  }, [halfLifeDays]);

  // SVG Curve generation for 0 to 365 days
  const SVG_W = 500;
  const SVG_H = 160;
  const PAD = { top: 15, right: 25, bottom: 25, left: 35 };
  const W = SVG_W - PAD.left - PAD.right;
  const H = SVG_H - PAD.top - PAD.bottom;

  const { pathD, areaD, currentX, currentY } = useMemo(() => {
    const maxT = 365;
    const steps = 50;
    const pts: Array<{ x: number; y: number }> = [];

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxT;
      const x = PAD.left + (t / maxT) * W;
      const s = halfLifeDays >= 9999 ? initialConfidence : initialConfidence * Math.pow(0.5, t / halfLifeDays);
      const y = PAD.top + H - (Math.min(100, Math.max(0, s)) / 100) * H;
      pts.push({ x, y });
    }

    const path = pts.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`), "");
    const area = `${path} L ${(PAD.left + W).toFixed(1)} ${(PAD.top + H).toFixed(1)} L ${PAD.left.toFixed(1)} ${(PAD.top + H).toFixed(1)} Z`;

    // Coordinates for the current elapsed days needle
    const curX = PAD.left + (Math.min(maxT, elapsedDays) / maxT) * W;
    const curY = PAD.top + H - (currentFreshness / 100) * H;

    return { pathD: path, areaD: area, currentX: curX, currentY: curY };
  }, [halfLifeDays, initialConfidence, elapsedDays, currentFreshness, W, H, PAD]);

  const setPreset = (hl: number, init: number, el: number) => {
    setHalfLifeDays(hl);
    setInitialConfidence(init);
    setElapsedDays(el);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/70 p-5 sm:p-6 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Interactive Decay Parameter Sandbox
              </h3>
              <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50/80 border border-amber-200/70 rounded-full px-2.5 py-0.5 shadow-2xs">
                Live Formula Simulator
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Simulate entropy decay parameters and model custom factual lifecycles with real-time recalculation.
            </p>
          </div>
        </div>

        {/* Live Calculation Output Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 font-medium">Result Freshness:</span>
          <span
            className={`rounded-xl px-3 py-1 font-black shadow-xs border ${
              currentFreshness >= 80
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : currentFreshness >= 45
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {currentFreshness}% Fresh
          </span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-3">
        <span className="text-[11px] font-bold text-slate-500">Real-World Benchmarks:</span>
        <button
          onClick={() => setPreset(90, 100, 140)}
          className="rounded-xl border border-blue-200 bg-blue-50/80 px-2.5 py-1 font-mono text-[10px] font-bold text-blue-800 hover:bg-blue-100 transition shadow-2xs"
        >
          API v1 Sunset (t½ = 90d)
        </button>
        <button
          onClick={() => setPreset(60, 100, 95)}
          className="rounded-xl border border-amber-200 bg-amber-50/80 px-2.5 py-1 font-mono text-[10px] font-bold text-amber-800 hover:bg-amber-100 transition shadow-2xs"
        >
          Token Rate Cards (t½ = 60d)
        </button>
        <button
          onClick={() => setPreset(180, 100, 210)}
          className="rounded-xl border border-purple-200 bg-purple-50/80 px-2.5 py-1 font-mono text-[10px] font-bold text-purple-800 hover:bg-purple-100 transition shadow-2xs"
        >
          Leadership Shift (t½ = 180d)
        </button>
        <button
          onClick={() => setPreset(9999, 100, 300)}
          className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs"
        >
          Static Law (t½ = ∞)
        </button>
      </div>

      {/* Main Grid: Controls + Interactive Curve + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-4">
        {/* Sliders Controls */}
        <div className="lg:col-span-5 flex flex-col gap-3.5 bg-white/70 rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          {/* Slider 1: Half-Life Days */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">Half-Life (t½):</span>
              <span className="font-mono font-bold text-indigo-700">
                {halfLifeDays >= 9999 ? "∞ (Static)" : `${halfLifeDays} days`}
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="365"
              step="5"
              value={halfLifeDays >= 9999 ? 365 : halfLifeDays}
              onChange={(e) => setHalfLifeDays(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-0.5">
              <span>15d (Hyper Decay)</span>
              <span>180d</span>
              <span>365d (Gradual)</span>
            </div>
          </div>

          {/* Slider 2: Elapsed Days */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">Time Elapsed (t):</span>
              <span className="font-mono font-bold text-amber-700">{elapsedDays} days</span>
            </div>
            <input
              type="range"
              min="0"
              max="365"
              step="5"
              value={elapsedDays}
              onChange={(e) => setElapsedDays(Number(e.target.value))}
              className="w-full accent-amber-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-400 mt-0.5">
              <span>Day 0 (Initial)</span>
              <span>180d</span>
              <span>365d (1 Year)</span>
            </div>
          </div>

          {/* Slider 3: Initial Confidence N0 */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-700">Initial Confidence (N₀):</span>
              <span className="font-mono font-bold text-slate-800">{initialConfidence}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={initialConfidence}
              onChange={(e) => setInitialConfidence(Number(e.target.value))}
              className="w-full accent-slate-800 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Visual Simulated SVG Curve */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-inner">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto select-none overflow-visible">
              <defs>
                <linearGradient id="sandboxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Grid ticks */}
              {[0, 50, 100].map((sc) => {
                const y = PAD.top + H - (sc / 100) * H;
                return (
                  <g key={sc}>
                    <line x1={PAD.left} y1={y} x2={PAD.left + W} y2={y} stroke="#F1F5F9" strokeWidth="1" />
                    <text x={PAD.left - 6} y={y + 3} textAnchor="end" className="fill-slate-400 font-mono text-[8px]">
                      {sc}%
                    </text>
                  </g>
                );
              })}

              {/* Critical threshold */}
              <line
                x1={PAD.left}
                y1={PAD.top + H - 0.45 * H}
                x2={PAD.left + W}
                y2={PAD.top + H - 0.45 * H}
                stroke="#FDA4AF"
                strokeWidth="1"
                strokeDasharray="3 3"
              />

              {/* Curve area & path */}
              <path d={areaD} fill="url(#sandboxGrad)" />
              <path d={pathD} fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />

              {/* Needle for elapsed time */}
              <line
                x1={currentX}
                y1={PAD.top}
                x2={currentX}
                y2={PAD.top + H}
                stroke="#4F46E5"
                strokeWidth="2"
                strokeDasharray="3 2"
              />
              <circle cx={currentX} cy={currentY} r="5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
              <text
                x={Math.min(currentX + 8, SVG_W - 70)}
                y={Math.max(currentY - 8, PAD.top + 10)}
                className="fill-indigo-900 font-mono text-[10px] font-bold"
              >
                {currentFreshness}% @ {elapsedDays}d
              </text>
            </svg>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-slate-200/80 bg-white/80 p-2 shadow-2xs">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Decay Constant (λ)</span>
              <span className="font-mono font-bold text-slate-800">{decayConstant} / day</span>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 p-2 shadow-2xs">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Status Class</span>
              <span className={`font-mono font-bold ${currentFreshness >= 80 ? "text-emerald-700" : currentFreshness >= 45 ? "text-amber-700" : "text-rose-700"}`}>
                {currentFreshness >= 80 ? "PRODUCTION FRESH" : currentFreshness >= 45 ? "DECAY WARNING" : "CRITICAL STALE"}
              </span>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 p-2 shadow-2xs">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Grounding Cadence</span>
              <span className="font-mono font-bold text-teal-700">{recommendedInterval}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
