"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Calendar, FastForward } from "lucide-react";
import { RulerTicksPattern } from "./CardGraphics";

export interface TimeTravelMilestone {
  date: string; // YYYY-MM-DD
  label: string;
  epoch: number;
}

export const TIME_MILESTONES: TimeTravelMilestone[] = [
  { date: "2023-06-01", label: "JUN 2023", epoch: new Date("2023-06-01").getTime() },
  { date: "2024-01-01", label: "JAN 2024", epoch: new Date("2024-01-01").getTime() },
  { date: "2024-04-17", label: "APR 2024 (v1 Sunset)", epoch: new Date("2024-04-17").getTime() },
  { date: "2024-08-14", label: "AUG 2024 (EU / Cache)", epoch: new Date("2024-08-14").getTime() },
  { date: "2024-10-01", label: "OCT 2024", epoch: new Date("2024-10-01").getTime() },
  { date: "2025-06-01", label: "MID 2025", epoch: new Date("2025-06-01").getTime() },
  { date: "2026-11-20", label: "NOV 2026 (Today)", epoch: new Date("2026-11-20").getTime() },
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

  // Convert current date string to slider percentage (0 to 100)
  const currentEpoch = new Date(currentSimulatedDate).getTime() || MAX_EPOCH;
  const sliderPercent = Math.min(
    100,
    Math.max(0, ((currentEpoch - MIN_EPOCH) / (MAX_EPOCH - MIN_EPOCH)) * 100)
  );

  const handleSliderInput = (val: number) => {
    const epoch = MIN_EPOCH + (val / 100) * (MAX_EPOCH - MIN_EPOCH);
    const dateStr = new Date(epoch).toISOString().split("T")[0];
    onDateChange(dateStr);
  };

  const handleMilestoneClick = (dateStr: string) => {
    setIsPlaying(false);
    onDateChange(dateStr);
  };

  // Playback timer to animate time forward
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const nextEpoch = currentEpoch + (MAX_EPOCH - MIN_EPOCH) * 0.025;
      if (nextEpoch >= MAX_EPOCH) {
        onDateChange(TIME_MILESTONES[TIME_MILESTONES.length - 1].date);
        setIsPlaying(false);
      } else {
        onDateChange(new Date(nextEpoch).toISOString().split("T")[0]);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, currentEpoch, onDateChange]);

  const isCurrentToday = currentSimulatedDate === "2026-11-20";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm backdrop-blur-md">
      <RulerTicksPattern />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  Time-Travel Decay Scrubber
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600">
                  Interactive Temporal Simulation
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Drag the chronometer forward to observe facts decaying in real time.
              </p>
            </div>
          </div>

          {/* Current Date Display & Playback Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 shadow-inner">
              <span className="text-[11px] font-medium text-slate-500">Simulated Point:</span>
              <span className="font-mono text-sm font-bold text-slate-900 tracking-tight">
                {currentSimulatedDate}
              </span>
              {isCurrentToday && (
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 font-mono text-[10px] font-bold text-emerald-700">
                  LIVE
                </span>
              )}
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition ${
                isPlaying
                  ? "bg-amber-500 text-white shadow-sm hover:bg-amber-600"
                  : "bg-slate-900 text-white shadow-sm hover:bg-slate-800"
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
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Range Slider Track */}
        <div className="relative pt-2 pb-1">
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={sliderPercent}
            onChange={(e) => handleSliderInput(parseFloat(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />

          {/* Clickable Milestones */}
          <div className="mt-3 flex justify-between gap-1 overflow-x-auto pb-1 text-center">
            {TIME_MILESTONES.map((m) => {
              const isActive = currentSimulatedDate >= m.date;
              const isSelected = currentSimulatedDate === m.date;

              return (
                <button
                  key={m.date}
                  onClick={() => handleMilestoneClick(m.date)}
                  className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-left transition ${
                    isSelected
                      ? "bg-emerald-50 ring-1 ring-emerald-300"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full transition-all ${
                      isSelected
                        ? "bg-emerald-600 scale-125 ring-2 ring-emerald-200"
                        : isActive
                        ? "bg-emerald-500/70"
                        : "bg-slate-300"
                    }`}
                  />
                  <span
                    className={`font-mono text-[10px] whitespace-nowrap transition ${
                      isSelected
                        ? "font-bold text-emerald-800"
                        : isActive
                        ? "font-medium text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
