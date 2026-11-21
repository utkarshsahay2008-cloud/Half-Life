"use client";

import React, { useMemo, useState } from "react";
import { Compass, ShieldCheck, Zap, Info, Layers, RefreshCw } from "lucide-react";

interface KnowledgeEntropyRadarProps {
  claims: Array<{
    category: string;
    dynamicScore: number;
    halfLifeDays: number;
    dynamicStatus: string;
  }>;
  simulatedDate: string;
}

interface DimensionPoint {
  key: string;
  label: string;
  sublabel: string;
  score: number; // 0 - 100
  color: string;
  borderColor: string;
  accentBg: string;
  angle: number; // in radians
  x: number;
  y: number;
}

export function KnowledgeEntropyRadar({
  claims,
  simulatedDate,
}: KnowledgeEntropyRadarProps) {
  const [hoveredDim, setHoveredDim] = useState<DimensionPoint | null>(null);

  // Compute 5-axis dimensions dynamically based on active claims and simulated date
  const dimensions = useMemo(() => {
    // 1. API Freshness (Default ~70, or avg of API claims)
    const apiClaims = claims.filter((c) => c.category === "API" || c.category === "API_VERSION");
    const apiScore = apiClaims.length > 0
      ? Math.round(apiClaims.reduce((acc, c) => acc + c.dynamicScore, 0) / apiClaims.length)
      : 85;

    // 2. Pricing Economics (Default ~65, or avg of PRICING claims)
    const pricingClaims = claims.filter((c) => c.category === "PRICING");
    const pricingScore = pricingClaims.length > 0
      ? Math.round(pricingClaims.reduce((acc, c) => acc + c.dynamicScore, 0) / pricingClaims.length)
      : 70;

    // 3. Leadership & Governance (Default ~80, or avg of LEADERSHIP claims)
    const leadClaims = claims.filter((c) => c.category === "LEADERSHIP");
    const leadScore = leadClaims.length > 0
      ? Math.round(leadClaims.reduce((acc, c) => acc + c.dynamicScore, 0) / leadClaims.length)
      : 78;

    // 4. Regulatory Compliance (Default ~75, or avg of REGULATION claims)
    const regClaims = claims.filter((c) => c.category === "REGULATION");
    const regScore = regClaims.length > 0
      ? Math.round(regClaims.reduce((acc, c) => acc + c.dynamicScore, 0) / regClaims.length)
      : 82;

    // 5. Invariant Grounding / Search-Skip Efficiency
    const staticClaims = claims.filter((c) => c.category === "STATIC");
    const staticScore = staticClaims.length > 0
      ? Math.round(staticClaims.reduce((acc, c) => acc + c.dynamicScore, 0) / staticClaims.length)
      : 96;

    const rawDims = [
      {
        key: "api",
        label: "API Drift Velocity",
        sublabel: "SDK & Endpoint Staleness",
        score: apiScore,
        color: "#3B82F6",
        borderColor: "border-blue-200",
        accentBg: "bg-blue-50 text-blue-700",
      },
      {
        key: "pricing",
        label: "Pricing Volatility",
        sublabel: "Token Card Rot Rate",
        score: pricingScore,
        color: "#F59E0B",
        borderColor: "border-amber-200",
        accentBg: "bg-amber-50 text-amber-700",
      },
      {
        key: "governance",
        label: "Governance Turnover",
        sublabel: "Executive & Lab Shifts",
        score: leadScore,
        color: "#8B5CF6",
        borderColor: "border-purple-200",
        accentBg: "bg-purple-50 text-purple-700",
      },
      {
        key: "regulation",
        label: "Regulatory Mandate",
        sublabel: "AI Safety Law Horizon",
        score: regScore,
        color: "#EC4899",
        borderColor: "border-pink-200",
        accentBg: "bg-pink-50 text-pink-700",
      },
      {
        key: "invariance",
        label: "Search-Skip Invariance",
        sublabel: "Timeless Law Optimization",
        score: staticScore,
        color: "#10B981",
        borderColor: "border-emerald-200",
        accentBg: "bg-emerald-50 text-emerald-700",
      },
    ];

    const cx = 150;
    const cy = 150;
    const maxR = 105;

    return rawDims.map((dim, idx) => {
      // Rotate starting from top (-pi / 2)
      const angle = (idx / rawDims.length) * 2 * Math.PI - Math.PI / 2;
      const r = (dim.score / 100) * maxR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return {
        ...dim,
        angle,
        x,
        y,
      };
    });
  }, [claims]);

  const cx = 150;
  const cy = 150;
  const maxR = 105;

  // Build polygon string for radar area
  const polygonPoints = useMemo(() => {
    return dimensions.map((d) => `${d.x.toFixed(1)},${d.y.toFixed(1)}`).join(" ");
  }, [dimensions]);

  // Overall Entropy Health Score
  const avgHealth = Math.round(
    dimensions.reduce((acc, d) => acc + d.score, 0) / dimensions.length
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/70 dark:from-[#0B1120]/90 dark:via-[#0D1527]/80 dark:to-[#070A13]/90 p-5 sm:p-6 shadow-sm shadow-slate-200/50 dark:shadow-black/50 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Multi-Axis Knowledge Entropy Radar
              </h3>
              <span className="font-mono text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 shadow-2xs">
                5-Vector Topology
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Evaluates multi-dimensional factual stability across time, APIs, pricing, governance, and static laws.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Composite Integrity:</span>
          <span
            className={`rounded-xl px-2.5 py-0.5 font-bold shadow-xs border ${
              avgHealth >= 80
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                : avgHealth >= 50
                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                : "bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60"
            }`}
          >
            {avgHealth}% Health
          </span>
        </div>
      </div>

      {/* Main Grid: Radar SVG + Vector Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-4">
        {/* Radar SVG Chart */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center select-none">
            <svg viewBox="0 0 300 300" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="radarAreaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.32" />
                  <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {/* Concentric Guide Webs (25%, 50%, 75%, 100%) */}
              {[0.25, 0.5, 0.75, 1.0].map((level) => {
                const r = maxR * level;
                const ringPoints = dimensions
                  .map((_, idx) => {
                    const angle = (idx / dimensions.length) * 2 * Math.PI - Math.PI / 2;
                    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
                  })
                  .join(" ");

                return (
                  <g key={level}>
                    <polygon
                      points={ringPoints}
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth={level === 1.0 ? "1.5" : "1"}
                      strokeDasharray={level === 1.0 ? "" : "3 3"}
                      className="stroke-slate-200 dark:stroke-slate-800/80"
                    />
                    <text
                      x={cx + 4}
                      y={cy - r + 9}
                      className="fill-slate-400 dark:fill-slate-500 font-mono text-[8px] font-semibold"
                    >
                      {Math.round(level * 100)}%
                    </text>
                  </g>
                );
              })}

              {/* Radial Spoke Axis Lines */}
              {dimensions.map((dim, idx) => {
                const edgeX = cx + maxR * Math.cos(dim.angle);
                const edgeY = cy + maxR * Math.sin(dim.angle);
                return (
                  <line
                    key={idx}
                    x1={cx}
                    y1={cy}
                    x2={edgeX}
                    y2={edgeY}
                    stroke="#CBD5E1"
                    strokeWidth="1.2"
                    className="stroke-slate-300 dark:stroke-slate-700"
                  />
                );
              })}

              {/* Dynamic Radar Area Polygon */}
              <polygon
                points={polygonPoints}
                fill="url(#radarAreaGradient)"
                stroke="#4F46E5"
                strokeWidth="2.5"
                className="transition-all duration-300 ease-out"
              />

              {/* Data Vertices & Interactive Hit Targets */}
              {dimensions.map((dim) => {
                const isHovered = hoveredDim?.key === dim.key;
                return (
                  <g key={dim.key}>
                    {/* Pulsing ring on hover */}
                    {isHovered && (
                      <circle
                        cx={dim.x}
                        cy={dim.y}
                        r="10"
                        fill={dim.color}
                        fillOpacity="0.25"
                      />
                    )}
                    {/* Vertex point */}
                    <circle
                      cx={dim.x}
                      cy={dim.y}
                      r={isHovered ? "5.5" : "4"}
                      fill="#FFFFFF"
                      stroke={dim.color}
                      strokeWidth="2.5"
                      className="cursor-pointer transition-transform duration-200"
                      onMouseEnter={() => setHoveredDim(dim)}
                      onMouseLeave={() => setHoveredDim(null)}
                    />
                  </g>
                );
              })}

              {/* Outer Axis Labels */}
              {dimensions.map((dim) => {
                const labelR = maxR + 24;
                const lx = cx + labelR * Math.cos(dim.angle);
                const ly = cy + labelR * Math.sin(dim.angle);
                const textAnchor =
                  Math.abs(lx - cx) < 10
                    ? "middle"
                    : lx > cx
                    ? "start"
                    : "end";

                return (
                  <text
                    key={`label-${dim.key}`}
                    x={lx}
                    y={ly}
                    textAnchor={textAnchor}
                    className="fill-slate-700 dark:fill-slate-300 font-mono text-[9px] font-bold"
                  >
                    {dim.label.split(" ")[0]} ({dim.score}%)
                  </text>
                );
              })}
            </svg>
          </div>
          <span className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            Polygon updates live as Chronometer travels through {simulatedDate}
          </span>
        </div>

        {/* Vector Dimension Breakdown Cards */}
        <div className="lg:col-span-6 flex flex-col gap-2.5">
          {dimensions.map((dim) => {
            const isHovered = hoveredDim?.key === dim.key;
            return (
              <div
                key={dim.key}
                onMouseEnter={() => setHoveredDim(dim)}
                onMouseLeave={() => setHoveredDim(null)}
                className={`flex items-center justify-between rounded-2xl border p-2.5 transition-all ${
                  isHovered
                    ? `${dim.borderColor} bg-white dark:bg-slate-900 shadow-xs ring-2 ring-indigo-500/10 dark:ring-indigo-500/30 scale-[1.01]`
                    : "border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: dim.color }}
                  />
                  <div>
                    <span className="block font-bold text-xs text-slate-900 dark:text-slate-100">
                      {dim.label}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      {dim.sublabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono">
                  <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/60 dark:border-slate-700 hidden sm:block">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${dim.score}%`,
                        backgroundColor: dim.color,
                      }}
                    />
                  </div>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-xs font-black ${dim.accentBg}`}
                  >
                    {dim.score}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
