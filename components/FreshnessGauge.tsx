import React from "react";
import { formatScoreBadge } from "@/lib/utils";
import { ShieldCheck, AlertTriangle, AlertCircle, Clock, Zap } from "lucide-react";

interface FreshnessGaugeProps {
  score: number; // 0 - 100
  freshCount: number;
  decayingCount: number;
  staleCount: number;
  searchSkipSavingsMs?: number;
  simulatedDate?: string;
}

export function FreshnessGauge({
  score,
  freshCount,
  decayingCount,
  staleCount,
  searchSkipSavingsMs = 420,
  simulatedDate = "2026-11-20",
}: FreshnessGaugeProps) {
  const badge = formatScoreBadge(score);

  // SVG Radial Gauge Geometry
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = "#10B981"; // Emerald
  if (score < 45) {
    strokeColor = "#F43F5E"; // Coral Rose
  } else if (score < 80) {
    strokeColor = "#F59E0B"; // Amber
  }

  return (
    <div className="flex flex-col items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-md">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs font-bold tracking-wider uppercase text-slate-700">
          Freshness Index
        </span>
        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{simulatedDate}</span>
        </div>
      </div>

      {/* Circular Radial Gauge */}
      <div className="relative my-4 flex items-center justify-center">
        <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 160 160">
          {/* Background track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#E2E8F0"
            strokeWidth="12"
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Active progress track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="font-mono text-4xl font-extrabold tracking-tight text-slate-900">
            {score}
            <span className="text-xl font-medium text-slate-400">%</span>
          </span>
          <span
            className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wide uppercase ${badge.badgeClass}`}
          >
            {score >= 80 && <ShieldCheck className="h-3 w-3" />}
            {score >= 45 && score < 80 && <AlertTriangle className="h-3 w-3" />}
            {score < 45 && <AlertCircle className="h-3 w-3" />}
            {badge.label}
          </span>
        </div>
      </div>

      {/* Claim Breakdown Stats */}
      <div className="grid w-full grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
        <div className="rounded-xl bg-emerald-50/60 p-2 border border-emerald-100">
          <span className="block font-mono text-base font-bold text-emerald-700">{freshCount}</span>
          <span className="text-[10px] font-medium text-emerald-600 uppercase">Fresh</span>
        </div>
        <div className="rounded-xl bg-amber-50/60 p-2 border border-amber-100">
          <span className="block font-mono text-base font-bold text-amber-700">{decayingCount}</span>
          <span className="text-[10px] font-medium text-amber-600 uppercase">Decaying</span>
        </div>
        <div className="rounded-xl bg-rose-50/60 p-2 border border-rose-100">
          <span className="block font-mono text-base font-bold text-rose-700">{staleCount}</span>
          <span className="text-[10px] font-medium text-rose-600 uppercase">Stale</span>
        </div>
      </div>

      {/* Search-Skip Optimization Badge */}
      {searchSkipSavingsMs > 0 && (
        <div className="mt-3 flex w-full items-center justify-between rounded-xl border border-teal-200/70 bg-teal-50/60 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-teal-600" />
            <span className="text-[11px] font-semibold text-teal-900">Search-Skip Optimizer:</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-teal-700">
            +{searchSkipSavingsMs}ms Saved
          </span>
        </div>
      )}
    </div>
  );
}
