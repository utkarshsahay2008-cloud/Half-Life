"use client";

import React, { useMemo, useState } from "react";
import { TrendingDown, Activity, Sparkles, ShieldCheck, Clock, Info, Zap } from "lucide-react";

interface ClaimItem {
  id?: string;
  claimIndex: number;
  originalSpan: string;
  category: string;
  halfLifeDays: number;
  expiredAtDate: string;
  freshnessScore: number;
  status: string;
  liveTruth?: string;
}

interface DecayCurveChartProps {
  claims: ClaimItem[];
  simulatedDate: string; // YYYY-MM-DD
}

const CATEGORY_COLORS: Record<string, { stroke: string; fill: string; bg: string; text: string; badge: string; name: string; velocity: string }> = {
  API: {
    stroke: "#3B82F6", // blue-500
    fill: "rgba(59, 130, 246, 0.12)",
    bg: "bg-blue-500",
    text: "text-blue-700",
    badge: "border-blue-200 bg-blue-50/80 text-blue-800",
    name: "API & SDK Endpoints",
    velocity: "Fast Decay (~90d)",
  },
  PRICING: {
    stroke: "#F59E0B", // amber-500
    fill: "rgba(245, 158, 11, 0.12)",
    bg: "bg-amber-500",
    text: "text-amber-700",
    badge: "border-amber-200 bg-amber-50/80 text-amber-800",
    name: "Pricing Rate Cards",
    velocity: "Hyper Decay (~60d)",
  },
  LEADERSHIP: {
    stroke: "#8B5CF6", // purple-500
    fill: "rgba(139, 92, 246, 0.12)",
    bg: "bg-purple-500",
    text: "text-purple-700",
    badge: "border-purple-200 bg-purple-50/80 text-purple-800",
    name: "Leadership & Org",
    velocity: "Medium Decay (~180d)",
  },
  REGULATION: {
    stroke: "#EC4899", // pink-500
    fill: "rgba(236, 72, 153, 0.12)",
    bg: "bg-pink-500",
    text: "text-pink-700",
    badge: "border-pink-200 bg-pink-50/80 text-pink-800",
    name: "AI Safety & Law",
    velocity: "Gradual Decay (~240d)",
  },
  STATIC: {
    stroke: "#10B981", // emerald-500
    fill: "rgba(16, 185, 129, 0.12)",
    bg: "bg-emerald-500",
    text: "text-emerald-700",
    badge: "border-emerald-200 bg-emerald-50/80 text-emerald-800",
    name: "Timeless Invariants",
    velocity: "Static (Zero Decay)",
  },
};

const DEFAULT_CATEGORY_STYLE = {
  stroke: "#64748B",
  fill: "rgba(100, 116, 139, 0.1)",
  bg: "bg-slate-500",
  text: "text-slate-700",
  badge: "border-slate-200 bg-slate-50 text-slate-700",
  name: "General Claim",
  velocity: "Standard",
};

import {
  CHRONOMETER_MIN_EPOCH,
  CHRONOMETER_MAX_EPOCH,
  CHRONOMETER_MILESTONES,
} from "@/lib/chronometer";

export function DecayCurveChart({ claims, simulatedDate }: DecayCurveChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    category: string;
    date: string;
    score: number;
    x: number;
    y: number;
  } | null>(null);

  // Canonical Timeline boundaries (matches TimeTravelScrubber 1:1)
  const START_EPOCH = CHRONOMETER_MIN_EPOCH;
  const END_EPOCH = CHRONOMETER_MAX_EPOCH;

  // Current simulation marker position
  const simEpoch = new Date(simulatedDate).getTime() || END_EPOCH;
  const simRatio = Math.max(0, Math.min(1, (simEpoch - START_EPOCH) / (END_EPOCH - START_EPOCH)));

  // SVG dimensions
  const SVG_WIDTH = 760;
  const SVG_HEIGHT = 220;
  const PADDING = { top: 22, right: 30, bottom: 35, left: 45 };
  const CHART_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
  const CHART_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");

  // Distinct categories present in active claims, with memoized curve path calculation
  const computedCurves = useMemo(() => {
    const map = new Map<string, { halfLifeDays: number; count: number; minExpiry: string }>();
    claims.forEach((c) => {
      const cat = c.category.toUpperCase();
      const existing = map.get(cat);
      if (existing) {
        existing.count += 1;
        if (c.expiredAtDate !== "NEVER" && (existing.minExpiry === "NEVER" || c.expiredAtDate < existing.minExpiry)) {
          existing.minExpiry = c.expiredAtDate;
        }
      } else {
        map.set(cat, {
          halfLifeDays: c.halfLifeDays,
          count: 1,
          minExpiry: c.expiredAtDate,
        });
      }
    });

    const steps = 60;
    return Array.from(map.entries()).map(([cat, data]) => {
      const style = CATEGORY_COLORS[cat] || DEFAULT_CATEGORY_STYLE;
      const isStatic = data.halfLifeDays <= 0 || data.minExpiry === "NEVER";
      const expiryEpoch = data.minExpiry === "NEVER" ? END_EPOCH : new Date(data.minExpiry).getTime();

      const points: Array<{ x: number; y: number; date: string; score: number }> = [];

      for (let i = 0; i <= steps; i++) {
        const stepEpoch = START_EPOCH + (i / steps) * (END_EPOCH - START_EPOCH);
        const x = PADDING.left + (i / steps) * CHART_WIDTH;

        let score = 100;
        if (!isStatic && stepEpoch > expiryEpoch) {
          const daysPastExpiry = (stepEpoch - expiryEpoch) / (1000 * 60 * 60 * 24);
          score = Math.max(5, Math.round(100 * Math.pow(0.5, daysPastExpiry / data.halfLifeDays)));
        }

        const y = PADDING.top + CHART_HEIGHT - (score / 100) * CHART_HEIGHT;
        const dateStr = new Date(stepEpoch).toISOString().split("T")[0];
        points.push({ x, y, date: dateStr, score });
      }

      const pathD = points.reduce((acc, pt, idx) => {
        return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      }, "");

      const areaD = `${pathD} L ${(PADDING.left + CHART_WIDTH).toFixed(1)} ${(PADDING.top + CHART_HEIGHT).toFixed(1)} L ${PADDING.left.toFixed(1)} ${(PADDING.top + CHART_HEIGHT).toFixed(1)} Z`;

      return {
        category: cat,
        halfLifeDays: data.halfLifeDays,
        count: data.count,
        minExpiry: data.minExpiry,
        style,
        pathD,
        areaD,
        points,
      };
    });
  }, [claims, START_EPOCH, END_EPOCH, PADDING.left, PADDING.top, CHART_WIDTH, CHART_HEIGHT]);

  const simMarkerX = PADDING.left + simRatio * CHART_WIDTH;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/70 p-5 sm:p-6 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
            <TrendingDown className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Mathematical Factual Decay Trajectories
              </h3>
              <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-200/70 rounded-full px-2.5 py-0.5 shadow-2xs">
                N(t) = N₀ · (½)^(t / t½)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Logarithmic half-life decay trajectories across APIs, rate cards, governance, and regulatory lifecycles.
            </p>
          </div>
        </div>

        {/* Dynamic Status at current simulation date */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 font-medium">Scrubber Needle:</span>
          <span className="rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 px-3 py-1 font-bold text-white shadow-xs">
            {simulatedDate}
          </span>
        </div>
      </div>

      {/* Category Trajectory Isolation Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 pb-1">
        <button
          onClick={() => setActiveCategoryFilter("ALL")}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition ${
            activeCategoryFilter === "ALL"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Vectors ({computedCurves.length})
        </button>
        {computedCurves.map((c) => {
          const isSelected = activeCategoryFilter === c.category;
          return (
            <button
              key={c.category}
              onClick={() => setActiveCategoryFilter(isSelected ? "ALL" : c.category)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition ${
                isSelected
                  ? `${c.style.badge} ring-2 ring-indigo-400/30 shadow-xs font-extrabold`
                  : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${c.style.bg}`} />
              <span>{c.category}</span>
              <span className="text-[9px] opacity-70">({c.halfLifeDays >= 99999 ? "∞" : `${c.halfLifeDays}d`})</span>
            </button>
          );
        })}
      </div>

      {/* SVG Decay Chart */}
      <div className="relative mt-2 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto select-none overflow-visible"
        >
          <defs>
            {/* Gradients for each category */}
            {computedCurves.map(({ category, style }) => (
              <linearGradient
                key={category}
                id={`grad-${category}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor={style.stroke} stopOpacity="0.25" />
                <stop offset="60%" stopColor={style.stroke} stopOpacity="0.08" />
                <stop offset="100%" stopColor={style.stroke} stopOpacity="0.01" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines & score ticks (Y-axis: 0%, 25%, 50%, 75%, 100%) */}
          {[0, 25, 50, 75, 100].map((score) => {
            const y = PADDING.top + CHART_HEIGHT - (score / 100) * CHART_HEIGHT;
            return (
              <g key={score}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={PADDING.left + CHART_WIDTH}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray={score === 0 || score === 100 ? "" : "3 3"}
                />
                <text
                  x={PADDING.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 font-mono text-[9px] font-medium"
                >
                  {score}%
                </text>
              </g>
            );
          })}

          {/* Critical Staleness Threshold (45%) */}
          <line
            x1={PADDING.left}
            y1={PADDING.top + CHART_HEIGHT - 0.45 * CHART_HEIGHT}
            x2={PADDING.left + CHART_WIDTH}
            y2={PADDING.top + CHART_HEIGHT - 0.45 * CHART_HEIGHT}
            stroke="#F43F5E"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.65"
          />
          <text
            x={PADDING.left + CHART_WIDTH - 6}
            y={PADDING.top + CHART_HEIGHT - 0.45 * CHART_HEIGHT - 4}
            textAnchor="end"
            className="fill-rose-500 font-mono text-[9px] font-bold"
          >
            Critical Stale Boundary (45%)
          </text>

          {/* X-axis date milestones (100% matched to Chronometer milestones) */}
          {CHRONOMETER_MILESTONES.map((tick) => {
            const x = PADDING.left + (tick.percent / 100) * CHART_WIDTH;
            return (
              <g key={tick.date}>
                <line
                  x1={x}
                  y1={PADDING.top}
                  x2={x}
                  y2={PADDING.top + CHART_HEIGHT}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <line
                  x1={x}
                  y1={PADDING.top + CHART_HEIGHT}
                  x2={x}
                  y2={PADDING.top + CHART_HEIGHT + 4}
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                />
                <text
                  x={x}
                  y={PADDING.top + CHART_HEIGHT + 16}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[9px] font-semibold"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Category Decay Curves */}
          {computedCurves.map(({ category, style, pathD, areaD, points }) => {
            const isFaded = activeCategoryFilter !== "ALL" && activeCategoryFilter !== category;
            const opacity = isFaded ? 0.15 : 1.0;

            return (
              <g key={category} style={{ opacity, transition: "opacity 0.2s ease" }}>
                {/* Area under curve */}
                <path d={areaD} fill={`url(#grad-${category})`} />

                {/* Primary decay curve */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth={activeCategoryFilter === category ? "3.5" : "2.5"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive sample points */}
                {points
                  .filter((_, idx) => idx % 6 === 0)
                  .map((pt, pIdx) => (
                    <circle
                      key={pIdx}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="#FFFFFF"
                      stroke={style.stroke}
                      strokeWidth="2.5"
                      className="cursor-pointer transition-transform hover:scale-150"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          category,
                          date: pt.date,
                          score: pt.score,
                          x: pt.x,
                          y: pt.y,
                        })
                      }
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
              </g>
            );
          })}

          {/* Active Chronometer Needle - Zero-overhead crisp rendering */}
          <g>
            {/* Soft backdrop beam */}
            <line
              x1={simMarkerX}
              y1={PADDING.top}
              x2={simMarkerX}
              y2={PADDING.top + CHART_HEIGHT}
              stroke="#6366F1"
              strokeWidth="6"
              strokeOpacity="0.15"
            />
            {/* Sharp needle line */}
            <line
              x1={simMarkerX}
              y1={PADDING.top - 6}
              x2={simMarkerX}
              y2={PADDING.top + CHART_HEIGHT + 6}
              stroke="#4F46E5"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            {/* Top pointer marker */}
            <circle cx={simMarkerX} cy={PADDING.top - 6} r="4.5" fill="#4F46E5" />
            <circle cx={simMarkerX} cy={PADDING.top - 6} r="2" fill="#FFFFFF" />

            {/* Bottom pointer marker */}
            <circle cx={simMarkerX} cy={PADDING.top + CHART_HEIGHT + 6} r="4.5" fill="#4F46E5" />
          </g>

          {/* Hover Tooltip Popup within SVG */}
          {hoveredPoint && (
            <g transform={`translate(${Math.min(hoveredPoint.x + 10, SVG_WIDTH - 150)}, ${Math.max(hoveredPoint.y - 48, 8)})`}>
              <rect
                width="140"
                height="44"
                rx="8"
                fill="#0F172A"
                className="shadow-xl"
              />
              <text x="10" y="18" fill="#F8FAFC" className="font-mono text-[10px] font-bold">
                {hoveredPoint.category}: {hoveredPoint.score}% Fresh
              </text>
              <text x="10" y="32" fill="#94A3B8" className="font-mono text-[9px]">
                Sim Date: {hoveredPoint.date}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Category Pills & Decay Velocity Cards */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 border-t border-slate-100 pt-3.5">
        {computedCurves.map(({ category, halfLifeDays, count, style }) => {
          return (
            <div
              key={category}
              className="flex items-center gap-2.5 rounded-2xl border border-slate-200/70 bg-gradient-to-r from-white to-slate-50/50 p-2.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
            >
              <div
                className="h-3 w-3 rounded-full shrink-0 shadow-2xs ring-2 ring-white"
                style={{ backgroundColor: style.stroke }}
              />
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] font-bold text-slate-900 truncate">
                    {category}
                  </span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-slate-600 border border-slate-200">
                    {count}
                  </span>
                </div>
                <span className="block font-mono text-[9px] text-slate-500 truncate">
                  {halfLifeDays > 0 ? `t½ = ${halfLifeDays}d (${style.velocity})` : "Static / ∞"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
