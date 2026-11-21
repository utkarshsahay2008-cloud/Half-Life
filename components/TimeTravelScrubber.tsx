"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Calendar, FastForward, Clock, Sparkles } from "lucide-react";
import { RulerTicksPattern } from "./CardGraphics";

export interface TimeTravelMilestone {
  date: string; // YYYY-MM-DD
  label: string;
  sublabel?: string;
  epoch: number;
}

export const TIME_MILESTONES: TimeTravelMilestone[] = [
  { date: "2023-06-01", label: "JUN 2023", sublabel: "Baseline", epoch: new Date("2023-06-01").getTime() },
  { date: "2024-01-01", label: "JAN 2024", sublabel: "Initial Rate Cards", epoch: new Date("2024-01-01").getTime() },
  { date: "2024-04-17", label: "APR 2024", sublabel: "v1 Sunset & GPT-4 Turbo", epoch: new Date("2024-04-17").getTime() },
  { date: "2024-08-14", label: "AUG 2024", sublabel: "EU AI Act & Cache", epoch: new Date("2024-08-14").getTime() },
  { date: "2024-10-01", label: "OCT 2024", sublabel: "Board & Realignment", epoch: new Date("2024-10-01").getTime() },
  { date: "2025-06-01", label: "MID 2025", sublabel: "Next-Gen APIs", epoch: new Date("2025-06-01").getTime() },
  { date: "2026-11-20", label: "NOV 2026", sublabel: "Present Day", epoch: new Date("2026-11-20").getTime() },
];

const MIN_EPOCH = TIME_MILESTONES[0].epoch;
const MAX_EPOCH = TIME_MILESTONES[TIME_MILESTONES.length - 1].epoch;

interface TimeTravelScrubberProps {
  currentSimulatedDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
}

export function TimeTravelScrubber({
  currentSimulatedDate,
  onDateChange,
}: TimeTravelScrubberProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = React.useRef<number | null>(null);

  // Convert current date string to slider percentage (0 to 100)
  const currentEpoch = new Date(currentSimulatedDate).getTime() || MAX_EPOCH;
  const currentEpochRef = React.useRef(currentEpoch);
  currentEpochRef.current = currentEpoch;

  const sliderPercent = Math.min(
    100,
    Math.max(0, ((currentEpoch - MIN_EPOCH) / (MAX_EPOCH - MIN_EPOCH)) * 100)
  );

  const handleSliderInput = (val: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const epoch = MIN_EPOCH + (val / 100) * (MAX_EPOCH - MIN_EPOCH);
      const dateStr = new Date(epoch).toISOString().split("T")[0];
      onDateChange(dateStr);
    });
  };

  const handleMilestoneClick = (dateStr: string) => {
    setIsPlaying(false);
    onDateChange(dateStr);
  };

  // Continuous buttery smooth playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const cur = currentEpochRef.current;
      const nextEpoch = cur + (MAX_EPOCH - MIN_EPOCH) * 0.02;
      if (nextEpoch >= MAX_EPOCH) {
        onDateChange(TIME_MILESTONES[TIME_MILESTONES.length - 1].date);
        setIsPlaying(false);
      } else {
        const nextDateStr = new Date(nextEpoch).toISOString().split("T")[0];
        onDateChange(nextDateStr);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying, onDateChange]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const isCurrentToday = currentSimulatedDate === "2026-11-20";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/95 via-white/85 to-slate-50/70 p-5 sm:p-6 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
      <RulerTicksPattern />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  Time-Travel Decay Scrubber
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 border border-emerald-200/70">
                  Chronometer Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Scrub backwards to evaluate retrospective knowledge freshness, or advance to simulate factual decay.
              </p>
            </div>
          </div>

          {/* Current Date Display & Playback Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-1.5 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-400">Chronometer:</span>
              <span className="font-mono text-sm font-black text-slate-900 tracking-tight">
                {currentSimulatedDate}
              </span>
              {isCurrentToday ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  TODAY
                </span>
              ) : (
                <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-indigo-700 border border-indigo-200">
                  PAST ERA
                </span>
              )}
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition shadow-xs active:scale-95 ${
                isPlaying
                  ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20"
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
              }`}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? "Pause" : "Play Decay"}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                onDateChange("2023-06-01");
              }}
              title="Reset to 2023 Baseline"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Enhanced Range Slider Track with dynamic filled gradient */}
        <div className="relative pt-3 pb-1">
          <div className="relative flex items-center">
            {/* Custom Background Track */}
            <div className="absolute inset-x-0 h-2.5 rounded-full bg-slate-100 border border-slate-200/80" />
            
            {/* Active Colored Progress Fill */}
            <div
              className="absolute left-0 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-500 transition-all duration-75"
              style={{ width: `${sliderPercent}%` }}
            />

            {/* Native slider input */}
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={sliderPercent}
              onChange={(e) => handleSliderInput(parseFloat(e.target.value))}
              className="relative z-10 h-3 w-full cursor-pointer appearance-none bg-transparent accent-indigo-600 focus:outline-none"
            />
          </div>

          {/* Clickable Chronological Milestones */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 text-center">
            {TIME_MILESTONES.map((m) => {
              const isActive = currentSimulatedDate >= m.date;
              const isSelected = currentSimulatedDate === m.date;

              return (
                <button
                  key={m.date}
                  onClick={() => handleMilestoneClick(m.date)}
                  className={`group relative flex flex-col items-center gap-1 rounded-xl p-2 text-left transition-all ${
                    isSelected
                      ? "bg-white shadow-xs ring-1.5 ring-emerald-500 border border-emerald-200"
                      : isActive
                      ? "hover:bg-white/80"
                      : "opacity-60 hover:opacity-100 hover:bg-white/50"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      isSelected
                        ? "bg-emerald-500 ring-4 ring-emerald-100 scale-110"
                        : isActive
                        ? "bg-emerald-500/80"
                        : "bg-slate-300"
                    }`}
                  />
                  <div className="flex flex-col items-center">
                    <span
                      className={`font-mono text-[10px] whitespace-nowrap transition-colors ${
                        isSelected
                          ? "font-extrabold text-emerald-900"
                          : isActive
                          ? "font-semibold text-slate-800"
                          : "text-slate-500"
                      }`}
                    >
                      {m.label}
                    </span>
                    {m.sublabel && (
                      <span className="text-[9px] text-slate-400 font-medium truncate max-w-[90px]">
                        {m.sublabel}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
